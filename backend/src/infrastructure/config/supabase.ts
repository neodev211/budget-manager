import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error(
    'Missing Supabase environment variables. Please set SUPABASE_URL and SUPABASE_SERVICE_KEY'
  );
}

/**
 * Supabase client initialized with service role key
 * Used for backend authentication verification
 */
export const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Verify JWT token from request headers
 * @param token - Bearer token from Authorization header
 * @returns User data if token is valid, null otherwise
 */
export const verifyToken = async (token: string) => {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return null;
    }

    return user;
  } catch (error) {
    console.error('Error verifying token:', error);
    return null;
  }
};
