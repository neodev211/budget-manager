'use client';

import { BudgetBar } from '@/components/ui/BudgetBar';
import { formatCurrency } from '@/lib/utils';
import { AlertCircle, TrendingDown, TrendingUp } from 'lucide-react';

export interface BudgetImpact {
  label: string;
  current: number;
  budget: number;
  after: number;
}

export interface FormPreviewProps {
  title: string;
  impacts: BudgetImpact[];
  warnings?: string[];
  showComparison?: boolean;
}

/**
 * FormPreview Component
 *
 * Displays a visual preview of budget impact before/after user actions
 * Shows:
 * - Current vs Budget vs After state
 * - Color-coded status (green/yellow/red)
 * - Warnings if budget will be exceeded
 * - Smooth animations
 */
export function FormPreview({
  title,
  impacts,
  warnings = [],
  showComparison = true
}: FormPreviewProps) {
  // Check if all impacts are within budget
  const allWithinBudget = impacts.every(impact => impact.after <= impact.budget);
  const hasWarnings = impacts.some(
    impact => impact.after > 0 && impact.after > impact.budget * 0.8
  );

  const getImpactTrend = (current: number, after: number) => {
    if (after < current) return { type: 'decrease', icon: TrendingDown, color: 'text-green-600' };
    if (after > current) return { type: 'increase', icon: TrendingUp, color: 'text-red-600' };
    return { type: 'same', icon: null, color: 'text-gray-600' };
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          <p className="text-xs text-gray-600">Impacto previsto en tu presupuesto</p>
        </div>
        {allWithinBudget ? (
          <div className="text-right">
            <p className="text-xs font-semibold text-green-600">✅ Dentro del presupuesto</p>
          </div>
        ) : (
          <div className="text-right">
            <p className="text-xs font-semibold text-red-600">❌ Excederá presupuesto</p>
          </div>
        )}
      </div>

      {/* Budget impacts */}
      <div className="space-y-3">
        {impacts.map((impact, idx) => {
          const trend = getImpactTrend(impact.current, impact.after);
          const difference = impact.after - impact.current;
          const Icon = trend.icon;

          return (
            <div key={idx} className="space-y-2">
              {/* Label with trend */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-700">{impact.label}</span>
                {Icon && (
                  <div className="flex items-center gap-1">
                    <Icon className={`w-4 h-4 ${trend.color}`} />
                    <span className={`text-xs font-semibold ${trend.color}`}>
                      {difference > 0 ? '+' : ''}{formatCurrency(Math.abs(difference))}
                    </span>
                  </div>
                )}
              </div>

              {/* Before/After comparison */}
              {showComparison && (
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-white rounded p-2 border border-gray-200">
                    <p className="text-gray-600">Saldo actual</p>
                    <p className="font-semibold text-gray-900">
                      {formatCurrency(impact.budget - impact.current)}
                    </p>
                  </div>
                  <div className="bg-white rounded p-2 border border-blue-200">
                    <p className="text-gray-600">Saldo después</p>
                    <p className={`font-semibold ${
                      impact.after <= impact.budget
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}>
                      {formatCurrency(impact.budget - impact.after)}
                    </p>
                  </div>
                </div>
              )}

              {/* Budget bar */}
              <BudgetBar
                label="Uso del presupuesto"
                current={impact.after}
                total={impact.budget}
                size="sm"
              />
            </div>
          );
        })}
      </div>

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="space-y-2 border-t border-blue-200 pt-3">
          {warnings.map((warning, idx) => (
            <div
              key={idx}
              className="flex items-start gap-2 bg-yellow-50 border border-yellow-200 rounded p-2"
            >
              <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-yellow-800">{warning}</p>
            </div>
          ))}
        </div>
      )}

      {/* Footer note */}
      {!allWithinBudget && (
        <div className="bg-red-50 border border-red-200 rounded p-2">
          <p className="text-xs text-red-700">
            <span className="font-semibold">⚠️ Exceso de presupuesto:</span> Esta acción
            excederá el presupuesto disponible. Verifica los montos antes de continuar.
          </p>
        </div>
      )}
    </div>
  );
}
