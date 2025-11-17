'use client';

import { ReactNode, useState } from 'react';
import { X, ChevronDown } from 'lucide-react';
import Button from '@/components/ui/Button';

interface FilterBarProps {
  children: ReactNode;
  onClear: () => void;
  hasActiveFilters: boolean;
  activeFilterCount?: number;
}

export default function FilterBar({
  children,
  onClear,
  hasActiveFilters,
  activeFilterCount = 0,
}: FilterBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Botón para expandir/contraer */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <svg
            className="w-5 h-5 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1V4z M17 4a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z M3 14a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6z M17 9a1 1 0 100-2 1 1 0 000 2z"
            />
          </svg>
          <span className="text-sm font-semibold text-gray-900">Filtros</span>
          {hasActiveFilters && (
            <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform bg-blue-600 rounded-full">
              {activeFilterCount}
            </span>
          )}
        </div>
        <ChevronDown
          className={`w-5 h-5 text-gray-600 transition-transform ${
            isExpanded ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Contenido de filtros */}
      {isExpanded && (
        <div className="border-t border-gray-200 p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {children}
          </div>
          {hasActiveFilters && (
            <div className="flex justify-end pt-2">
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
      )}
    </div>
  );
}
