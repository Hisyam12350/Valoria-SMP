import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

// Service role client — HANYA untuk API routes di server
export const supabaseAdmin = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  serviceKey || 'placeholder-key',
  {
    auth: { persistSession: false, autoRefreshToken: false },
  }
);
