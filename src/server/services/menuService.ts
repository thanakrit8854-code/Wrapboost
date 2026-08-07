import { createClient } from '@/lib/supabase/server';
import type { MenuCategory, MenuOptionGroup, MenuProduct, StoreMenu } from '@/types/menu';

/* eslint-disable @typescript-eslint/no-explicit-any */
// Supabase's nested select returns a shape TypeScript cannot infer, so the raw
// rows are treated as `any` here and narrowed into our own types below.

export async function getStoreMenu(slug: string): Promise<StoreMenu | null> {
  const supabase = await createClient();

  const { data: store, error: storeError } = await supabase
    .from('stores')
    .select('id, slug, name, airport_code, terminal_zone')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (storeError || !store) return null;

  const { data: rows, error } = await supabase
    .from('categories')
    .select(
      `
      id, name_th, name_en, sort_order,
      products (
        id, type, name_th, name_en, description_th,
        base_price, base_kcal, base_protein_g,
        prep_seconds_estimate, is_available, sort_order,
        product_option_groups (
          is_required, sort_order,
          option_groups (
            id, name_th, name_en, select_type, min_select, max_select,
            options ( id, name_th, name_en, price_delta, kcal_delta,
                      protein_delta_g, allergen_tags, is_available, sort_order )
          )
        )
      )
    `,
    )
    .eq('store_id', store.id)
    .order('sort_order');

  if (error || !rows) return null;

  const categories: MenuCategory[] = (rows as any[]).map((c) => ({
    id: c.id,
    name_th: c.name_th,
    name_en: c.name_en,
    sort_order: c.sort_order,
    products: (c.products ?? [])
      .map((p: any): MenuProduct => ({
        id: p.id,
        type: p.type,
        name_th: p.name_th,
        name_en: p.name_en,
        description_th: p.description_th,
        base_price: p.base_price,
        base_kcal: p.base_kcal,
        base_protein_g: Number(p.base_protein_g),
        prep_seconds_estimate: p.prep_seconds_estimate,
        is_available: p.is_available,
        sort_order: p.sort_order,
        option_groups: (p.product_option_groups ?? [])
          .map((link: any): MenuOptionGroup | null => {
            const g = link.option_groups;
            if (!g) return null;
            return {
              id: g.id,
              name_th: g.name_th,
              name_en: g.name_en,
              select_type: g.select_type,
              min_select: g.min_select,
              max_select: g.max_select,
              is_required: link.is_required,
              sort_order: link.sort_order,
              options: (g.options ?? [])
                .map((o: any) => ({
                  id: o.id,
                  name_th: o.name_th,
                  name_en: o.name_en,
                  price_delta: o.price_delta,
                  kcal_delta: o.kcal_delta,
                  protein_delta_g: Number(o.protein_delta_g),
                  allergen_tags: o.allergen_tags ?? [],
                  is_available: o.is_available,
                  sort_order: o.sort_order,
                }))
                .sort(
                  (a: MenuOptionGroup['options'][number], b: MenuOptionGroup['options'][number]) =>
                    a.sort_order - b.sort_order,
                ),
            };
          })
          .filter((g: MenuOptionGroup | null): g is MenuOptionGroup => g !== null)
          .sort((a: MenuOptionGroup, b: MenuOptionGroup) => a.sort_order - b.sort_order),
      }))
      .sort((a: MenuProduct, b: MenuProduct) => a.sort_order - b.sort_order),
  }));

  return { store, categories };
}
