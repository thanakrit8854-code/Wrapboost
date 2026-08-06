import { notFound } from 'next/navigation';

import { BuildClient } from '@/components/menu/BuildClient';
import { getStoreMenu } from '@/server/services/menuService';

export default async function BuildPage({
  params,
  searchParams,
}: {
  params: Promise<{ productId: string }>;
  searchParams: Promise<{ store?: string }>;
}) {
  const { productId } = await params;
  const { store: storeSlug = 'cei-domestic' } = await searchParams;

  const menu = await getStoreMenu(storeSlug);
  if (!menu) notFound();

  const product = menu.categories.flatMap((c) => c.products).find((p) => p.id === productId);
  if (!product) notFound();

  return <BuildClient product={product} storeSlug={storeSlug} />;
}
