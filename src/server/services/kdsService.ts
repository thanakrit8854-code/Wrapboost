import 'server-only';

import { createAdminClient } from '@/lib/supabase/admin';

export interface KdsItem {
  name: string;
  qty: number;
  options: string[];
}

export interface KdsOrder {
  id: string;
  orderCode: string;
  status: 'QUEUED' | 'PREPARING' | 'READY';
  pickupAt: string | null;
  paidAt: string | null;
  readyAt: string | null;
  flightNo: string | null;
  items: KdsItem[];
}

export interface KdsBoard {
  queued: KdsOrder[];
  preparing: KdsOrder[];
  ready: KdsOrder[];
  stats: {
    openCount: number;
    /** Median seconds from paid to ready, today. The "under three minutes" proof. */
    medianAssemblySeconds: number | null;
    completedToday: number;
  };
}

export async function getKdsBoard(storeSlug: string): Promise<KdsBoard | null> {
  const db = createAdminClient();

  const { data: store } = await db.from('stores').select('id').eq('slug', storeSlug).maybeSingle();

  if (!store) return null;

  const { data: rows } = await db
    .from('orders')
    .select(
      `id, order_code, status, pickup_at, paid_at, ready_at, flight_no,
       order_items ( name_snapshot, qty, order_item_options ( name_snapshot ) )`,
    )
    .eq('store_id', store.id)
    .in('status', ['QUEUED', 'PREPARING', 'READY'])
    .order('pickup_at', { ascending: true });

  const orders: KdsOrder[] = (rows ?? []).map((o) => ({
    id: o.id,
    orderCode: o.order_code,
    status: o.status as KdsOrder['status'],
    pickupAt: o.pickup_at,
    paidAt: o.paid_at,
    readyAt: o.ready_at,
    flightNo: o.flight_no,
    items: (o.order_items ?? []).map((i) => ({
      name: i.name_snapshot,
      qty: i.qty,
      options: (i.order_item_options ?? []).map((x) => x.name_snapshot),
    })),
  }));

  // Assembly times for orders finished today
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const { data: done } = await db
    .from('orders')
    .select('paid_at, ready_at')
    .eq('store_id', store.id)
    .not('ready_at', 'is', null)
    .not('paid_at', 'is', null)
    .gte('ready_at', startOfDay.toISOString());

  const durations = (done ?? [])
    .map((o) => (new Date(o.ready_at!).getTime() - new Date(o.paid_at!).getTime()) / 1000)
    .filter((s) => s > 0)
    .sort((a, b) => a - b);

  const median =
    durations.length === 0
      ? null
      : Math.round(
          durations.length % 2 === 1
            ? durations[(durations.length - 1) / 2]
            : (durations[durations.length / 2 - 1] + durations[durations.length / 2]) / 2,
        );

  return {
    queued: orders.filter((o) => o.status === 'QUEUED'),
    preparing: orders.filter((o) => o.status === 'PREPARING'),
    ready: orders.filter((o) => o.status === 'READY'),
    stats: {
      openCount: orders.length,
      medianAssemblySeconds: median,
      completedToday: durations.length,
    },
  };
}

const ALLOWED: Record<string, string[]> = {
  QUEUED: ['PREPARING'],
  PREPARING: ['READY'],
  READY: ['COLLECTED'],
};

export async function advanceOrder(
  orderId: string,
  toStatus: string,
): Promise<{ ok: boolean; message?: string }> {
  const db = createAdminClient();

  const { data: order } = await db
    .from('orders')
    .select('id, status')
    .eq('id', orderId)
    .maybeSingle();

  if (!order) return { ok: false, message: 'ไม่พบออร์เดอร์' };

  if (!ALLOWED[order.status]?.includes(toStatus)) {
    return { ok: false, message: `เปลี่ยนจาก ${order.status} เป็น ${toStatus} ไม่ได้` };
  }

  const now = new Date().toISOString();
  const patch: Record<string, string> = { status: toStatus };

  if (toStatus === 'READY') patch.ready_at = now;
  if (toStatus === 'COLLECTED') patch.collected_at = now;

  await db.from('orders').update(patch).eq('id', orderId);

  await db.from('order_events').insert({
    order_id: orderId,
    from_status: order.status,
    to_status: toStatus,
    actor: 'STAFF',
  });

  return { ok: true };
}
