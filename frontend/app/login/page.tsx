'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useAuth } from '@/lib/auth/AuthContext';
import { getCurrentVersion } from '@/lib/version';

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();
  const { user, loading } = useAuth();
  const [view, setView] = useState<'sign_in' | 'sign_up'>('sign_in');
  const [authError, setAuthError] = useState<string | null>(null);

  // Single effect to handle redirect - trust AuthContext for auth state
  useEffect(() => {
    console.log('[LoginPage] Redirect effect check:', {
      loading,
      hasUser: !!user,
      userEmail: user?.email,
      timestamp: new Date().toISOString(),
    });

    if (!loading && user) {
      // User is authenticated, redirect to dashboard
      console.log('[LoginPage] User authenticated via context, redirecting to dashboard');
      router.push('/');
    }
  }, [user, loading, router]);

  // Listen for auth state changes and errors
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('[LoginPage] Auth state change:', {
          event,
          hasSession: !!session,
          sessionUser: session?.user?.email,
          timestamp: new Date().toISOString(),
        });

        if (event === 'SIGNED_IN' && session) {
          // User just signed in, redirect to dashboard immediately
          console.log('[LoginPage] SIGNED_IN event detected, redirecting to dashboard');
          router.push('/');
        } else if (event === 'SIGNED_OUT') {
          console.log('[LoginPage] SIGNED_OUT event detected');
          // Check localStorage for error messages from Supabase
          const error = localStorage.getItem('supabase.auth.error');
          if (error) {
            console.log('[LoginPage] Auth error found:', error);
            setAuthError(error);
            localStorage.removeItem('supabase.auth.error');
          }
        }
      }
    );

    return () => subscription?.unsubscribe();
  }, [supabase.auth, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-2 text-gray-900">
          Budget Manager
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Manage your finances with ease
        </p>

        {/* Error Alert */}
        {authError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800 font-medium">Error de autenticación:</p>
            <p className="text-sm text-red-700 mt-1">{authError}</p>
            <button
              onClick={() => setAuthError(null)}
              className="text-xs text-red-600 hover:text-red-800 mt-2 underline"
            >
              Descartar
            </button>
          </div>
        )}

        {/* View Toggle Buttons */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => {
              setView('sign_in');
              setAuthError(null);
            }}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
              view === 'sign_in'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Ingresar
          </button>
          <button
            onClick={() => {
              setView('sign_up');
              setAuthError(null);
            }}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
              view === 'sign_up'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Registrarse
          </button>
        </div>

        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#3b82f6',
                  brandAccent: '#1d4ed8',
                },
              },
            },
          }}
          theme="light"
          providers={['google']}
          redirectTo={`${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`}
          view={view}
          showLinks={true}
          magicLink={false}
        />
      </div>
    </div>
  );
}
