import { KdsClient } from '@/components/kds/KdsClient';

export default async function KdsPage({
  searchParams,
}: {
  searchParams: Promise<{ store?: string }>;
}) {
  const { store: storeSlug = 'cei-domestic' } = await searchParams;
  return <KdsClient storeSlug={storeSlug} />;
}
