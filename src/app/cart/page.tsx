import { CartClient } from '@/components/order/CartClient';

export default async function CartPage({
  searchParams,
}: {
  searchParams: Promise<{ store?: string }>;
}) {
  const { store: storeSlug = 'cei-domestic' } = await searchParams;
  return <CartClient storeSlug={storeSlug} />;
}
