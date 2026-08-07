-- The seed produced slots seven hours early: now() was converted to Bangkok
-- local time and then stored as if it were UTC. Rebuild them correctly.
--
-- Demo note: the real counter opens 06:00-09:00 and 16:00-19:00, but the
-- prototype generates 06:00-20:00 so a pitch at any hour still has slots.

delete from pickup_slots
where id not in (select pickup_slot_id from orders where pickup_slot_id is not null);

insert into pickup_slots (store_id, slot_start, capacity)
select
  '11111111-1111-1111-1111-111111111111',
  slot,
  8
from generate_series(
  date_trunc('day', (now() at time zone 'Asia/Bangkok')) at time zone 'Asia/Bangkok',
  (date_trunc('day', (now() at time zone 'Asia/Bangkok')) + interval '7 days') at time zone 'Asia/Bangkok',
  interval '5 minutes'
) as slot
where extract(hour from (slot at time zone 'Asia/Bangkok')) between 6 and 19
on conflict (store_id, slot_start) do nothing;
