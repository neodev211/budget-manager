'use client';

import { useEffect, useState, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import FilterBar from '@/components/FilterBar';
import StatusBadge from '@/components/StatusBadge';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { categoryService } from '@/services/categoryService';
import { expenseService } from '@/services/expenseService';
import { provisionService } from '@/services/provisionService';
import { Category, CreateCategoryDTO } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Plus, Trash2, Edit2, Home, Wallet, Package, FileText } from 'lucide-react';
import { useToastContext } from '@/lib/context/ToastContext';
import { useKeyboardShortcuts, KeyboardShortcut } from '@/lib/hooks/useKeyboardShortcuts';
import { CommandPalette, CommandPaletteAction } from '@/components/ui/CommandPalette';
import { useRouter } from 'next/navigation';
import { useFilterState } from '@/lib/hooks/useFilterState';

const getDefaultPeriod = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

export default function CategoriesPage() {
  const toast = useToastContext();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [provisions, setProvisions] = useState<any[]>([]);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const { filters, setFilterValue, clearFilters, hasActiveFilters } = useFilterState({
    pageKey: 'categories',
    defaultFilters: {
      period: '',
      name: ''
    }
  });
  const [formData, setFormData] = useState<CreateCategoryDTO>({
    name: '',
    period: getDefaultPeriod(),
    monthlyBudget: 0,
    notes: ''
  });
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; categoryId: string | null }>({
    isOpen: false,
    categoryId: null,
  });

  // Refs for focus management
  const nameInputRef = useRef<HTMLInputElement>(null);
  const filterNameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoadingInitial(true);
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
      toast.error('❌ Error al cargar las categorías');
    } finally {
      setLoadingInitial(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        setLoadingUpdate(true);
      } else {
        setLoadingCreate(true);
      }

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
    } finally {
      setLoadingCreate(false);
      setLoadingUpdate(false);
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

  const handleDeleteClick = (id: string) => {
    setDeleteModal({ isOpen: true, categoryId: id });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.categoryId) return;
    try {
      setLoadingDelete(deleteModal.categoryId);
      await categoryService.delete(deleteModal.categoryId);
      toast.success('✅ Categoría eliminada exitosamente');
      setDeleteModal({ isOpen: false, categoryId: null });
      loadCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('❌ Error al eliminar la categoría');
      setDeleteModal({ isOpen: false, categoryId: null });
    } finally {
      setLoadingDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ isOpen: false, categoryId: null });
  };

  const getUniquePeriods = () => {
    const periods = [...new Set(categories.map((c) => c.period))].sort().reverse();
    return periods.map((p) => ({ value: p, label: p }));
  };

  const getFilteredCategories = () => {
    let filtered = categories;

    if (filters.period) {
      filtered = filtered.filter((c) => c.period === filters.period);
    }

    if (filters.name) {
      filtered = filtered.filter((c) =>
        c.name.toLowerCase().includes(filters.name.toLowerCase())
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


  // Focus first input when form opens
  useEffect(() => {
    if (showForm && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [showForm]);

  // Keyboard shortcuts
  const handleSubmitShortcut = () => {
    if (showForm) {
      const form = document.querySelector('form') as HTMLFormElement;
      if (form) {
        form.requestSubmit();
      }
    }
  };

  useKeyboardShortcuts([
    {
      key: 'n',
      ctrl: true,
      callback: () => {
        if (!showForm) {
          setShowForm(true);
        }
      },
      description: 'Create new category'
    },
    {
      key: 's',
      ctrl: true,
      callback: handleSubmitShortcut,
      description: 'Save category'
    },
    {
      key: 'Escape',
      callback: () => {
        if (showForm) {
          handleCancel();
        }
      },
      description: 'Cancel'
    },
    {
      key: 'f',
      ctrl: true,
      callback: () => {
        if (filterNameRef.current) {
          filterNameRef.current.focus();
        }
      },
      description: 'Focus on name filter'
    }
  ]);

  // CommandPalette actions
  const commandPaletteActions: CommandPaletteAction[] = [
    {
      id: 'new-category',
      label: 'Create New Category',
      description: 'Open form to create a new category',
      category: 'Categories',
      icon: <Plus className="w-4 h-4" />,
      shortcut: { key: 'n', ctrl: true, callback: () => setShowForm(true) },
      action: () => setShowForm(true)
    },
    {
      id: 'save-category',
      label: 'Save Category',
      description: 'Save the current category form',
      category: 'Categories',
      shortcut: { key: 's', ctrl: true, callback: handleSubmitShortcut },
      action: handleSubmitShortcut
    },
    {
      id: 'clear-filters',
      label: 'Clear All Filters',
      description: 'Reset all active filters',
      category: 'Categories',
      action: clearFilters
    },
    {
      id: 'go-home',
      label: 'Go to Home',
      description: 'Navigate to home page',
      category: 'Navigation',
      icon: <Home className="w-4 h-4" />,
      action: () => router.push('/')
    },
    {
      id: 'go-expenses',
      label: 'Go to Expenses',
      description: 'Navigate to expenses page',
      category: 'Navigation',
      icon: <Wallet className="w-4 h-4" />,
      action: () => router.push('/expenses')
    },
    {
      id: 'go-provisions',
      label: 'Go to Provisions',
      description: 'Navigate to provisions page',
      category: 'Navigation',
      icon: <Package className="w-4 h-4" />,
      action: () => router.push('/provisions')
    },
    {
      id: 'go-reports',
      label: 'Go to Reports',
      description: 'Navigate to reports page',
      category: 'Navigation',
      icon: <FileText className="w-4 h-4" />,
      action: () => router.push('/reports')
    }
  ];

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
      {/* Command Palette */}
      <CommandPalette actions={commandPaletteActions} />

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
          onClear={clearFilters}
          hasActiveFilters={hasActiveFilters}
          activeFilterCount={[filters.period, filters.name].filter(f => f).length}
        >
          <Select
            label="Período"
            options={[{ value: '', label: 'Todos los períodos' }, ...getUniquePeriods()]}
            value={filters.period}
            onChange={(e) => setFilterValue('period', e.target.value)}
          />
          <Input
            ref={filterNameRef}
            label="Buscar por nombre"
            placeholder="ej: Sueldo, Gastos..."
            value={filters.name}
            onChange={(e) => setFilterValue('name', e.target.value)}
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
                  ref={nameInputRef}
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
                <Button type="submit" disabled={loadingCreate || loadingUpdate}>
                  {loadingCreate || loadingUpdate ? 'Procesando...' : editingId ? 'Actualizar' : 'Guardar'}
                </Button>
                <Button type="button" variant="secondary" onClick={handleCancel} disabled={loadingCreate || loadingUpdate}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {loadingInitial ? (
        <Card>
          <CardHeader>
            <CardTitle>Categorías</CardTitle>
          </CardHeader>
          <CardContent>
            <SkeletonLoader type="card" count={3} />
          </CardContent>
        </Card>
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
                      onClick={() => handleDeleteClick(category.id)}
                      disabled={loadingDelete === category.id}
                    >
                      {loadingDelete === category.id ? '⏳' : <Trash2 className="w-4 h-4" />}
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

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        title="Eliminar Categoría"
        message="¿Estás seguro de que deseas eliminar esta categoría? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        isDangerous={true}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </div>
  );
}
