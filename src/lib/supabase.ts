import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ENV } from './env';

// Lazily create clients — returns null when env vars are missing
// IMPORTANT: exported as nullable so callers MUST null-check before use
function makeClient(url: string, key: string): SupabaseClient | null {
  if (!url || !key) return null;
  return createClient(url, key);
}

// Public client — use in client components (anon key)
// May be null during Vercel preview builds without env vars
export const supabase: SupabaseClient | null = makeClient(ENV.SUPABASE_URL, ENV.SUPABASE_ANON_KEY);

// Server/admin client — use in API routes ONLY (service role key)
// Never import this in client components — it bypasses Row Level Security
export const supabaseAdmin: SupabaseClient | null = makeClient(ENV.SUPABASE_URL, ENV.SUPABASE_SERVICE_ROLE_KEY);
