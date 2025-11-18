'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import AlertBanner from '@/components/AlertBanner';
import { reportService } from '@/services/reportService';
import { ExecutiveSummary } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { TrendingUp, TrendingDown, Wallet, PiggyBank, BarChart3 } from 'lucide-react';

export default function Dashboard() {
  const [summaries, setSummaries] = useState<ExecutiveSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadSummaries();
  }, []);

  const loadSummaries = async () => {
    try {
      setLoading(true);
      const data = await reportService.getExecutiveSummary();
      setSummaries(data);
    } catch (err) {
      setError('Error al cargar el resumen ejecutivo');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Cargando...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-800">{error}</p>
      </div>
    );
  }

  if (summaries.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-2xl w-full">
          <CardContent className="text-center py-12 px-8">
            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-blue-100 mb-6">
              <PiggyBank className="h-12 w-12 text-blue-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              ¡Bienvenido a Budget Manager!
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              Comienza a gestionar tu presupuesto de forma inteligente.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8 text-left">
              <h3 className="font-semibold text-blue-900 mb-3">
                Para empezar, necesitas:
              </h3>
              <ol className="space-y-2 text-blue-800">
                <li className="flex items-start">
                  <span className="font-bold mr-2">1.</span>
                  <span>Crear tu primera categoría de presupuesto (ej: "Gastos del Hogar")</span>
                </li>
                <li className="flex items-start">
                  <span className="font-bold mr-2">2.</span>
                  <span>Definir tu presupuesto mensual para esa categoría</span>
                </li>
                <li className="flex items-start">
                  <span className="font-bold mr-2">3.</span>
                  <span>Registrar tus gastos y provisiones</span>
                </li>
              </ol>
            </div>
            <a
              href="/categories"
              className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PiggyBank className="w-5 h-5 mr-2" />
              Crear mi primera categoría
            </a>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calcular categorías en riesgo
  const overbudgetCategories = summaries
    .filter((s) => s.monthlyAvailable < 0)
    .map((s) => ({
      categoryId: s.categoryId,
      categoryName: s.categoryName,
      available: s.monthlyAvailable,
      budget: s.monthlyBudget,
      isOverbudget: true,
    }));

  const warningCategories = summaries
    .filter((s) => s.monthlyAvailable >= 0 && s.monthlyAvailable < s.monthlyBudget * 0.1)
    .map((s) => ({
      categoryId: s.categoryId,
      categoryName: s.categoryName,
      available: s.monthlyAvailable,
      budget: s.monthlyBudget,
      isOverbudget: false,
    }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Dashboard - Resumen Ejecutivo
          </h2>
          <p className="text-gray-600 mt-1">
            Vista general de tus presupuestos y gastos
          </p>
        </div>
        <Card className="w-64">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Presupuestos Activos
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {summaries.length}
                </p>
              </div>
              <BarChart3 className="h-10 w-10 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertas de Presupuesto */}
      <AlertBanner
        overbudgetCategories={overbudgetCategories}
        warningCategories={warningCategories}
      />

      {summaries.map((summary) => (
        <Card key={summary.categoryId}>
          <CardHeader>
            <CardTitle>
              {summary.categoryName} - {summary.period}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Presupuesto Mensual */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600">
                      Presupuesto Mensual
                    </p>
                    <p className="text-2xl font-bold text-blue-900 mt-1">
                      {formatCurrency(summary.monthlyBudget)}
                    </p>
                  </div>
                  <Wallet className="h-8 w-8 text-blue-500" />
                </div>
              </div>

              {/* Gastado Mensual */}
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-600">
                      Gastado (Mensual)
                    </p>
                    <p className="text-2xl font-bold text-red-900 mt-1">
                      {formatCurrency(Math.abs(summary.monthlySpent))}
                    </p>
                  </div>
                  <TrendingDown className="h-8 w-8 text-red-500" />
                </div>
              </div>

              {/* Provisiones Abiertas */}
              <div className="bg-amber-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-amber-600">
                      Provisiones Abiertas
                    </p>
                    <p className="text-2xl font-bold text-amber-900 mt-1">
                      {formatCurrency(Math.abs(summary.monthlyOpenProvisions))}
                    </p>
                  </div>
                  <PiggyBank className="h-8 w-8 text-amber-500" />
                </div>
              </div>

              {/* Disponible Mensual */}
              <div className={summary.monthlyAvailable >= 0 ? 'bg-green-50 p-4 rounded-lg' : 'bg-red-50 p-4 rounded-lg'}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600">
                      Disponible (Mensual)
                    </p>
                    <p className="text-2xl font-bold text-green-900 mt-1">
                      {formatCurrency(summary.monthlyAvailable)}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-500" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
