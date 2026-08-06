import 'server-only';

import { createClient as createSupabaseClient } from '@supabase/supabase-js';

import { env } from '@/lib/env';
import { getSecretKey } from '@/lib/env';

export function createAdminClient() {
  return createSupabaseClient(env.supabaseUrl, getSecretKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
