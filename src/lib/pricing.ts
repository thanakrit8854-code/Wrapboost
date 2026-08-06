import type { MenuOption, MenuProduct } from '@/types/menu';

export interface Selection {
  [optionGroupId: string]: string[];
}

export interface PricedResult {
  price: number;
  kcal: number;
  protein: number;
  chosen: MenuOption[];
}

/**
 * Single source of truth for price and nutrition.
 * The client mirrors this for instant feedback; the server re-runs it on submit
 * so a tampered client can never change what the customer is charged.
 */
export function priceSelection(product: MenuProduct, selection: Selection): PricedResult {
  const chosen: MenuOption[] = [];

  for (const group of product.option_groups) {
    const ids = selection[group.id] ?? [];
    for (const id of ids) {
      const option = group.options.find((o) => o.id === id);
      if (option && option.is_available) chosen.push(option);
    }
  }

  return {
    price: chosen.reduce((sum, o) => sum + o.price_delta, product.base_price),
    kcal: chosen.reduce((sum, o) => sum + o.kcal_delta, product.base_kcal),
    protein: Number(
      chosen.reduce((sum, o) => sum + o.protein_delta_g, product.base_protein_g).toFixed(1),
    ),
    chosen,
  };
}

export function validateSelection(
  product: MenuProduct,
  selection: Selection,
): { valid: boolean; missing: string[] } {
  const missing: string[] = [];

  for (const group of product.option_groups) {
    const count = (selection[group.id] ?? []).length;
    if (group.is_required && count < Math.max(1, group.min_select)) {
      missing.push(group.name_th);
    }
  }

  return { valid: missing.length === 0, missing };
}
