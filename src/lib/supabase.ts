import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ENV } from './env';

// Lazily create clients — avoids crashes when env vars are missing (e.g. Vercel preview without vars set)
function makeClient(url: string, key: string): SupabaseClient | null {
  if (!url || !key) return null;
  return createClient(url, key);
}

// Public client — use in client components (anon key)
export const supabase = makeClient(ENV.SUPABASE_URL, ENV.SUPABASE_ANON_KEY) as SupabaseClient;

// Server/admin client — use in API routes only (service role key)
export const supabaseAdmin = makeClient(ENV.SUPABASE_URL, ENV.SUPABASE_SERVICE_ROLE_KEY) as SupabaseClient;
