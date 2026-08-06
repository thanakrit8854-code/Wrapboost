-- WrapBoost: customers, orders, payments, staff, prep, audit

-- ── Enums ────────────────────────────────────────────────
create type order_status as enum (
  'DRAFT', 'PENDING_PAYMENT', 'PAID', 'QUEUED', 'PREPARING',
  'READY', 'COLLECTED', 'CANCELLED', 'EXPIRED', 'NO_SHOW', 'REFUNDED'
);
create type order_channel  as enum ('QR_CHECKIN', 'QR_GATE', 'QR_COUNTER', 'WALK_IN');
create type payment_status as enum ('PENDING', 'SUCCEEDED', 'FAILED', 'REFUNDED');
create type staff_role     as enum ('STAFF', 'MANAGER', 'ADMIN');
create type actor_type     as enum ('CUSTOMER', 'STAFF', 'SYSTEM');

-- ── Customers (lightweight, no password) ─────────────────
create table customers (
  id                uuid primary key default gen_random_uuid(),
  device_hash       text unique,
  phone_e164        text,
  display_name      text,
  consent_marketing boolean not null default false,
  created_at        timestamptz not null default now()
);

-- ── Orders ───────────────────────────────────────────────
create table orders (
  id              uuid primary key default gen_random_uuid(),
  store_id        uuid not null references stores(id),
  customer_id     uuid references customers(id) on delete set null,
  order_code      text not null unique,
  access_token     text not null default encode(extensions.gen_random_bytes(16), 'hex'),
  status          order_status not null default 'DRAFT',
  channel         order_channel not null default 'QR_CHECKIN',
  pickup_slot_id  uuid references pickup_slots(id),
  pickup_at       timestamptz,
  flight_no       text,
  boarding_time   timestamptz,
  subtotal        integer not null default 0 check (subtotal >= 0),
  discount        integer not null default 0 check (discount >= 0),
  total           integer not null default 0 check (total >= 0),
  total_kcal      integer not null default 0,
  total_protein_g numeric(6,1) not null default 0,
  note            text,
  paid_at         timestamptz,
  ready_at        timestamptz,
  collected_at    timestamptz,
  created_at      timestamptz not null default now()
);

create table order_items (
  id                  uuid primary key default gen_random_uuid(),
  order_id            uuid not null references orders(id) on delete cascade,
  product_id          uuid references products(id),
  name_snapshot       text not null,
  unit_price_snapshot integer not null,
  qty                 smallint not null default 1 check (qty > 0),
  line_total          integer not null,
  kcal_snapshot       integer not null default 0,
  protein_snapshot    numeric(5,1) not null default 0
);

create table order_item_options (
  id                     uuid primary key default gen_random_uuid(),
  order_item_id          uuid not null references order_items(id) on delete cascade,
  option_id              uuid references options(id),
  name_snapshot          text not null,
  price_delta_snapshot   integer not null default 0,
  kcal_delta_snapshot    integer not null default 0,
  protein_delta_snapshot numeric(5,1) not null default 0
);

-- ── Payments ─────────────────────────────────────────────
create table payments (
  id              uuid primary key default gen_random_uuid(),
  order_id        uuid not null references orders(id) on delete cascade,
  provider        text not null default 'MOCK',
  amount          integer not null check (amount >= 0),
  status          payment_status not null default 'PENDING',
  provider_ref    text,
  qr_payload      text,
  idempotency_key text unique,
  paid_at         timestamptz,
  created_at      timestamptz not null default now()
);

-- ── Order timeline ───────────────────────────────────────
create table order_events (
  id          uuid primary key default gen_random_uuid(),
  order_id    uuid not null references orders(id) on delete cascade,
  from_status order_status,
  to_status   order_status not null,
  actor       actor_type not null default 'SYSTEM',
  actor_id    uuid,
  created_at  timestamptz not null default now()
);

-- ── Staff ────────────────────────────────────────────────
create table staff_users (
  id            uuid primary key default gen_random_uuid(),
  store_id      uuid not null references stores(id) on delete cascade,
  auth_user_id  uuid unique,
  name          text not null,
  role          staff_role not null default 'STAFF',
  is_active     boolean not null default true,
  created_at    timestamptz not null default now()
);

-- ── Daily prep (Z1 evidence) ─────────────────────────────
create table prep_plans (
  id         uuid primary key default gen_random_uuid(),
  store_id   uuid not null references stores(id) on delete cascade,
  plan_date  date not null,
  created_by uuid references staff_users(id),
  created_at timestamptz not null default now(),
  unique (store_id, plan_date)
);

create table prep_item_counts (
  id            uuid primary key default gen_random_uuid(),
  prep_plan_id  uuid not null references prep_plans(id) on delete cascade,
  option_id     uuid not null references options(id),
  planned_qty   integer not null default 0,
  actual_qty    integer,
  remaining_qty integer
);

-- ── Audit ────────────────────────────────────────────────
create table audit_logs (
  id         uuid primary key default gen_random_uuid(),
  actor_id   uuid,
  action     text not null,
  entity     text not null,
  entity_id  uuid,
  payload    jsonb,
  created_at timestamptz not null default now()
);

-- ── Order code generator: WB + 4 digits ──────────────────
create or replace function generate_order_code()
returns text language plpgsql as $$
declare
  candidate text;
begin
  loop
    candidate := 'WB' || lpad((floor(random() * 10000))::int::text, 4, '0');
    exit when not exists (select 1 from orders where order_code = candidate);
  end loop;
  return candidate;
end;
$$;

-- ── Indexes ──────────────────────────────────────────────
create index idx_orders_store_status on orders(store_id, status, pickup_at);
create index idx_orders_code         on orders(order_code);
create index idx_order_items_order   on order_items(order_id);
create index idx_order_events_order  on order_events(order_id, created_at);
create index idx_payments_order      on payments(order_id);
