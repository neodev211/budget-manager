import { createBrowserClient } from '@supabase/ssr';

/**
 * Create Supabase client for browser/client-side usage
 * Uses public anon key for client-side authentication
 */
export const createClient = () => {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
};
