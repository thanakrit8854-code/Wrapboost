import { NextResponse } from 'next/server';

import { getOrderByCode } from '@/server/services/orderLookup';

export async function GET(request: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const token = new URL(request.url).searchParams.get('t');

  if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 400 });

  const order = await getOrderByCode(code, token);
  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json({ status: order.status });
}
