'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { AuthProvider } from '@/lib/auth/AuthContext';
import { ToastProvider } from '@/lib/context/ToastContext';
import { ToastManager } from '@/components/ui/ToastManager';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60000, // 1 minute - cache is fresh for 1 minute
      gcTime: 300000, // 5 minutes - keep unused data in cache for 5 minutes (formerly cacheTime)
      retry: 1, // Retry failed requests once
      refetchOnWindowFocus: false, // Don't refetch when window regains focus (optional)
    },
  },
});

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>
          {children}
          <ToastManager />
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
