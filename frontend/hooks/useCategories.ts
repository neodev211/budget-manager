import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryService } from '@/services/categoryService';
import { Category, CreateCategoryDTO } from '@/types';

export function useCategories() {
  return useQuery<Category[], Error>({
    queryKey: ['categories'],
    queryFn: () => categoryService.getAll(),
    staleTime: 60000, // 1 minute
    gcTime: 300000, // 5 minutes
  });
}

export function useCategoryById(id: string) {
  return useQuery<Category, Error>({
    queryKey: ['categories', id],
    queryFn: () => categoryService.getById(id),
    staleTime: 60000,
    gcTime: 300000,
    enabled: !!id,
  });
}

export function useCategoriesByPeriod(period: string) {
  return useQuery<Category[], Error>({
    queryKey: ['categories', 'period', period],
    queryFn: () => categoryService.getByPeriod(period),
    staleTime: 60000,
    gcTime: 300000,
    enabled: !!period,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCategoryDTO) => categoryService.create(data),
    onSuccess: () => {
      // Invalidate categories cache to refetch
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

export function useUpdateCategory(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<CreateCategoryDTO>) =>
      categoryService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories', id] });
    },
  });
}

export function useDeleteCategory(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => categoryService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.removeQueries({ queryKey: ['categories', id] });
    },
  });
}
