import { CheckoutClient } from '@/components/order/CheckoutClient';

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ store?: string; c?: string }>;
}) {
  const { store: storeSlug = 'cei-domestic', c: channel } = await searchParams;
  return <CheckoutClient storeSlug={storeSlug} channel={channel} />;
}
