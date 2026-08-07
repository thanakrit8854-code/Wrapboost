import { createClient } from '@/lib/supabase/server';

export interface AvailableSlot {
  id: string;
  slotStart: string;
  remaining: number;
}

/**
 * Slots a traveller can still book: not blocked, not full, and far enough
 * ahead that the counter can actually finish the order.
 */
export async function getAvailableSlots(
  storeSlug: string,
  leadSeconds = 300,
  limit = 24,
): Promise<AvailableSlot[]> {
  const supabase = await createClient();

  const { data: store } = await supabase
    .from('stores')
    .select('id')
    .eq('slug', storeSlug)
    .eq('is_active', true)
    .single();

  if (!store) return [];

  const earliest = new Date(Date.now() + leadSeconds * 1000).toISOString();

  const { data, error } = await supabase
    .from('pickup_slots')
    .select('id, slot_start, capacity, reserved_count')
    .eq('store_id', store.id)
    .eq('is_blocked', false)
    .gte('slot_start', earliest)
    .order('slot_start')
    .limit(limit * 3);

  if (error || !data) return [];

  return data
    .filter((s) => s.reserved_count < s.capacity)
    .slice(0, limit)
    .map((s) => ({
      id: s.id,
      slotStart: s.slot_start,
      remaining: s.capacity - s.reserved_count,
    }));
}
