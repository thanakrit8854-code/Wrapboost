import { NextResponse } from 'next/server';

import { getAvailableSlots } from '@/server/services/slotService';

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const storeSlug = params.get('store') ?? 'cei-domestic';

  const slots = await getAvailableSlots(storeSlug);

  return NextResponse.json({ slots });
}
