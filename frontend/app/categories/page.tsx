'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { categoryService } from '@/services/categoryService';
import { Category, CreateCategoryDTO } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Plus, Trash2, Edit2 } from 'lucide-react';

const getDefaultPeriod = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
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
      const data = await categoryService.getAll();
      setCategories(data);
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
        alert('Categoría actualizada exitosamente');
      } else {
        // Create new category
        await categoryService.create(formData);
      }
      setFormData({ name: '', period: getDefaultPeriod(), monthlyBudget: 0, notes: '' });
      setShowForm(false);
      loadCategories();
    } catch (error) {
      console.error('Error al guardar categoría:', error);
      alert('Error al guardar la categoría');
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
      loadCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Error al eliminar la categoría');
    }
  };

  const getSortedCategories = () => {
    if (sortOrder === 'newest') {
      return [...categories].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } else {
      return [...categories].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Categorías</h2>
          <p className="text-gray-600 mt-1">
            Gestiona tus categorías de presupuesto ({categories.length})
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
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-900">
                      {category.name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Período: {category.period}
                    </p>
                    <p className="text-2xl font-bold text-blue-600 mt-3">
                      {formatCurrency(category.monthlyBudget)}
                    </p>
                    {category.notes && (
                      <p className="text-sm text-gray-600 mt-2">
                        {category.notes}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-3">
                      Creado: {formatDate(category.createdAt)}
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
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
