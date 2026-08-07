import { NextResponse } from 'next/server';

import { createOrder } from '@/server/services/orderService';

interface Body {
  storeSlug?: string;
  slotId?: string;
  channel?: 'QR_CHECKIN' | 'QR_GATE' | 'QR_COUNTER' | 'WALK_IN';
  flightNo?: string | null;
  lines?: { productId: string; optionIds: string[]; qty: number }[];
}

export async function POST(request: Request) {
  let body: Body;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: { code: 'BAD_JSON', message: 'ข้อมูลไม่ถูกต้อง' } },
      { status: 400 },
    );
  }

  if (!body.slotId || !Array.isArray(body.lines) || body.lines.length === 0) {
    return NextResponse.json(
      { error: { code: 'INVALID_INPUT', message: 'ต้องระบุเวลารับและรายการอาหาร' } },
      { status: 400 },
    );
  }

  const lines = body.lines
    .filter((l) => typeof l.productId === 'string')
    .map((l) => ({
      productId: l.productId,
      optionIds: Array.isArray(l.optionIds) ? l.optionIds.filter((i) => typeof i === 'string') : [],
      qty: Math.min(Math.max(Number(l.qty) || 1, 1), 20),
    }));

  const result = await createOrder({
    storeSlug: body.storeSlug ?? 'cei-domestic',
    slotId: body.slotId,
    channel: body.channel,
    flightNo: body.flightNo ?? null,
    lines,
  });

  if (!result.ok) {
    const status = result.code === 'SLOT_FULL' ? 409 : 400;
    return NextResponse.json({ error: { code: result.code, message: result.message } }, { status });
  }

  return NextResponse.json({
    orderCode: result.orderCode,
    accessToken: result.accessToken,
    total: result.total,
  });
}
