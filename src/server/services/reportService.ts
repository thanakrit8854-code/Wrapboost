import 'server-only';

import { createAdminClient } from '@/lib/supabase/admin';

export interface DailyReport {
  date: string;
  revenue: number;
  orderCount: number;
  avgTicket: number;
  medianAssemblySeconds: number | null;
  under3MinRate: number | null;
  noShowCount: number;
  byHour: { hour: number; orders: number; revenue: number }[];
  byChannel: { channel: string; orders: number }[];
  topOptions: { name: string; count: number }[];
  totalProtein: number;
}

const PAID_STATUSES = ['PAID', 'QUEUED', 'PREPARING', 'READY', 'COLLECTED'];

export async function getDailyReport(
  storeSlug: string,
  dateISO?: string,
): Promise<DailyReport | null> {
  const db = createAdminClient();

  const { data: store } = await db.from('stores').select('id').eq('slug', storeSlug).maybeSingle();

  if (!store) return null;

  const day = dateISO ? new Date(dateISO) : new Date();
  const start = new Date(day);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  const { data: orders } = await db
    .from('orders')
    .select('id, status, channel, total, total_protein_g, paid_at, ready_at, created_at')
    .eq('store_id', store.id)
    .gte('created_at', start.toISOString())
    .lt('created_at', end.toISOString());

  const all = orders ?? [];
  const paid = all.filter((o) => PAID_STATUSES.includes(o.status));

  const revenue = paid.reduce((sum, o) => sum + o.total, 0);
  const totalProtein = paid.reduce((sum, o) => sum + Number(o.total_protein_g), 0);

  const durations = paid
    .filter((o) => o.paid_at && o.ready_at)
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

  const under3 =
    durations.length === 0
      ? null
      : Math.round((durations.filter((s) => s <= 180).length / durations.length) * 100);

  const hourMap = new Map<number, { orders: number; revenue: number }>();
  for (const o of paid) {
    const hour = new Date(o.created_at).getHours();
    const entry = hourMap.get(hour) ?? { orders: 0, revenue: 0 };
    hourMap.set(hour, { orders: entry.orders + 1, revenue: entry.revenue + o.total });
  }

  const channelMap = new Map<string, number>();
  for (const o of paid) {
    channelMap.set(o.channel, (channelMap.get(o.channel) ?? 0) + 1);
  }

  const paidIds = paid.map((o) => o.id);
  const { data: itemRows } = paidIds.length
    ? await db.from('order_items').select('id').in('order_id', paidIds)
    : { data: [] };

  const itemIds = (itemRows ?? []).map((i) => i.id);
  const { data: optionRows } = itemIds.length
    ? await db.from('order_item_options').select('name_snapshot').in('order_item_id', itemIds)
    : { data: [] };

  const optionMap = new Map<string, number>();
  for (const o of optionRows ?? []) {
    optionMap.set(o.name_snapshot, (optionMap.get(o.name_snapshot) ?? 0) + 1);
  }

  return {
    date: start.toISOString().slice(0, 10),
    revenue,
    orderCount: paid.length,
    avgTicket: paid.length ? Math.round(revenue / paid.length) : 0,
    medianAssemblySeconds: median,
    under3MinRate: under3,
    noShowCount: all.filter((o) => o.status === 'NO_SHOW').length,
    byHour: [...hourMap.entries()]
      .map(([hour, v]) => ({ hour, ...v }))
      .sort((a, b) => a.hour - b.hour),
    byChannel: [...channelMap.entries()]
      .map(([channel, orders]) => ({ channel, orders }))
      .sort((a, b) => b.orders - a.orders),
    topOptions: [...optionMap.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8),
    totalProtein: Math.round(totalProtein),
  };
}
