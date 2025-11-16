import { useQuery } from '@tanstack/react-query';
import { reportService } from '@/services/reportService';
import { ExecutiveSummary } from '@/types';

export function useExecutiveSummary(period?: string) {
  return useQuery<ExecutiveSummary[], Error>({
    queryKey: ['executive-summary', period],
    queryFn: () => reportService.getExecutiveSummary(period),
    staleTime: 60000, // 1 minute
    gcTime: 300000, // 5 minutes
  });
}

export function useExecutiveSummaryByCategory(categoryId: string) {
  return useQuery<ExecutiveSummary, Error>({
    queryKey: ['executive-summary', categoryId],
    queryFn: () => reportService.getExecutiveSummaryByCategory(categoryId),
    staleTime: 60000, // 1 minute
    gcTime: 300000, // 5 minutes
    enabled: !!categoryId, // Only fetch if categoryId is provided
  });
}
