import 'server-only';

import { createAdminClient } from '@/lib/supabase/admin';

export interface OrderView {
  orderCode: string;
  status: string;
  pickupAt: string | null;
  flightNo: string | null;
  total: number;
  totalKcal: number;
  totalProtein: number;
  items: { name: string; qty: number; lineTotal: number; options: string[] }[];
}

/**
 * Order code alone is guessable, so the access token is required as well.
 */
export async function getOrderByCode(code: string, token: string): Promise<OrderView | null> {
  const db = createAdminClient();

  const { data: order } = await db
    .from('orders')
    .select(
      `order_code, status, pickup_at, flight_no, total, total_kcal, total_protein_g,
       order_items ( name_snapshot, qty, line_total,
                     order_item_options ( name_snapshot ) )`,
    )
    .eq('order_code', code)
    .eq('access_token', token)
    .maybeSingle();

  if (!order) return null;

  return {
    orderCode: order.order_code,
    status: order.status,
    pickupAt: order.pickup_at,
    flightNo: order.flight_no,
    total: order.total,
    totalKcal: order.total_kcal,
    totalProtein: Number(order.total_protein_g),
    items: (order.order_items ?? []).map((i) => ({
      name: i.name_snapshot,
      qty: i.qty,
      lineTotal: i.line_total,
      options: (i.order_item_options ?? []).map((o) => o.name_snapshot),
    })),
  };
}
