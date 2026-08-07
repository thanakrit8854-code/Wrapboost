import 'server-only';

import { createAdminClient } from '@/lib/supabase/admin';

export interface OrderLineInput {
  productId: string;
  optionIds: string[];
  qty: number;
}

export interface CreateOrderInput {
  storeSlug: string;
  slotId: string;
  lines: OrderLineInput[];
  channel?: 'QR_CHECKIN' | 'QR_GATE' | 'QR_COUNTER' | 'WALK_IN';
  phone?: string | null;
  flightNo?: string | null;
  note?: string | null;
}

export type CreateOrderResult =
  | { ok: true; orderCode: string; accessToken: string; total: number }
  | { ok: false; code: string; message: string };

/**
 * Creates an order. Price and nutrition are recomputed here from the database;
 * whatever the browser sent is treated as a request, never as a fact.
 */
export async function createOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
  const db = createAdminClient();

  if (input.lines.length === 0) {
    return { ok: false, code: 'EMPTY_CART', message: 'ตะกร้าว่าง' };
  }

  const { data: store } = await db
    .from('stores')
    .select('id')
    .eq('slug', input.storeSlug)
    .eq('is_active', true)
    .single();

  if (!store) return { ok: false, code: 'STORE_NOT_FOUND', message: 'ไม่พบร้าน' };

  // ---- Reserve the slot first: this is the contended resource ----
  const { data: slot } = await db
    .from('pickup_slots')
    .select('id, slot_start, capacity, reserved_count, is_blocked')
    .eq('id', input.slotId)
    .eq('store_id', store.id)
    .single();

  if (!slot || slot.is_blocked) {
    return { ok: false, code: 'SLOT_UNAVAILABLE', message: 'ช่วงเวลานี้ไม่เปิดรับแล้ว' };
  }
  if (slot.reserved_count >= slot.capacity) {
    return { ok: false, code: 'SLOT_FULL', message: 'ช่วงเวลานี้เต็มแล้ว' };
  }

  // Optimistic lock: only succeeds if reserved_count is still what we just read.
  const { data: reserved } = await db
    .from('pickup_slots')
    .update({ reserved_count: slot.reserved_count + 1 })
    .eq('id', slot.id)
    .eq('reserved_count', slot.reserved_count)
    .select('id')
    .maybeSingle();

  if (!reserved) {
    return { ok: false, code: 'SLOT_FULL', message: 'มีคนจองช่วงเวลานี้ไปพอดี ลองเวลาถัดไป' };
  }

  async function releaseSlot() {
    await db.rpc('noop').catch(() => undefined);
    await db
      .from('pickup_slots')
      .update({ reserved_count: slot!.reserved_count })
      .eq('id', slot!.id);
  }

  // ---- Recompute every figure from the database ----
  const productIds = [...new Set(input.lines.map((l) => l.productId))];
  const optionIds = [...new Set(input.lines.flatMap((l) => l.optionIds))];

  const { data: products } = await db
    .from('products')
    .select('id, name_th, base_price, base_kcal, base_protein_g, is_available')
    .in('id', productIds);

  const { data: options } = optionIds.length
    ? await db
        .from('options')
        .select('id, name_th, price_delta, kcal_delta, protein_delta_g, is_available')
        .in('id', optionIds)
    : { data: [] };

  const productMap = new Map((products ?? []).map((p) => [p.id, p]));
  const optionMap = new Map((options ?? []).map((o) => [o.id, o]));

  for (const line of input.lines) {
    const product = productMap.get(line.productId);
    if (!product || !product.is_available) {
      await releaseSlot();
      return { ok: false, code: 'PRODUCT_UNAVAILABLE', message: 'มีรายการที่ไม่พร้อมขายแล้ว' };
    }
    for (const id of line.optionIds) {
      const option = optionMap.get(id);
      if (!option || !option.is_available) {
        await releaseSlot();
        return { ok: false, code: 'OPTION_UNAVAILABLE', message: 'วัตถุดิบบางอย่างหมดแล้ว' };
      }
    }
  }

  let subtotal = 0;
  let totalKcal = 0;
  let totalProtein = 0;

  const computed = input.lines.map((line) => {
    const product = productMap.get(line.productId)!;
    const chosen = line.optionIds.map((id) => optionMap.get(id)!);

    const unitPrice = chosen.reduce((s, o) => s + o.price_delta, product.base_price);
    const unitKcal = chosen.reduce((s, o) => s + o.kcal_delta, product.base_kcal);
    const unitProtein = chosen.reduce(
      (s, o) => s + Number(o.protein_delta_g),
      Number(product.base_protein_g),
    );

    subtotal += unitPrice * line.qty;
    totalKcal += unitKcal * line.qty;
    totalProtein += unitProtein * line.qty;

    return { product, chosen, unitPrice, unitKcal, unitProtein, qty: line.qty };
  });

  // ---- Create the order ----
  const { data: codeRow } = await db.rpc('generate_order_code');
  const orderCode = (codeRow as string | null) ?? `WB${Math.floor(1000 + Math.random() * 9000)}`;

  const { data: order, error: orderError } = await db
    .from('orders')
    .insert({
      store_id: store.id,
      order_code: orderCode,
      status: 'PENDING_PAYMENT',
      channel: input.channel ?? 'QR_CHECKIN',
      pickup_slot_id: slot.id,
      pickup_at: slot.slot_start,
      flight_no: input.flightNo ?? null,
      subtotal,
      discount: 0,
      total: subtotal,
      total_kcal: totalKcal,
      total_protein_g: Number(totalProtein.toFixed(1)),
      note: input.note ?? null,
    })
    .select('id, order_code, access_token, total')
    .single();

  if (orderError || !order) {
    await releaseSlot();
    return { ok: false, code: 'ORDER_FAILED', message: 'สร้างออร์เดอร์ไม่สำเร็จ' };
  }

  for (const line of computed) {
    const { data: item } = await db
      .from('order_items')
      .insert({
        order_id: order.id,
        product_id: line.product.id,
        name_snapshot: line.product.name_th,
        unit_price_snapshot: line.unitPrice,
        qty: line.qty,
        line_total: line.unitPrice * line.qty,
        kcal_snapshot: line.unitKcal,
        protein_snapshot: Number(line.unitProtein.toFixed(1)),
      })
      .select('id')
      .single();

    if (item && line.chosen.length > 0) {
      await db.from('order_item_options').insert(
        line.chosen.map((o) => ({
          order_item_id: item.id,
          option_id: o.id,
          name_snapshot: o.name_th,
          price_delta_snapshot: o.price_delta,
          kcal_delta_snapshot: o.kcal_delta,
          protein_delta_snapshot: Number(o.protein_delta_g),
        })),
      );
    }
  }

  await db.from('order_events').insert({
    order_id: order.id,
    from_status: 'DRAFT',
    to_status: 'PENDING_PAYMENT',
    actor: 'CUSTOMER',
  });

  return {
    ok: true,
    orderCode: order.order_code,
    accessToken: order.access_token,
    total: order.total,
  };
}
