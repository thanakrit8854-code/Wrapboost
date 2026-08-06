import { NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from('_healthcheck_probe').select('*').limit(1);

    const reachable = !error || error.code === '42P01' || error.code === 'PGRST205';

    return NextResponse.json({
      ok: reachable,
      supabaseUrlConfigured: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
      note: reachable ? 'Supabase reachable' : 'Supabase unreachable',
      errorCode: error?.code ?? null,
    });
  } catch (e) {
    return NextResponse.json({ ok: false, message: (e as Error).message }, { status: 500 });
  }
}
