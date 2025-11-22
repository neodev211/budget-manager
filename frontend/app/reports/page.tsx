'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { reportService } from '@/services/reportService';
import { categoryService } from '@/services/categoryService';
import {
  CategoryDetailReport,
  PeriodComparisonReport,
  PaymentMethodReport,
  ProvisionFulfillmentReport,
  Category,
} from '@/types';
import { formatCurrency, formatDate, formatPercent } from '@/lib/utils';
import { BarChart3, TrendingUp, CreditCard, CheckCircle, Calendar } from 'lucide-react';
import { useToastContext } from '@/lib/context/ToastContext';

export default function ReportsPage() {
  const toast = useToastContext();
  const [activeTab, setActiveTab] = useState<'category' | 'period' | 'payment' | 'provision'>('category');
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  // Category Detail Report states
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('');
  const [categoryDetailReport, setCategoryDetailReport] = useState<CategoryDetailReport | null>(null);

  // Period Comparison Report states
  const [selectedPeriods, setSelectedPeriods] = useState<string[]>([]);
  const [periodComparisonReport, setPeriodComparisonReport] = useState<PeriodComparisonReport | null>(null);

  // Payment Method Report states
  const [paymentPeriod, setPaymentPeriod] = useState<string>('');
  const [paymentMethodReport, setPaymentMethodReport] = useState<PaymentMethodReport | null>(null);

  // Provision Fulfillment Report states
  const [provisionPeriod, setProvisionPeriod] = useState<string>('');
  const [provisionFulfillmentReport, setProvisionFulfillmentReport] = useState<ProvisionFulfillmentReport | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoadingInitial(true);
      const data = await categoryService.getAll();
      setCategories(data);
      if (data.length > 0) {
        setSelectedCategory(data[0].id);
        setSelectedPeriod(data[0].period);
        setPaymentPeriod(data[0].period);
        setProvisionPeriod(data[0].period);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      toast.error('Error al cargar categorías');
    } finally {
      setLoadingInitial(false);
    }
  };

  const getUniquePeriods = () => {
    const periods = [...new Set(categories.map(c => c.period))].sort().reverse();
    return periods.map(p => ({ value: p, label: p }));
  };

  // Category Detail Report handlers
  const handleLoadCategoryDetail = async () => {
    if (!selectedCategory || !selectedPeriod) return;
    setLoadingCreate(true);
    try {
      const report = await reportService.getCategoryDetailReport(selectedCategory, selectedPeriod);
      setCategoryDetailReport(report);
    } catch (error) {
      console.error('Error loading category detail report:', error);
      toast.error('Error al cargar el reporte');
    } finally {
      setLoadingCreate(false);
    }
  };

  // Period Comparison Report handlers
  const handleAddPeriod = (period: string) => {
    if (!selectedPeriods.includes(period)) {
      setSelectedPeriods([...selectedPeriods, period].sort());
    }
  };

  const handleRemovePeriod = (period: string) => {
    setSelectedPeriods(selectedPeriods.filter(p => p !== period));
  };

  const handleLoadPeriodComparison = async () => {
    if (selectedPeriods.length < 2) return;
    setLoadingCreate(true);
    try {
      const report = await reportService.getPeriodComparisonReport(selectedPeriods);
      setPeriodComparisonReport(report);
    } catch (error) {
      console.error('Error loading period comparison report:', error);
      toast.error('Error al cargar el reporte');
    } finally {
      setLoadingCreate(false);
    }
  };

  // Payment Method Report handlers
  const handleLoadPaymentMethod = async () => {
    if (!paymentPeriod) return;
    setLoadingCreate(true);
    try {
      const report = await reportService.getPaymentMethodReport(paymentPeriod);
      setPaymentMethodReport(report);
    } catch (error) {
      console.error('Error loading payment method report:', error);
      toast.error('Error al cargar el reporte');
    } finally {
      setLoadingCreate(false);
    }
  };

  // Provision Fulfillment Report handlers
  const handleLoadProvisionFulfillment = async () => {
    if (!provisionPeriod) return;
    setLoadingCreate(true);
    try {
      const report = await reportService.getProvisionFulfillmentReport(provisionPeriod);
      setProvisionFulfillmentReport(report);
    } catch (error) {
      console.error('Error loading provision fulfillment report:', error);
      toast.error('Error al cargar el reporte');
    } finally {
      setLoadingCreate(false);
    }
  };

  const tabs = [
    { id: 'category', label: 'Detalle de Categoría', icon: BarChart3 },
    { id: 'period', label: 'Comparación de Períodos', icon: TrendingUp },
    { id: 'payment', label: 'Métodos de Pago', icon: CreditCard },
    { id: 'provision', label: 'Cumplimiento de Provisiones', icon: CheckCircle },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Reportes Avanzados</h2>
        <p className="text-gray-600 mt-1">Analiza en detalle tu presupuesto y gastos</p>
      </div>

      {loadingInitial ? (
        <Card>
          <SkeletonLoader type="table" count={5} />
        </Card>
      ) : (
        <>
      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Category Detail Report Tab */}
      {activeTab === 'category' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Detalle de Categoría</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Categoría"
                  options={categories.map(c => ({ value: c.id, label: c.name }))}
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                />
                <Select
                  label="Período"
                  options={getUniquePeriods()}
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                />
              </div>
              <Button onClick={handleLoadCategoryDetail} disabled={!selectedCategory || !selectedPeriod || loadingCreate}>
                {loadingCreate ? 'Cargando...' : 'Generar Reporte'}
              </Button>
            </CardContent>
          </Card>

          {categoryDetailReport && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <p className="text-sm text-gray-600">Presupuesto</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(categoryDetailReport.monthlyBudget)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <p className="text-sm text-gray-600">Gastos</p>
                  <p className="text-2xl font-bold text-red-600">{formatCurrency(categoryDetailReport.totalExpenses)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <p className="text-sm text-gray-600">Utilización</p>
                  <p className="text-2xl font-bold text-blue-600">{formatPercent(categoryDetailReport.budgetUtilization)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <p className="text-sm text-gray-600">Disponible</p>
                  <p className={`text-2xl font-bold ${categoryDetailReport.availableBudget < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {formatCurrency(categoryDetailReport.availableBudget)}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {categoryDetailReport && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Top Expenses */}
              <Card>
                <CardHeader>
                  <CardTitle>Top 5 Gastos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {categoryDetailReport.topExpenses.map((expense, idx) => (
                      <div key={idx} className="flex justify-between items-start border-b pb-2 last:border-b-0">
                        <div>
                          <p className="font-medium text-gray-900">{expense.description}</p>
                          <p className="text-xs text-gray-500">{expense.paymentMethod}</p>
                        </div>
                        <p className="font-bold text-gray-900">{formatCurrency(expense.amount)}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Provisions Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Estado de Provisiones</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-green-50 p-4 rounded">
                      <p className="text-sm text-green-600 font-medium">Cumplidas</p>
                      <p className="text-2xl font-bold text-green-900">{categoryDetailReport.totalClosedProvisions}</p>
                    </div>
                    <div className="bg-amber-50 p-4 rounded">
                      <p className="text-sm text-amber-600 font-medium">Abiertas</p>
                      <p className="text-2xl font-bold text-amber-900">{categoryDetailReport.totalOpenProvisions}</p>
                    </div>
                  </div>
                  <div className="bg-blue-50 p-4 rounded">
                    <p className="text-sm text-blue-600 font-medium">Tasa de Cumplimiento</p>
                    <p className="text-2xl font-bold text-blue-900">{formatPercent(categoryDetailReport.provisionFulfillmentRate)}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* Period Comparison Report Tab */}
      {activeTab === 'period' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Comparación de Períodos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Selecciona períodos (mínimo 2)</label>
                <div className="flex gap-2 flex-wrap">
                  {getUniquePeriods().map(period => (
                    <button
                      key={period.value}
                      onClick={() =>
                        selectedPeriods.includes(period.value)
                          ? handleRemovePeriod(period.value)
                          : handleAddPeriod(period.value)
                      }
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        selectedPeriods.includes(period.value)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {period.label}
                    </button>
                  ))}
                </div>
              </div>
              <Button onClick={handleLoadPeriodComparison} disabled={selectedPeriods.length < 2 || loadingCreate}>
                {loadingCreate ? 'Cargando...' : 'Generar Comparación'}
              </Button>
            </CardContent>
          </Card>

          {periodComparisonReport && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <p className="text-sm text-gray-600">Presupuesto Total</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(periodComparisonReport.totalBudget)}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <p className="text-sm text-gray-600">Gasto Total</p>
                    <p className="text-2xl font-bold text-red-600">{formatCurrency(periodComparisonReport.totalSpent)}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <p className="text-sm text-gray-600">Utilización Promedio</p>
                    <p className="text-2xl font-bold text-blue-600">{formatPercent(periodComparisonReport.averageUtilization)}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <p className="text-sm text-gray-600">Disponible</p>
                    <p className={`text-2xl font-bold ${periodComparisonReport.totalAvailable < 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {formatCurrency(periodComparisonReport.totalAvailable)}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Category Comparisons */}
              <Card>
                <CardHeader>
                  <CardTitle>Comparación por Categoría</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-4 text-sm font-semibold text-gray-700">Categoría</th>
                          {periodComparisonReport.periods.map(period => (
                            <th key={period} className="text-right py-2 px-4 text-sm font-semibold text-gray-700">
                              {period}
                            </th>
                          ))}
                          <th className="text-right py-2 px-4 text-sm font-semibold text-gray-700">Tendencia</th>
                        </tr>
                      </thead>
                      <tbody>
                        {periodComparisonReport.categoryComparisons.map(cat => (
                          <tr key={cat.categoryId} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4 text-sm font-medium text-gray-900">{cat.categoryName}</td>
                            {cat.periods.map(period => (
                              <td key={period.period} className="text-right py-3 px-4 text-sm text-gray-700">
                                {formatCurrency(period.totalSpent)}
                              </td>
                            ))}
                            <td className="text-right py-3 px-4 text-sm">
                              <span className={cat.spendingTrend > 0 ? 'text-red-600' : 'text-green-600'}>
                                {cat.spendingTrend > 0 ? '+' : ''}{formatPercent(cat.spendingTrend)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* Payment Method Report Tab */}
      {activeTab === 'payment' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Métodos de Pago</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4 items-end">
                <Select
                  label="Período"
                  options={getUniquePeriods()}
                  value={paymentPeriod}
                  onChange={(e) => setPaymentPeriod(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleLoadPaymentMethod} disabled={!paymentPeriod || loadingCreate}>
                  {loadingCreate ? 'Cargando...' : 'Generar Reporte'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {paymentMethodReport && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <p className="text-sm text-gray-600">Gasto Total</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(paymentMethodReport.totalSpent)}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <p className="text-sm text-gray-600">Transacciones</p>
                    <p className="text-2xl font-bold text-blue-600">{paymentMethodReport.totalTransactions}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Payment Methods List */}
              <Card>
                <CardHeader>
                  <CardTitle>Desglose por Método de Pago</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {paymentMethodReport.topPaymentMethods.map(pm => (
                      <div key={pm.paymentMethod} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-semibold text-gray-900">{pm.paymentMethod}</h4>
                          <span className="text-sm text-gray-600">{formatPercent(pm.percentage)}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${pm.percentage}%` }}
                          />
                        </div>
                        <p className="text-lg font-bold text-gray-900 mt-2">{formatCurrency(pm.amount)}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* Provision Fulfillment Report Tab */}
      {activeTab === 'provision' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cumplimiento de Provisiones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4 items-end">
                <Select
                  label="Período"
                  options={getUniquePeriods()}
                  value={provisionPeriod}
                  onChange={(e) => setProvisionPeriod(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleLoadProvisionFulfillment} disabled={!provisionPeriod || loadingCreate}>
                  {loadingCreate ? 'Cargando...' : 'Generar Reporte'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {provisionFulfillmentReport && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <p className="text-sm text-gray-600">Total Provisionado</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(provisionFulfillmentReport.totalProvisioned)}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <p className="text-sm text-gray-600">Abiertas</p>
                    <p className="text-2xl font-bold text-amber-600">{provisionFulfillmentReport.totalOpen}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <p className="text-sm text-gray-600">Cumplidas</p>
                    <p className="text-2xl font-bold text-green-600">{provisionFulfillmentReport.totalClosed}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <p className="text-sm text-gray-600">Tasa de Cumplimiento</p>
                    <p className="text-2xl font-bold text-blue-600">{formatPercent(provisionFulfillmentReport.overallFulfillmentRate)}</p>
                  </CardContent>
                </Card>
              </div>

              {provisionFulfillmentReport.overdueCount > 0 && (
                <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                  <p className="text-sm font-medium text-red-800">⚠️ {provisionFulfillmentReport.overdueCount} provisiones vencidas</p>
                  <p className="text-red-700">{formatCurrency(provisionFulfillmentReport.overdueAmount)}</p>
                </div>
              )}

              {/* Open Provisions */}
              {provisionFulfillmentReport.openProvisions.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Provisiones Abiertas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {provisionFulfillmentReport.openProvisions.slice(0, 10).map(prov => (
                        <div key={prov.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                          <div>
                            <p className="font-medium text-gray-900">{prov.description}</p>
                            <p className="text-xs text-gray-500">{prov.categoryName} • Vence: {formatDate(prov.dueDate)}</p>
                          </div>
                          <p className="font-bold text-amber-600">{formatCurrency(prov.amount)}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Category Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle>Cumplimiento por Categoría</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {provisionFulfillmentReport.categoryMetrics.map(cat => (
                      <div key={cat.categoryId} className="p-3 border rounded">
                        <div className="flex justify-between items-center mb-2">
                          <p className="font-medium text-gray-900">{cat.categoryName}</p>
                          <span className="text-sm font-bold text-blue-600">{formatPercent(cat.fulfillmentRate)}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{ width: `${cat.fulfillmentRate}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-gray-600 mt-1">
                          <span>{cat.closedCount} cumplidas</span>
                          <span>{cat.openCount} abiertas</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}
        </>
      )}
    </div>
  );
}
