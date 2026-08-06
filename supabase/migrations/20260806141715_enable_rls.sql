-- WrapBoost RLS: deny by default, then open only the public menu.
-- Everything about orders, customers and staff is reachable only through
-- server-side routes that use the secret key and verify access_token.

-- ── Enable RLS on every table ────────────────────────────
alter table stores               enable row level security;
alter table operating_hours      enable row level security;
alter table pickup_slots         enable row level security;
alter table categories           enable row level security;
alter table products             enable row level security;
alter table option_groups        enable row level security;
alter table options              enable row level security;
alter table product_option_groups enable row level security;
alter table customers            enable row level security;
alter table orders               enable row level security;
alter table order_items          enable row level security;
alter table order_item_options   enable row level security;
alter table payments             enable row level security;
alter table order_events         enable row level security;
alter table staff_users          enable row level security;
alter table prep_plans           enable row level security;
alter table prep_item_counts     enable row level security;
alter table audit_logs           enable row level security;

-- ── Public read: the menu a traveller sees after scanning ─
create policy "public read active stores"
  on stores for select to anon, authenticated
  using (is_active = true);

create policy "public read operating hours"
  on operating_hours for select to anon, authenticated
  using (true);

create policy "public read categories"
  on categories for select to anon, authenticated
  using (true);

create policy "public read products"
  on products for select to anon, authenticated
  using (true);

create policy "public read option groups"
  on option_groups for select to anon, authenticated
  using (true);

create policy "public read options"
  on options for select to anon, authenticated
  using (true);

create policy "public read product option groups"
  on product_option_groups for select to anon, authenticated
  using (true);

create policy "public read open slots"
  on pickup_slots for select to anon, authenticated
  using (is_blocked = false);

-- No policies for: customers, orders, order_items, order_item_options,
-- payments, order_events, staff_users, prep_plans, prep_item_counts,
-- audit_logs.  With RLS enabled and no policy, anon and authenticated
-- roles are denied every operation.  The service role bypasses RLS and is
-- used only by server-side code.
