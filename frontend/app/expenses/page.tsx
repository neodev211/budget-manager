'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import FilterBar from '@/components/FilterBar';
import { expenseService } from '@/services/expenseService';
import { categoryService } from '@/services/categoryService';
import { provisionService } from '@/services/provisionService';
import { Expense, CreateExpenseDTO, Category, Provision, ProvisionStatus } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Plus, Trash2, Edit2, Wallet } from 'lucide-react';

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [provisions, setProvisions] = useState<Provision[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [filterDateFrom, setFilterDateFrom] = useState<string>('');
  const [filterDateTo, setFilterDateTo] = useState<string>('');
  const [filterCategoryId, setFilterCategoryId] = useState<string>('');
  const [filterProvisionId, setFilterProvisionId] = useState<string>('');
  const [filterDescription, setFilterDescription] = useState<string>('');
  const [formData, setFormData] = useState<CreateExpenseDTO>({
    date: new Date().toISOString().split('T')[0],
    description: '',
    categoryId: '',
    amount: 0,
    provisionId: undefined
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [expensesData, categoriesData, provisionsData] = await Promise.all([
        expenseService.getAll(),
        categoryService.getAll(),
        provisionService.getOpenProvisions()
      ]);
      setExpenses(expensesData);
      setCategories(categoriesData);
      setProvisions(provisionsData);
      if (categoriesData.length > 0 && !formData.categoryId) {
        setFormData(prev => ({ ...prev, categoryId: categoriesData[0].id }));
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calcular saldo disponible de categoría
  const getCategoryBalance = (categoryId: string): number => {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return 0;

    const categoryExpenses = expenses.filter(e => e.categoryId === categoryId);
    const usedAmount = categoryExpenses.reduce((sum, e) => sum + Math.abs(e.amount), 0);

    return category.monthlyBudget - usedAmount;
  };

  // Calcular saldo disponible de provisión
  const getProvisionBalance = (provisionId: string): number => {
    const provision = provisions.find(p => p.id === provisionId);
    if (!provision) return 0;

    const usedAmount = Math.abs(provision.usedAmount || 0);
    return Math.abs(provision.amount) - usedAmount;
  };

  // Validar si el monto del gasto es válido
  const validateExpenseAmount = (): { valid: boolean; message: string } => {
    const amount = Math.abs(formData.amount);

    // Validar que el monto sea mayor a 0
    if (amount === 0) {
      return {
        valid: false,
        message: 'El monto debe ser mayor a 0'
      };
    }

    // Validar que se haya seleccionado una categoría
    if (!formData.categoryId) {
      return {
        valid: false,
        message: 'Debes seleccionar una categoría'
      };
    }

    // Validar que se haya ingresado una descripción
    if (!formData.description.trim()) {
      return {
        valid: false,
        message: 'Debes ingresar una descripción'
      };
    }

    // Validar saldo de categoría
    const categoryBalance = getCategoryBalance(formData.categoryId);
    if (amount > categoryBalance) {
      return {
        valid: false,
        message: `El gasto (${formatCurrency(amount)}) excede el saldo disponible de la categoría (${formatCurrency(categoryBalance)})`
      };
    }

    // Validar saldo de provisión si está asociada
    if (formData.provisionId) {
      const provisionBalance = getProvisionBalance(formData.provisionId);
      if (amount > provisionBalance) {
        return {
          valid: false,
          message: `El gasto (${formatCurrency(amount)}) excede el saldo disponible de la provisión (${formatCurrency(provisionBalance)})`
        };
      }
    }

    return { valid: true, message: '' };
  };

  // Obtener estado actual de validación para mostrar en pantalla
  const currentValidation = validateExpenseAmount();


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Convertir la fecha a ISO 8601 y asegurarnos que el monto sea negativo
      const dataToSend = {
        ...formData,
        date: new Date(formData.date).toISOString(),
        amount: Math.abs(formData.amount) * -1 // Siempre negativo
      };

      if (editingId) {
        // Update existing expense
        await expenseService.update(editingId, dataToSend);
        setEditingId(null);
        alert('Gasto actualizado exitosamente');
      } else {
        // Create new expense
        await expenseService.create(dataToSend);
      }
      setFormData({
        date: new Date().toISOString().split('T')[0],
        description: '',
        categoryId: categories[0]?.id || '',
        amount: 0,
        provisionId: undefined
      });
      setShowForm(false);
      loadData();
    } catch (error) {
      console.error('Error al guardar gasto:', error);
      alert('Error al guardar el gasto');
    }
  };

  const handleEdit = (expense: Expense) => {
    setEditingId(expense.id);
    setFormData({
      date: expense.date.split('T')[0],
      description: expense.description,
      categoryId: expense.categoryId,
      amount: Math.abs(expense.amount),
      provisionId: expense.provisionId
    });
    setShowForm(true);
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      description: '',
      categoryId: categories[0]?.id || '',
      amount: 0,
      provisionId: undefined
    });
    setShowForm(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este gasto?')) return;
    try {
      await expenseService.delete(id);
      loadData();
    } catch (error) {
      console.error('Error deleting expense:', error);
      alert('Error al eliminar el gasto');
    }
  };

  const getCategoryName = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.name || 'Categoría desconocida';
  };

  const getProvisionName = (provisionId?: string) => {
    if (!provisionId) return '-';
    return provisions.find(p => p.id === provisionId)?.item || 'Provisión desconocida';
  };

  // Filtrar provisiones abiertas de la categoría seleccionada
  const getAvailableProvisions = (categoryId: string): Provision[] => {
    return provisions.filter(p => p.categoryId === categoryId && p.status === ProvisionStatus.OPEN);
  };

  const totalExpenses = expenses.reduce((sum, exp) => sum + Math.abs(exp.amount), 0);

  const getFilteredExpenses = () => {
    let filtered = expenses;

    if (filterDateFrom) {
      filtered = filtered.filter((e) => new Date(e.date) >= new Date(filterDateFrom));
    }

    if (filterDateTo) {
      filtered = filtered.filter((e) => new Date(e.date) <= new Date(filterDateTo));
    }

    if (filterCategoryId) {
      filtered = filtered.filter((e) => e.categoryId === filterCategoryId);
    }

    if (filterProvisionId) {
      filtered = filtered.filter((e) => e.provisionId === filterProvisionId);
    }

    if (filterDescription) {
      filtered = filtered.filter((e) =>
        e.description.toLowerCase().includes(filterDescription.toLowerCase())
      );
    }

    return filtered;
  };

  const getSortedExpenses = () => {
    const filtered = getFilteredExpenses();
    if (sortOrder === 'newest') {
      return [...filtered].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    } else {
      return [...filtered].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
    }
  };

  const handleClearFilters = () => {
    setFilterDateFrom('');
    setFilterDateTo('');
    setFilterCategoryId('');
    setFilterProvisionId('');
    setFilterDescription('');
  };

  const hasActiveFilters =
    filterDateFrom !== '' ||
    filterDateTo !== '' ||
    filterCategoryId !== '' ||
    filterProvisionId !== '' ||
    filterDescription !== '';

  const getFilteredTotalExpenses = () => {
    return getFilteredExpenses().reduce((sum, exp) => sum + Math.abs(exp.amount), 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gastos</h2>
          <p className="text-gray-600 mt-1">
            Registra tus gastos de forma simple (solo 3 campos)
          </p>
        </div>
        <div className="flex gap-2">
          {expenses.length > 0 && (
            <Button
              variant="secondary"
              onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
            >
              {sortOrder === 'newest' ? 'Más recientes' : 'Más antiguos'}
            </Button>
          )}
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Gasto
          </Button>
        </div>
      </div>

      {/* Total de Gastos */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total de Gastos {hasActiveFilters && `(${getSortedExpenses().length}/${expenses.length})`}
              </p>
              <p className="text-3xl font-bold text-red-600 mt-1">
                {formatCurrency(hasActiveFilters ? getFilteredTotalExpenses() : totalExpenses)}
              </p>
            </div>
            <Wallet className="h-12 w-12 text-red-400" />
          </div>
        </CardContent>
      </Card>

      {/* Filtros */}
      {expenses.length > 0 && (
        <FilterBar onClear={handleClearFilters} hasActiveFilters={hasActiveFilters}>
          <Input
            label="Desde"
            type="date"
            value={filterDateFrom}
            onChange={(e) => setFilterDateFrom(e.target.value)}
          />
          <Input
            label="Hasta"
            type="date"
            value={filterDateTo}
            onChange={(e) => setFilterDateTo(e.target.value)}
          />
          <Select
            label="Categoría"
            options={[{ value: '', label: 'Todas' }, ...categories.map((c) => ({ value: c.id, label: c.name }))]}
            value={filterCategoryId}
            onChange={(e) => setFilterCategoryId(e.target.value)}
          />
          <Select
            label="Provisión"
            options={[{ value: '', label: 'Todas' }, ...provisions.map((p) => ({ value: p.id, label: p.item }))]}
            value={filterProvisionId}
            onChange={(e) => setFilterProvisionId(e.target.value)}
          />
          <Input
            label="Buscar descripción"
            placeholder="Ej: Supermercado..."
            value={filterDescription}
            onChange={(e) => setFilterDescription(e.target.value)}
          />
        </FilterBar>
      )}

      {/* Formulario Simple - Solo 3 campos */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? 'Editar Gasto' : 'Registrar Gasto (3 campos obligatorios)'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Campo 1: Monto */}
                <Input
                  label="1. Monto (PEN)"
                  required
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                  placeholder="150.00"
                />

                {/* Campo 2: Descripción */}
                <Input
                  label="2. Descripción"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Compra de supermercado"
                />

                {/* Campo 3: Categoría */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    3. Categoría
                  </label>
                  <select
                    required
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value, provisionId: undefined })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Seleccionar...</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name} (Saldo: {formatCurrency(getCategoryBalance(cat.id))})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Provisión (opcional) */}
              {formData.categoryId && getAvailableProvisions(formData.categoryId).length > 0 && (
                <div className="border-t pt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Asociar a Provisión (opcional)
                  </label>
                  <select
                    value={formData.provisionId || ''}
                    onChange={(e) => setFormData({ ...formData, provisionId: e.target.value || undefined })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Ninguna</option>
                    {getAvailableProvisions(formData.categoryId).map((prov) => (
                      <option key={prov.id} value={prov.id}>
                        {prov.item} (Saldo: {formatCurrency(getProvisionBalance(prov.id))})
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Solo se muestran provisiones abiertas de esta categoría
                  </p>
                </div>
              )}

              {/* Fecha (opcional - por defecto hoy) */}
              <div className="border-t pt-4">
                <Input
                  label="Fecha (opcional - por defecto hoy)"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>

              {/* Mensaje de validación */}
              {!currentValidation.valid && (
                <div className="border-t pt-4 bg-red-50 p-3 rounded-md border border-red-200">
                  <p className="text-sm font-medium text-red-800">
                    ✗ {currentValidation.message}
                  </p>
                </div>
              )}

              {currentValidation.valid && (
                <div className="border-t pt-4 bg-green-50 p-3 rounded-md border border-green-200">
                  <p className="text-sm font-medium text-green-800">
                    ✓ El gasto puede ser registrado
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={!currentValidation.valid}
                >
                  {editingId ? 'Actualizar Gasto' : 'Guardar Gasto'}
                </Button>
                <Button type="button" variant="secondary" onClick={handleCancel}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Lista de Gastos */}
      {loading ? (
        <div className="text-center py-12">Cargando...</div>
      ) : expenses.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-500">
              No hay gastos registrados. Crea uno para comenzar.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Lista de Gastos ({getSortedExpenses().length}/{expenses.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Descripción
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Categoría
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Provisión
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Monto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {getSortedExpenses().map((expense) => (
                    <tr key={expense.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(expense.date)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {expense.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {getCategoryName(expense.categoryId)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {getProvisionName(expense.provisionId)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-red-600">
                        {formatCurrency(Math.abs(expense.amount))}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleEdit(expense)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDelete(expense.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
