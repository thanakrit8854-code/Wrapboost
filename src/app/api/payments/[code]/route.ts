import { NextResponse } from 'next/server';

import { confirmPayment, getOrCreatePayment } from '@/server/services/paymentService';

export async function GET(request: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const token = new URL(request.url).searchParams.get('t');

  if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 400 });

  const payment = await getOrCreatePayment(code, token);
  if (!payment) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json(payment);
}

export async function POST(request: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const token = new URL(request.url).searchParams.get('t');

  if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 400 });

  const result = await confirmPayment(code, token);

  if (!result.ok) {
    return NextResponse.json({ error: { message: result.message } }, { status: 409 });
  }

  return NextResponse.json({ ok: true });
}
