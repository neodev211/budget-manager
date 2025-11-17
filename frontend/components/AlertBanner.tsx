'use client';

import { AlertCircle, TrendingDown } from 'lucide-react';

interface AlertItem {
  categoryId: string;
  categoryName: string;
  available: number;
  budget: number;
  isOverbudget: boolean;
}

interface AlertBannerProps {
  overbudgetCategories: AlertItem[];
  warningCategories: AlertItem[];
}

export default function AlertBanner({
  overbudgetCategories,
  warningCategories,
}: AlertBannerProps) {
  if (overbudgetCategories.length === 0 && warningCategories.length === 0) {
    return null;
  }

  const totalProblems = overbudgetCategories.length + warningCategories.length;

  return (
    <div className="space-y-3">
      {/* Alert de Overbudget */}
      {overbudgetCategories.length > 0 && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-bold text-red-800">
                Presupuesto Excedido en {overbudgetCategories.length} Categoría{overbudgetCategories.length > 1 ? 's' : ''}
              </h3>
              <p className="text-sm text-red-700 mt-1">
                {overbudgetCategories.map((cat) => cat.categoryName).join(', ')}
              </p>
              <p className="text-xs text-red-600 mt-1">
                Necesitas ajustar gastos o aumentar presupuesto
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Alert de Warning */}
      {warningCategories.length > 0 && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded">
          <div className="flex items-start">
            <TrendingDown className="w-5 h-5 text-amber-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-bold text-amber-800">
                Presupuesto en Precaución en {warningCategories.length} Categoría{warningCategories.length > 1 ? 's' : ''}
              </h3>
              <p className="text-sm text-amber-700 mt-1">
                {warningCategories.map((cat) => cat.categoryName).join(', ')}
              </p>
              <p className="text-xs text-amber-600 mt-1">
                Menos del 10% de presupuesto disponible
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
