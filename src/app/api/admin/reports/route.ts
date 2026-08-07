import { NextResponse } from 'next/server';

import { getDailyReport } from '@/server/services/reportService';

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const storeSlug = params.get('store') ?? 'cei-domestic';
  const date = params.get('date') ?? undefined;

  const report = await getDailyReport(storeSlug, date);
  if (!report) return NextResponse.json({ error: 'Store not found' }, { status: 404 });

  return NextResponse.json(report);
}
