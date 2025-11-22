'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import FilterBar from '@/components/FilterBar';
import StatusBadge from '@/components/StatusBadge';
import { categoryService } from '@/services/categoryService';
import { expenseService } from '@/services/expenseService';
import { provisionService } from '@/services/provisionService';
import { Category, CreateCategoryDTO } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { useToastContext } from '@/lib/context/ToastContext';

const getDefaultPeriod = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

export default function CategoriesPage() {
  const toast = useToastContext();
  const [categories, setCategories] = useState<Category[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [provisions, setProvisions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [filterPeriod, setFilterPeriod] = useState<string>('');
  const [filterName, setFilterName] = useState<string>('');
  const [formData, setFormData] = useState<CreateCategoryDTO>({
    name: '',
    period: getDefaultPeriod(),
    monthlyBudget: 0,
    notes: ''
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const [categoriesData, expensesData, provisionsData] = await Promise.all([
        categoryService.getAll(),
        expenseService.getAll(),
        provisionService.getAll(),
      ]);
      setCategories(categoriesData);
      setExpenses(expensesData);
      setProvisions(provisionsData);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        // Update existing category
        await categoryService.update(editingId, formData);
        setEditingId(null);
        toast.success('✅ Categoría actualizada exitosamente');
      } else {
        // Create new category
        await categoryService.create(formData);
        toast.success('✅ Categoría creada exitosamente');
      }
      setFormData({ name: '', period: getDefaultPeriod(), monthlyBudget: 0, notes: '' });
      setShowForm(false);
      loadCategories();
    } catch (error) {
      console.error('Error al guardar categoría:', error);
      toast.error('❌ Error al guardar la categoría');
    }
  };

  const handleEdit = (category: Category) => {
    setEditingId(category.id);
    setFormData({
      name: category.name,
      period: category.period,
      monthlyBudget: category.monthlyBudget,
      notes: category.notes || ''
    });
    setShowForm(true);
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({ name: '', period: getDefaultPeriod(), monthlyBudget: 0, notes: '' });
    setShowForm(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta categoría?')) return;
    try {
      await categoryService.delete(id);
      toast.success('✅ Categoría eliminada exitosamente');
      loadCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('❌ Error al eliminar la categoría');
    }
  };

  const getUniquePeriods = () => {
    const periods = [...new Set(categories.map((c) => c.period))].sort().reverse();
    return periods.map((p) => ({ value: p, label: p }));
  };

  const getFilteredCategories = () => {
    let filtered = categories;

    if (filterPeriod) {
      filtered = filtered.filter((c) => c.period === filterPeriod);
    }

    if (filterName) {
      filtered = filtered.filter((c) =>
        c.name.toLowerCase().includes(filterName.toLowerCase())
      );
    }

    return filtered;
  };

  const getSortedCategories = () => {
    const filtered = getFilteredCategories();
    if (sortOrder === 'newest') {
      return [...filtered].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } else {
      return [...filtered].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    }
  };

  const handleClearFilters = () => {
    setFilterPeriod('');
    setFilterName('');
  };

  const hasActiveFilters = filterPeriod !== '' || filterName !== '';

  // Calcular presupuesto disponible por categoría
  const getAvailableBudget = (categoryId: string) => {
    const categoryExpenses = expenses.filter((e) => e.categoryId === categoryId);
    const categoryProvisions = provisions.filter((p) => p.categoryId === categoryId);

    const usedFromExpenses = categoryExpenses.reduce((sum, e) => sum + Math.abs(e.amount), 0);
    // ✅ FIXED: usedFromProvisions should be the saldo (remaining balance), not the full provisioned amount
    // Saldo = amount - usedAmount (provisioned - spent on linked expenses)
    const usedFromProvisions = categoryProvisions
      .filter((p) => p.status === 'OPEN')
      .reduce((sum, p) => {
        const provisioned = Math.abs(p.amount);
        const spent = Math.abs(p.usedAmount || 0);
        const saldo = provisioned - spent;
        return sum + saldo;
      }, 0);

    const category = categories.find((c) => c.id === categoryId);
    if (!category) return 0;

    return category.monthlyBudget - usedFromExpenses - usedFromProvisions;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Categorías</h2>
          <p className="text-gray-600 mt-1">
            Gestiona tus categorías de presupuesto ({getSortedCategories().length}/{categories.length})
          </p>
        </div>
        <div className="flex gap-2">
          {categories.length > 0 && (
            <Button
              variant="secondary"
              onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
            >
              {sortOrder === 'newest' ? 'Más recientes' : 'Más antiguas'}
            </Button>
          )}
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="w-4 h-4 mr-2" />
            Nueva Categoría
          </Button>
        </div>
      </div>

      {categories.length > 0 && (
        <FilterBar
          onClear={handleClearFilters}
          hasActiveFilters={hasActiveFilters}
          activeFilterCount={[filterPeriod, filterName].filter(f => f).length}
        >
          <Select
            label="Período"
            options={[{ value: '', label: 'Todos los períodos' }, ...getUniquePeriods()]}
            value={filterPeriod}
            onChange={(e) => setFilterPeriod(e.target.value)}
          />
          <Input
            label="Buscar por nombre"
            placeholder="ej: Sueldo, Gastos..."
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
          />
        </FilterBar>
      )}

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? 'Editar Categoría' : 'Nueva Categoría'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Nombre"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="ej: Sueldo, Gastos Hogar"
                />
                <Input
                  label="Período (YYYY-MM)"
                  required
                  type="month"
                  value={formData.period}
                  onChange={(e) => setFormData({ ...formData, period: e.target.value.replace('-', '-') })}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Presupuesto Mensual (PEN)"
                  required
                  type="number"
                  step="0.01"
                  value={formData.monthlyBudget}
                  onChange={(e) => setFormData({ ...formData, monthlyBudget: parseFloat(e.target.value) })}
                />
                <Input
                  label="Notas (opcional)"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit">{editingId ? 'Actualizar' : 'Guardar'}</Button>
                <Button type="button" variant="secondary" onClick={handleCancel}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="text-center py-12">Cargando...</div>
      ) : categories.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-500">
              No hay categorías. Crea una para comenzar.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {getSortedCategories().map((category) => (
            <Card key={category.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg text-gray-900">
                        {category.name}
                      </h3>
                      <StatusBadge
                        available={getAvailableBudget(category.id)}
                        budget={category.monthlyBudget}
                        size="sm"
                      />
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Período: {category.period}
                    </p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleEdit(category)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(category.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="bg-blue-50 p-3 rounded">
                    <p className="text-xs font-medium text-blue-600">Presupuesto</p>
                    <p className="text-lg font-bold text-blue-900">
                      {formatCurrency(category.monthlyBudget)}
                    </p>
                  </div>
                  <div className={`p-3 rounded ${getAvailableBudget(category.id) < 0 ? 'bg-red-50' : 'bg-green-50'}`}>
                    <p className={`text-xs font-medium ${getAvailableBudget(category.id) < 0 ? 'text-red-600' : 'text-green-600'}`}>
                      Disponible
                    </p>
                    <p className={`text-lg font-bold ${getAvailableBudget(category.id) < 0 ? 'text-red-900' : 'text-green-900'}`}>
                      {formatCurrency(getAvailableBudget(category.id))}
                    </p>
                  </div>
                </div>

                {category.notes && (
                  <p className="text-sm text-gray-600 mt-3">
                    {category.notes}
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-3">
                  Creado: {formatDate(category.createdAt)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
