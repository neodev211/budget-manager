'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';

/**
 * Auth context type definition
 */
interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
}

/**
 * Auth context - provides authentication state to the app
 */
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
});

/**
 * Auth provider component
 * Wraps the application and provides auth state and methods
 */
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  // Initialize auth state on mount
  useEffect(() => {
    let mounted = true;

    // Get initial session with timeout
    const getInitialSession = async () => {
      try {
        console.log('[AuthContext] Getting initial session...');
        // Add timeout to prevent infinite loading
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Session check timeout')), 10000)
        );

        const sessionPromise = supabase.auth.getSession();

        const {
          data: { session },
        } = await Promise.race([sessionPromise, timeoutPromise]) as any;

        console.log('[AuthContext] Initial session retrieved:', {
          hasSession: !!session,
          sessionUser: session?.user?.email,
          timestamp: new Date().toISOString(),
        });

        if (mounted) {
          setUser(session?.user ?? null);
        }
      } catch (error) {
        console.error('[AuthContext] Error getting initial session:', error);
        // Even on error, set loading to false to prevent infinite loading
        if (mounted) {
          setUser(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    getInitialSession();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('[AuthContext] Auth state change:', {
        event: _event,
        hasSession: !!session,
        sessionUser: session?.user?.email,
        mounted,
        timestamp: new Date().toISOString(),
      });
      if (mounted) {
        console.log('[AuthContext] Setting user:', session?.user?.email ?? null);
        setUser(session?.user ?? null);
      }
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, [supabase]);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error };
    } catch (error) {
      return { error };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      return { error };
    } catch (error) {
      return { error };
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut, signIn, signUp }}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook to use auth context
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
