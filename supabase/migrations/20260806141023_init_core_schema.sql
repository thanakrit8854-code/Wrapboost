-- WrapBoost core schema: stores, slots, menu
-- Money is stored as INTEGER satang (15000 = 150.00 THB). Never use float.

create extension if not exists "pgcrypto";

-- ── Enums ────────────────────────────────────────────────
create type product_type as enum ('WRAP', 'DRINK', 'COMBO', 'SIDE');
create type select_type  as enum ('SINGLE', 'MULTI');

-- ── Stores ───────────────────────────────────────────────
create table stores (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique,
  name          text not null,
  airport_code  text not null,
  terminal_zone text,
  timezone      text not null default 'Asia/Bangkok',
  is_active     boolean not null default true,
  created_at    timestamptz not null default now()
);

create table operating_hours (
  id          uuid primary key default gen_random_uuid(),
  store_id    uuid not null references stores(id) on delete cascade,
  day_of_week smallint not null check (day_of_week between 0 and 6),
  open_time   time not null,
  close_time  time not null
);

-- ── Pickup slots ─────────────────────────────────────────
create table pickup_slots (
  id             uuid primary key default gen_random_uuid(),
  store_id       uuid not null references stores(id) on delete cascade,
  slot_start     timestamptz not null,
  capacity       smallint not null default 8 check (capacity >= 0),
  reserved_count smallint not null default 0 check (reserved_count >= 0),
  is_blocked     boolean not null default false,
  unique (store_id, slot_start),
  check (reserved_count <= capacity)
);

-- ── Menu ─────────────────────────────────────────────────
create table categories (
  id         uuid primary key default gen_random_uuid(),
  store_id   uuid not null references stores(id) on delete cascade,
  name_th    text not null,
  name_en    text not null,
  sort_order smallint not null default 0
);

create table products (
  id                    uuid primary key default gen_random_uuid(),
  category_id           uuid not null references categories(id) on delete cascade,
  type                  product_type not null,
  name_th               text not null,
  name_en               text not null,
  description_th        text,
  base_price            integer not null check (base_price >= 0),
  base_kcal             integer not null default 0 check (base_kcal >= 0),
  base_protein_g        numeric(5,1) not null default 0 check (base_protein_g >= 0),
  image_url             text,
  prep_seconds_estimate smallint not null default 150,
  is_available          boolean not null default true,
  sort_order            smallint not null default 0,
  created_at            timestamptz not null default now()
);

create table option_groups (
  id          uuid primary key default gen_random_uuid(),
  name_th     text not null,
  name_en     text not null,
  select_type select_type not null default 'SINGLE',
  min_select  smallint not null default 0 check (min_select >= 0),
  max_select  smallint not null default 1,
  check (max_select >= min_select)
);

create table options (
  id              uuid primary key default gen_random_uuid(),
  option_group_id uuid not null references option_groups(id) on delete cascade,
  name_th         text not null,
  name_en         text not null,
  price_delta     integer not null default 0,
  kcal_delta      integer not null default 0,
  protein_delta_g numeric(5,1) not null default 0,
  allergen_tags   text[] not null default '{}',
  is_available    boolean not null default true,
  sort_order      smallint not null default 0
);

create table product_option_groups (
  product_id      uuid not null references products(id) on delete cascade,
  option_group_id uuid not null references option_groups(id) on delete cascade,
  is_required     boolean not null default false,
  sort_order      smallint not null default 0,
  primary key (product_id, option_group_id)
);

-- ── Indexes ──────────────────────────────────────────────
create index idx_products_category   on products(category_id, is_available);
create index idx_options_group        on options(option_group_id, is_available);
create index idx_slots_store_start    on pickup_slots(store_id, slot_start);
create index idx_categories_store     on categories(store_id, sort_order);
