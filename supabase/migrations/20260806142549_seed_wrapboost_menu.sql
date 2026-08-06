-- WrapBoost seed data.
-- WARNING: every price and nutrition value below is an ESTIMATE placed here
-- so the prototype can run. Replace with lab-verified figures before launch.

-- ── Store ────────────────────────────────────────────────
insert into stores (id, slug, name, airport_code, terminal_zone, timezone)
values (
  '11111111-1111-1111-1111-111111111111',
  'cei-domestic',
  'WrapBoost CEI Domestic',
  'CEI',
  'Domestic Departure Hall, post-security',
  'Asia/Bangkok'
);

-- Two peak banks per day, every day (from the group workbook)
insert into operating_hours (store_id, day_of_week, open_time, close_time)
select '11111111-1111-1111-1111-111111111111', d, t.open_time, t.close_time
from generate_series(0, 6) as d,
     (values ('06:00'::time, '09:00'::time), ('16:00'::time, '19:00'::time)) as t(open_time, close_time);

-- ── Categories ───────────────────────────────────────────
insert into categories (id, store_id, name_th, name_en, sort_order) values
  ('22222222-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'แรปสด', 'Fresh Wraps', 1),
  ('22222222-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'เครื่องดื่มฟังก์ชัน', 'Functional Drinks', 2),
  ('22222222-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 'เซ็ตคอมโบ', 'Combo Sets', 3);

-- ── Products (price in satang) ───────────────────────────
insert into products (id, category_id, type, name_th, name_en, description_th, base_price, base_kcal, base_protein_g, prep_seconds_estimate, sort_order) values
  ('33333333-0000-0000-0000-000000000001', '22222222-0000-0000-0000-000000000001', 'WRAP',
   'แรปสั่งประกอบ', 'Build Your Own Wrap', 'เลือกแป้ง โปรตีน ผัก และซอสได้เอง ประกอบสดใน 3 นาที',
   9900, 180, 5.0, 150, 1),
  ('33333333-0000-0000-0000-000000000002', '22222222-0000-0000-0000-000000000002', 'DRINK',
   'เครื่องดื่มปั่นเสริมฟังก์ชัน', 'Functional Blend', 'เลือกฐานผลไม้หรือผัก แล้วเติม booster ที่ต้องการ',
   7900, 120, 2.0, 90, 1),
  ('33333333-0000-0000-0000-000000000003', '22222222-0000-0000-0000-000000000003', 'COMBO',
   'คอมโบ แรป + เครื่องดื่ม', 'Wrap + Drink Combo', 'ประหยัด 20 บาท เมื่อสั่งคู่',
   15800, 300, 7.0, 180, 1);

-- ── Option groups ────────────────────────────────────────
insert into option_groups (id, name_th, name_en, select_type, min_select, max_select) values
  ('44444444-0000-0000-0000-000000000001', 'เลือกแผ่นแป้ง',   'Choose your base',    'SINGLE', 1, 1),
  ('44444444-0000-0000-0000-000000000002', 'เลือกโปรตีน',      'Choose your protein', 'SINGLE', 1, 1),
  ('44444444-0000-0000-0000-000000000003', 'เลือกผัก',         'Choose vegetables',   'MULTI',  0, 4),
  ('44444444-0000-0000-0000-000000000004', 'เลือกซอส',         'Choose your sauce',   'SINGLE', 0, 1),
  ('44444444-0000-0000-0000-000000000005', 'เลือกฐานเครื่องดื่ม','Choose drink base',  'SINGLE', 1, 1),
  ('44444444-0000-0000-0000-000000000006', 'เลือก Booster',    'Choose your booster', 'SINGLE', 0, 1);

-- ── Options: wrap base ───────────────────────────────────
insert into options (option_group_id, name_th, name_en, price_delta, kcal_delta, protein_delta_g, allergen_tags, sort_order) values
  ('44444444-0000-0000-0000-000000000001', 'แป้งโฮลวีต',  'Whole-wheat tortilla', 0,    0,  0.0, '{gluten}', 1),
  ('44444444-0000-0000-0000-000000000001', 'แป้งผักโขม',  'Spinach tortilla',     1000, 10, 1.0, '{gluten}', 2);

-- ── Options: protein ─────────────────────────────────────
insert into options (option_group_id, name_th, name_en, price_delta, kcal_delta, protein_delta_g, allergen_tags, sort_order) values
  ('44444444-0000-0000-0000-000000000002', 'อกไก่ย่าง',   'Grilled chicken breast', 3500, 130, 26.0, '{}',     1),
  ('44444444-0000-0000-0000-000000000002', 'ทูน่า',       'Tuna',                   4000, 120, 24.0, '{fish}', 2),
  ('44444444-0000-0000-0000-000000000002', 'เต้าหู้ย่าง', 'Grilled tofu',           2500, 110, 14.0, '{soy}',  3);

-- ── Options: vegetables ──────────────────────────────────
insert into options (option_group_id, name_th, name_en, price_delta, kcal_delta, protein_delta_g, sort_order) values
  ('44444444-0000-0000-0000-000000000003', 'ผักกาดแก้ว',  'Lettuce',        0, 5,  0.3, 1),
  ('44444444-0000-0000-0000-000000000003', 'มะเขือเทศ',   'Tomato',         0, 8,  0.4, 2),
  ('44444444-0000-0000-0000-000000000003', 'แตงกวา',      'Cucumber',       0, 5,  0.3, 3),
  ('44444444-0000-0000-0000-000000000003', 'หอมแดงเชียงราย','Chiang Rai shallot', 0, 10, 0.4, 4),
  ('44444444-0000-0000-0000-000000000003', 'แครอทฝอย',    'Shredded carrot', 0, 12, 0.3, 5);

-- ── Options: sauce ───────────────────────────────────────
insert into options (option_group_id, name_th, name_en, price_delta, kcal_delta, protein_delta_g, allergen_tags, sort_order) values
  ('44444444-0000-0000-0000-000000000004', 'โยเกิร์ตสมุนไพร', 'Herb yogurt',   0, 45, 1.5, '{dairy}', 1),
  ('44444444-0000-0000-0000-000000000004', 'งาญี่ปุ่น',      'Sesame',         0, 60, 1.0, '{nut}',   2),
  ('44444444-0000-0000-0000-000000000004', 'พริกไทยดำ',      'Black pepper',   0, 25, 0.5, '{}',      3),
  ('44444444-0000-0000-0000-000000000004', 'ไม่ใส่ซอส',      'No sauce',       0, 0,  0.0, '{}',      4);

-- ── Options: drink base ──────────────────────────────────
insert into options (option_group_id, name_th, name_en, price_delta, kcal_delta, protein_delta_g, sort_order) values
  ('44444444-0000-0000-0000-000000000005', 'เบอร์รี่รวม',  'Mixed berry',    0, 0,  0.0, 1),
  ('44444444-0000-0000-0000-000000000005', 'มะม่วงน้ำดอกไม้','Mango',        0, 20, 0.0, 2),
  ('44444444-0000-0000-0000-000000000005', 'กรีนสมูทตี้',  'Green smoothie', 0, -20, 0.5, 3);

-- ── Options: booster (the terminal's only functional counter) ─
insert into options (option_group_id, name_th, name_en, price_delta, kcal_delta, protein_delta_g, allergen_tags, sort_order) values
  ('44444444-0000-0000-0000-000000000006', 'เวย์โปรตีน',      'Whey protein',      4500, 110, 24.0, '{dairy}', 1),
  ('44444444-0000-0000-0000-000000000006', 'มารีนคอลลาเจน',  'Marine collagen',   5000, 40,  10.0, '{fish}',  2),
  ('44444444-0000-0000-0000-000000000006', 'วิตามินซี + บีรวม','Vitamin C + B-complex', 3000, 15, 0.0, '{}',  3),
  ('44444444-0000-0000-0000-000000000006', 'ไฟเบอร์',        'Fibre',             3000, 25,  0.0, '{}',      4),
  ('44444444-0000-0000-0000-000000000006', 'ไม่เติม booster','No booster',        0,    0,   0.0, '{}',      5);

-- ── Link products to option groups ───────────────────────
insert into product_option_groups (product_id, option_group_id, is_required, sort_order) values
  ('33333333-0000-0000-0000-000000000001', '44444444-0000-0000-0000-000000000001', true,  1),
  ('33333333-0000-0000-0000-000000000001', '44444444-0000-0000-0000-000000000002', true,  2),
  ('33333333-0000-0000-0000-000000000001', '44444444-0000-0000-0000-000000000003', false, 3),
  ('33333333-0000-0000-0000-000000000001', '44444444-0000-0000-0000-000000000004', false, 4),
  ('33333333-0000-0000-0000-000000000002', '44444444-0000-0000-0000-000000000005', true,  1),
  ('33333333-0000-0000-0000-000000000002', '44444444-0000-0000-0000-000000000006', false, 2),
  ('33333333-0000-0000-0000-000000000003', '44444444-0000-0000-0000-000000000001', true,  1),
  ('33333333-0000-0000-0000-000000000003', '44444444-0000-0000-0000-000000000002', true,  2),
  ('33333333-0000-0000-0000-000000000003', '44444444-0000-0000-0000-000000000003', false, 3),
  ('33333333-0000-0000-0000-000000000003', '44444444-0000-0000-0000-000000000004', false, 4),
  ('33333333-0000-0000-0000-000000000003', '44444444-0000-0000-0000-000000000005', true,  5),
  ('33333333-0000-0000-0000-000000000003', '44444444-0000-0000-0000-000000000006', false, 6);

-- ── Pickup slots: today + 7 days, 5-minute slots in both peaks ─
insert into pickup_slots (store_id, slot_start, capacity)
select
  '11111111-1111-1111-1111-111111111111',
  slot,
  8
from generate_series(
  date_trunc('day', now() at time zone 'Asia/Bangkok'),
  date_trunc('day', now() at time zone 'Asia/Bangkok') + interval '7 days',
  interval '5 minutes'
) as slot
where (extract(hour from slot) between 6 and 8)
   or (extract(hour from slot) between 16 and 18);
