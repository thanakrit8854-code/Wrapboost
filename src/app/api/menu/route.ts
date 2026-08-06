import { NextResponse } from 'next/server';

import { getStoreMenu } from '@/server/services/menuService';

export async function GET(request: Request) {
  const slug = new URL(request.url).searchParams.get('store') ?? 'cei-domestic';
  const menu = await getStoreMenu(slug);

  if (!menu) return NextResponse.json({ error: 'Store not found' }, { status: 404 });

  return NextResponse.json({
    store: menu.store.name,
    categories: menu.categories.map((c) => ({
      name: c.name_th,
      products: c.products.map((p) => ({
        name: p.name_th,
        price: p.base_price / 100,
        protein: p.base_protein_g,
        kcal: p.base_kcal,
        optionGroups: p.option_groups.map((g) => `${g.name_th} (${g.options.length})`),
      })),
    })),
  });
}
