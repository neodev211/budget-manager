'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { provisionService } from '@/services/provisionService';
import { categoryService } from '@/services/categoryService';
import { Provision, CreateProvisionDTO, Category, ProvisionStatus } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Plus, Trash2, CheckCircle, Copy, ChevronDown } from 'lucide-react';

export default function ProvisionsPage() {
  const [provisions, setProvisions] = useState<Provision[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showBulkCopyModal, setShowBulkCopyModal] = useState(false);
  const [sourceCategoryId, setSourceCategoryId] = useState<string>('');
  const [targetCategoryId, setTargetCategoryId] = useState<string>('');
  const [selectedProvisionIds, setSelectedProvisionIds] = useState<Set<string>>(new Set());

  // Calcular fecha default: último día del mes siguiente
  const getDefaultDueDate = () => {
    const today = new Date();
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 2, 0); // Último día del mes siguiente
    return nextMonth.toISOString().split('T')[0];
  };

  const [formData, setFormData] = useState<CreateProvisionDTO>({
    item: '',
    categoryId: '',
    amount: 0,
    dueDate: getDefaultDueDate(),
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [provisionsData, categoriesData] = await Promise.all([
        provisionService.getAll(),
        categoryService.getAll()
      ]);
      setProvisions(provisionsData);
      setCategories(categoriesData);
      if (categoriesData.length > 0 && !formData.categoryId) {
        setFormData(prev => ({
          ...prev,
          categoryId: categoriesData[0].id,
          dueDate: getDefaultDueDate()
        }));
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Validar que la suma de provisiones no exceda el presupuesto
  const validateProvisionAmount = (categoryId: string, amount: number): boolean => {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return false;

    const categoryProvisions = provisions.filter(p =>
      p.categoryId === categoryId && p.status === ProvisionStatus.OPEN
    );
    const totalProvisioned = categoryProvisions.reduce((sum, p) => sum + Math.abs(p.amount), 0);
    const newTotal = totalProvisioned + Math.abs(amount);

    return newTotal <= category.monthlyBudget;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar que no exceda el presupuesto
    if (!validateProvisionAmount(formData.categoryId, formData.amount)) {
      const category = categories.find(c => c.id === formData.categoryId);
      alert(`La suma de provisiones no puede exceder el presupuesto de la categoría (${formatCurrency(category?.monthlyBudget || 0)})`);
      return;
    }

    try {
      const dataToSend = {
        ...formData,
        amount: Math.abs(formData.amount) * -1,
        dueDate: new Date(formData.dueDate).toISOString()
      };

      await provisionService.create(dataToSend);
      setFormData({
        item: '',
        categoryId: categories[0]?.id || '',
        amount: 0,
        dueDate: getDefaultDueDate(),
        notes: ''
      });
      setShowForm(false);
      loadData();
    } catch (error) {
      console.error('Error creating provision:', error);
      alert('Error al crear la provisión');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta provisión?')) return;
    try {
      await provisionService.delete(id);
      loadData();
    } catch (error) {
      console.error('Error deleting provision:', error);
      alert('Error al eliminar la provisión');
    }
  };

  const handleClose = async (id: string) => {
    try {
      await provisionService.update(id, { status: ProvisionStatus.CLOSED });
      loadData();
    } catch (error) {
      console.error('Error closing provision:', error);
      alert('Error al cerrar la provisión');
    }
  };

  const openBulkCopyModal = () => {
    if (categories.length < 2) {
      alert('Necesitas al menos 2 categorías para copiar provisiones');
      return;
    }
    setSourceCategoryId('');
    setTargetCategoryId('');
    setSelectedProvisionIds(new Set());
    setShowBulkCopyModal(true);
  };

  // Auto-select all provisions when source category changes
  const handleSourceCategoryChange = (categoryId: string) => {
    setSourceCategoryId(categoryId);
    if (categoryId) {
      const sourceProvisions = provisions.filter(p => p.categoryId === categoryId);
      const newSelected = new Set(sourceProvisions.map(p => p.id));
      setSelectedProvisionIds(newSelected);
    } else {
      setSelectedProvisionIds(new Set());
    }
  };

  // Validate sum against target budget
  const validateTargetBudget = () => {
    if (!targetCategoryId) return true;

    const targetCategory = categories.find(c => c.id === targetCategoryId);
    if (!targetCategory) return true;

    const selectedProvisionsSum = provisions
      .filter(p => selectedProvisionIds.has(p.id))
      .reduce((sum, p) => sum + Math.abs(p.amount), 0);

    return selectedProvisionsSum <= targetCategory.monthlyBudget;
  };

  const getTargetCategoryInfo = () => {
    if (!targetCategoryId) return null;
    const targetCategory = categories.find(c => c.id === targetCategoryId);
    return targetCategory;
  };

  const toggleProvisionSelection = (provisionId: string) => {
    const newSelected = new Set(selectedProvisionIds);
    if (newSelected.has(provisionId)) {
      newSelected.delete(provisionId);
    } else {
      newSelected.add(provisionId);
    }
    setSelectedProvisionIds(newSelected);
  };

  const handleBulkCopy = async () => {
    if (!sourceCategoryId || !targetCategoryId || selectedProvisionIds.size === 0) {
      alert('Selecciona categoría origen, destino y al menos una provisión');
      return;
    }

    if (sourceCategoryId === targetCategoryId) {
      alert('Las categorías origen y destino deben ser diferentes');
      return;
    }

    // Validate sum against target budget
    if (!validateTargetBudget()) {
      const targetCategory = getTargetCategoryInfo();
      const selectedProvisionsSum = provisions
        .filter(p => selectedProvisionIds.has(p.id))
        .reduce((sum, p) => sum + Math.abs(p.amount), 0);
      alert(`La suma de provisiones (${formatCurrency(selectedProvisionsSum)}) no puede exceder el presupuesto de la categoría destino (${formatCurrency(targetCategory?.monthlyBudget || 0)}). Por favor, deselecciona algunas provisiones o aumenta el presupuesto de la categoría destino.`);
      return;
    }

    try {
      await provisionService.bulkCopyToCategory(
        Array.from(selectedProvisionIds),
        targetCategoryId
      );
      alert(`${selectedProvisionIds.size} provisión(es) copiada(s) exitosamente`);
      setShowBulkCopyModal(false);
      setSourceCategoryId('');
      setTargetCategoryId('');
      setSelectedProvisionIds(new Set());
      loadData();
    } catch (error) {
      console.error('Error copying provisions:', error);
      alert('Error al copiar las provisiones');
    }
  };

  const getCategoryName = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.name || 'Categoría desconocida';
  };

  // Calcular monto usado (gastos asociados a la provisión)
  const getUsedAmount = (provision: Provision) => {
    return Math.abs(provision.usedAmount || 0);
  };

  // Agrupar provisiones por categoría y ordenar por categoría más reciente
  const groupedProvisions = categories.map(category => ({
    category,
    provisions: provisions
      .filter(p => p.categoryId === category.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  })).filter(group => group.provisions.length > 0);

  const openProvisions = provisions.filter(p => p.status === ProvisionStatus.OPEN);
  const totalOpen = openProvisions.reduce((sum, p) => sum + Math.abs(p.amount), 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Provisiones</h2>
          <p className="text-gray-600 mt-1">
            Gestiona tus provisiones (gastos anticipados)
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="w-4 h-4 mr-2" />
            Nueva Provisión
          </Button>
          <Button variant="secondary" onClick={openBulkCopyModal}>
            <Copy className="w-4 h-4 mr-2" />
            Copiar Provisiones
          </Button>
        </div>
      </div>

      {/* Total de Provisiones Abiertas */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Provisiones Abiertas
              </p>
              <p className="text-3xl font-bold text-amber-600 mt-1">
                {formatCurrency(totalOpen)}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {openProvisions.length} provisiones activas
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Nueva Provisión</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Descripción del Item"
                  required
                  value={formData.item}
                  onChange={(e) => setFormData({ ...formData, item: e.target.value })}
                  placeholder="ej: Donación Nov25"
                />
                <Input
                  label="Monto (PEN)"
                  required
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                  placeholder="640.00"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categoría
                  </label>
                  <select
                    required
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Seleccionar...</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name} - {cat.period}
                      </option>
                    ))}
                  </select>
                </div>
                <Input
                  label="Fecha de Vencimiento (Último día del mes siguiente)"
                  required
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                />
              </div>
              <Input
                label="Notas (opcional)"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
              <div className="flex gap-2">
                <Button type="submit">Guardar</Button>
                <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="text-center py-12">Cargando...</div>
      ) : groupedProvisions.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-500">
              No hay provisiones. Crea una para comenzar.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {groupedProvisions.map(({ category, provisions: catProvisions }) => (
            <Card key={category.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{category.name} - {category.period}</span>
                  <span className="text-sm font-normal text-gray-500">
                    {catProvisions.length} provisión(es)
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {catProvisions.map((provision) => {
                    const usedAmount = getUsedAmount(provision);
                    const remaining = Math.abs(provision.amount) - usedAmount;

                    return (
                      <div key={provision.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-lg text-gray-900">
                                {provision.item}
                              </h3>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                provision.status === ProvisionStatus.OPEN
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-green-100 text-green-800'
                              }`}>
                                {provision.status === ProvisionStatus.OPEN ? 'Abierta' : 'Cerrada'}
                              </span>
                            </div>

                            <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                              <div>
                                <p className="text-xs text-gray-500 truncate">Provisionado</p>
                                <p className="text-base md:text-lg font-bold text-amber-600 break-words">
                                  {formatCurrency(Math.abs(provision.amount))}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 truncate">Usado</p>
                                <p className="text-base md:text-lg font-bold text-blue-600 break-words">
                                  {formatCurrency(usedAmount)}
                                </p>
                              </div>
                              <div className="col-span-2 md:col-span-1">
                                <p className="text-xs text-gray-500 truncate">Restante</p>
                                <p className={`text-base md:text-lg font-bold break-words ${remaining > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                                  {formatCurrency(remaining)}
                                </p>
                              </div>
                            </div>

                            <p className="text-sm text-gray-600 mt-2">
                              Vence: {formatDate(provision.dueDate)}
                            </p>
                            {provision.notes && (
                              <p className="text-sm text-gray-500 mt-1">{provision.notes}</p>
                            )}
                          </div>
                          <div className="flex gap-2 ml-4">
                            {provision.status === ProvisionStatus.OPEN && (
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => handleClose(provision.id)}
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Cerrar
                              </Button>
                            )}
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleDelete(provision.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal para copiar múltiples provisiones */}
      {showBulkCopyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle>Copiar Provisiones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* SECCIÓN 1: Selección de Origen */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ¿De dónde?
                </label>
                <select
                  value={sourceCategoryId}
                  onChange={(e) => handleSourceCategoryChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Seleccionar categoría origen</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name} - {cat.period}
                    </option>
                  ))}
                </select>
              </div>

              {/* Lista de provisiones con auto-selección */}
              {sourceCategoryId && (
                <div className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex justify-between items-center mb-3">
                    <p className="text-sm font-medium text-gray-700">
                      Provisiones ({selectedProvisionIds.size} de {provisions.filter(p => p.categoryId === sourceCategoryId).length})
                    </p>
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {provisions
                      .filter(p => p.categoryId === sourceCategoryId)
                      .map((provision) => (
                        <div key={provision.id} className="flex items-center gap-3 p-2 hover:bg-white rounded cursor-pointer" onClick={() => toggleProvisionSelection(provision.id)}>
                          <input
                            type="checkbox"
                            id={`prov-${provision.id}`}
                            checked={selectedProvisionIds.has(provision.id)}
                            onChange={() => {}}
                            className="w-4 h-4 rounded border-gray-300"
                          />
                          <label htmlFor={`prov-${provision.id}`} className="flex-1 cursor-pointer">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-900">{provision.item}</span>
                              <span className="text-sm font-medium text-gray-700">
                                {formatCurrency(Math.abs(provision.amount))}
                              </span>
                            </div>
                          </label>
                        </div>
                      ))}
                  </div>
                  {provisions.filter(p => p.categoryId === sourceCategoryId).length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-2">No hay provisiones</p>
                  )}
                </div>
              )}

              {/* SECCIÓN 2: Destino y Validación */}
              {sourceCategoryId && selectedProvisionIds.size > 0 && (
                <div className="space-y-3 pt-4 border-t">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ¿A dónde?
                    </label>
                    <select
                      value={targetCategoryId}
                      onChange={(e) => setTargetCategoryId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Seleccionar categoría destino</option>
                      {categories
                        .filter(c => c.id !== sourceCategoryId)
                        .map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name} - {cat.period} ({formatCurrency(cat.monthlyBudget)})
                          </option>
                        ))}
                    </select>
                  </div>

                  {/* Validación integrada */}
                  {targetCategoryId && (
                    <div className={`p-3 rounded-md text-sm ${
                      validateTargetBudget()
                        ? 'bg-green-50 border border-green-200 text-green-800'
                        : 'bg-red-50 border border-red-200 text-red-800'
                    }`}>
                      <p className="font-medium">
                        {validateTargetBudget() ? '✓ Presupuesto disponible' : '✗ Excede presupuesto'}
                      </p>
                      <p className="text-xs mt-1">
                        {formatCurrency(
                          provisions
                            .filter(p => selectedProvisionIds.has(p.id))
                            .reduce((sum, p) => sum + Math.abs(p.amount), 0)
                        )} de {formatCurrency(getTargetCategoryInfo()?.monthlyBudget || 0)}
                      </p>
                    </div>
                  )}

                  {/* Nota de valores por defecto */}
                  <div className="bg-amber-50 p-2 rounded-md text-xs text-amber-800 border border-amber-200">
                    Se copiarán con monto usado = 0 y vencimiento en último día del mes siguiente
                  </div>
                </div>
              )}

              {/* Botones */}
              <div className="flex gap-2 pt-4 border-t">
                <Button
                  onClick={handleBulkCopy}
                  disabled={!sourceCategoryId || !targetCategoryId || selectedProvisionIds.size === 0 || !validateTargetBudget()}
                >
                  Copiar {selectedProvisionIds.size > 0 && `(${selectedProvisionIds.size})`}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setShowBulkCopyModal(false)}
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
