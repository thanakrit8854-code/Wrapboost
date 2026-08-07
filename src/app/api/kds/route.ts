import { NextResponse } from 'next/server';

import { advanceOrder, getKdsBoard } from '@/server/services/kdsService';

export async function GET(request: Request) {
  const storeSlug = new URL(request.url).searchParams.get('store') ?? 'cei-domestic';

  const board = await getKdsBoard(storeSlug);
  if (!board) return NextResponse.json({ error: 'Store not found' }, { status: 404 });

  return NextResponse.json(board);
}

export async function PATCH(request: Request) {
  let body: { orderId?: string; toStatus?: string };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: { message: 'ข้อมูลไม่ถูกต้อง' } }, { status: 400 });
  }

  if (!body.orderId || !body.toStatus) {
    return NextResponse.json({ error: { message: 'ต้องระบุออร์เดอร์และสถานะ' } }, { status: 400 });
  }

  const result = await advanceOrder(body.orderId, body.toStatus);

  if (!result.ok) {
    return NextResponse.json({ error: { message: result.message } }, { status: 409 });
  }

  return NextResponse.json({ ok: true });
}
