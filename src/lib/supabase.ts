import { createClient } from '@supabase/supabase-js';
import { ENV } from './env';

// Public client — use in client components (anon key)
export const supabase = createClient(ENV.SUPABASE_URL, ENV.SUPABASE_ANON_KEY);

// Server/admin client — use in API routes only (service role key)
export const supabaseAdmin = createClient(ENV.SUPABASE_URL, ENV.SUPABASE_SERVICE_ROLE_KEY);
