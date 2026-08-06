export type ProductType = 'WRAP' | 'DRINK' | 'COMBO' | 'SIDE';
export type SelectType = 'SINGLE' | 'MULTI';

export interface MenuOption {
  id: string;
  name_th: string;
  name_en: string;
  price_delta: number;
  kcal_delta: number;
  protein_delta_g: number;
  allergen_tags: string[];
  is_available: boolean;
  sort_order: number;
}

export interface MenuOptionGroup {
  id: string;
  name_th: string;
  name_en: string;
  select_type: SelectType;
  min_select: number;
  max_select: number;
  is_required: boolean;
  sort_order: number;
  options: MenuOption[];
}

export interface MenuProduct {
  id: string;
  type: ProductType;
  name_th: string;
  name_en: string;
  description_th: string | null;
  base_price: number;
  base_kcal: number;
  base_protein_g: number;
  prep_seconds_estimate: number;
  is_available: boolean;
  sort_order: number;
  option_groups: MenuOptionGroup[];
}

export interface MenuCategory {
  id: string;
  name_th: string;
  name_en: string;
  sort_order: number;
  products: MenuProduct[];
}

export interface StoreMenu {
  store: {
    id: string;
    slug: string;
    name: string;
    airport_code: string;
    terminal_zone: string | null;
  };
  categories: MenuCategory[];
}
