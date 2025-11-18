'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useAuth } from '@/lib/auth/AuthContext';
import { Mail, CheckCircle } from 'lucide-react';

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();
  const { user, loading } = useAuth();
  const [checkEmail, setCheckEmail] = useState(false);

  // Listen for auth state changes to detect sign up
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_UP') {
          setCheckEmail(true);
        }
        if (event === 'SIGNED_IN' && session) {
          router.push('/');
        }
      }
    );

    return () => subscription?.unsubscribe();
  }, [router, supabase.auth]);

  // Redirect to home if already authenticated
  useEffect(() => {
    if (!loading && user) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show email confirmation message
  if (checkEmail) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Check Your Email
            </h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <Mail className="h-5 w-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                <div className="text-left">
                  <p className="text-sm font-medium text-blue-900 mb-2">
                    We've sent you a confirmation email
                  </p>
                  <p className="text-sm text-blue-700">
                    Click the link in the email to confirm your account and start managing your budget.
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setCheckEmail(false)}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              ← Back to login
            </button>
          </div>
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
          providers={['google']}
          redirectTo={`${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`}
        />
      </div>
    </div>
  );
}
