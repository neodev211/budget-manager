'use client';

import { ReactNode } from 'react';
import { X } from 'lucide-react';
import Button from '@/components/ui/Button';

interface FilterBarProps {
  children: ReactNode;
  onClear: () => void;
  hasActiveFilters: boolean;
}

export default function FilterBar({
  children,
  onClear,
  hasActiveFilters,
}: FilterBarProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {children}
      </div>
      {hasActiveFilters && (
        <div className="flex justify-end">
          <Button
            variant="secondary"
            size="sm"
            onClick={onClear}
            className="flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Limpiar Filtros
          </Button>
        </div>
      )}
    </div>
  );
}
