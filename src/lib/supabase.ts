import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Fallback dummy client for build time when env vars are not yet configured
const createSafeClient = (url: string, key: string): SupabaseClient => {
  if (!url || !key) {
    // Provide placeholder URL during build so build succeeds before user sets env vars
    return createClient('https://placeholder.supabase.co', 'placeholder-key');
  }
  return createClient(url, key);
};

// Client for public operations (safe to run in browser)
export const supabase = createSafeClient(supabaseUrl, supabaseAnonKey);

// Admin client for backend operations (syncing updates)
export const getServiceSupabase = () => {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;
  return createSafeClient(supabaseUrl, serviceKey);
};

export const isSupabaseConfigured = () => {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')
  );
};
