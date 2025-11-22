'use client';

import { formatCurrency } from '@/lib/utils';

export interface BudgetBarProps {
  label: string;
  current: number;
  total: number;
  showValue?: boolean;
  animated?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Visual budget bar component showing current usage vs total budget
 *
 * Features:
 * - Color coding: Green (ok), Yellow (warning <20% remaining), Red (exceeded)
 * - Smooth animations
 * - Responsive sizing
 * - Shows percentages and currency values
 */
export function BudgetBar({
  label,
  current,
  total,
  showValue = true,
  animated = true,
  size = 'md'
}: BudgetBarProps) {
  const percentage = total > 0 ? Math.min((current / total) * 100, 100) : 0;
  const remaining = Math.max(total - current, 0);
  const isExceeded = current > total;
  const isWarning = !isExceeded && remaining < (total * 0.2); // < 20% remaining

  // Determine color based on status
  const getBarColor = () => {
    if (isExceeded) return 'bg-red-500';
    if (isWarning) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStatusText = () => {
    if (isExceeded) return 'Excedido';
    if (isWarning) return 'Advertencia';
    return 'Ok';
  };

  const getStatusColor = () => {
    if (isExceeded) return 'text-red-600';
    if (isWarning) return 'text-yellow-600';
    return 'text-green-600';
  };

  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  };

  const containerClasses = {
    sm: 'gap-1',
    md: 'gap-2',
    lg: 'gap-3'
  };

  return (
    <div className={`flex flex-col ${containerClasses[size]}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className={`text-xs font-semibold ${getStatusColor()}`}>
          {getStatusText()}
        </span>
      </div>

      {/* Bar container */}
      <div className="w-full bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`${getBarColor()} rounded-full transition-all ${
            animated ? 'duration-500 ease-out' : ''
          }`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
          role="progressbar"
          aria-valuenow={Math.round(percentage)}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>

      {/* Footer with values */}
      {showValue && (
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span>
            {formatCurrency(current)} / {formatCurrency(total)}
          </span>
          <span className={getStatusColor()}>
            {isExceeded
              ? `${formatCurrency(current - total)} excedido`
              : `${formatCurrency(remaining)} disponible`}
          </span>
        </div>
      )}
    </div>
  );
}
