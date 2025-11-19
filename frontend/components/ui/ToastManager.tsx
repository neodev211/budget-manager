'use client';

import { useToast } from '@/lib/hooks/useToast';
import { ToastContainer } from './Toast';

export function ToastManager() {
  const { toasts, removeToast } = useToast();

  return <ToastContainer toasts={toasts} onClose={removeToast} />;
}
