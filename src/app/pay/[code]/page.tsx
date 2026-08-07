import { notFound } from 'next/navigation';

import { PayClient } from '@/components/order/PayClient';

export default async function PayPage({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ t?: string }>;
}) {
  const { code } = await params;
  const { t: token } = await searchParams;

  if (!token) notFound();

  return <PayClient code={code} token={token} />;
}
