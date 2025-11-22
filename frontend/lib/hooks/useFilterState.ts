import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

// Safely get search params with error handling
const getSearchParams = (): URLSearchParams => {
  if (typeof window === 'undefined') {
    return new URLSearchParams();
  }
  return new URLSearchParams(window.location.search);
};

export interface FilterState {
  [key: string]: string;
}

export interface UseFilterStateOptions {
  pageKey: string; // e.g., 'expenses', 'categories', 'provisions' for localStorage key
  defaultFilters: FilterState;
  persistToLocalStorage?: boolean;
  syncWithUrl?: boolean;
}

/**
 * Custom hook for managing persistent filter state with URL sync and localStorage
 *
 * Features:
 * - Syncs filters with URL search params (shareable filter configurations)
 * - Persists filters to localStorage (remembered on page reload)
 * - Provides clear/reset functionality
 * - Returns hooks for saving/loading favorite filters
 *
 * Usage:
 * const {
 *   filters,
 *   setFilterValue,
 *   clearFilters,
 *   hasActiveFilters,
 *   saveFavoriteFilters,
 *   loadFavoriteFilters,
 *   getFavoriteFilters
 * } = useFilterState({
 *   pageKey: 'expenses',
 *   defaultFilters: { categoryId: '', dateFrom: '', dateTo: '' },
 *   persistToLocalStorage: true,
 *   syncWithUrl: true
 * });
 */
export function useFilterState({
  pageKey,
  defaultFilters,
  persistToLocalStorage = true,
  syncWithUrl = true
}: UseFilterStateOptions) {
  const router = useRouter();
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize filters from URL params or localStorage
  useEffect(() => {
    if (isInitialized) return;

    const initialFilters = { ...defaultFilters };

    // Priority 1: Load from URL search params (highest priority - allows sharing)
    if (syncWithUrl) {
      let hasUrlParams = false;
      const searchParams = getSearchParams();
      for (const [key, value] of searchParams.entries()) {
        if (key in defaultFilters) {
          initialFilters[key] = value;
          hasUrlParams = true;
        }
      }
      if (hasUrlParams) {
        setFilters(initialFilters);
        setIsInitialized(true);
        return;
      }
    }

    // Priority 2: Load from localStorage
    if (persistToLocalStorage) {
      const savedFilters = localStorage.getItem(`${pageKey}_filters`);
      if (savedFilters) {
        try {
          const parsedFilters = JSON.parse(savedFilters);
          const validatedFilters = { ...defaultFilters };
          for (const key in parsedFilters) {
            if (key in defaultFilters) {
              validatedFilters[key] = parsedFilters[key];
            }
          }
          setFilters(validatedFilters);
        } catch (error) {
          console.error('Error parsing saved filters:', error);
        }
      }
    }

    setIsInitialized(true);
  }, [pageKey, persistToLocalStorage, syncWithUrl, defaultFilters, isInitialized]);

  // Update filter value and sync with URL/localStorage
  const setFilterValue = useCallback(
    (key: string, value: string) => {
      setFilters((prev) => {
        const updated = { ...prev, [key]: value };

        // Sync with URL
        if (syncWithUrl) {
          const params = new URLSearchParams();
          for (const [k, v] of Object.entries(updated)) {
            if (v) {
              params.set(k, v);
            }
          }
          const queryString = params.toString();
          const newUrl = queryString ? `?${queryString}` : '';
          router.push(newUrl);
        }

        // Sync with localStorage
        if (persistToLocalStorage) {
          localStorage.setItem(`${pageKey}_filters`, JSON.stringify(updated));
        }

        return updated;
      });
    },
    [pageKey, router, persistToLocalStorage, syncWithUrl]
  );

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters(defaultFilters);

    // Clear URL params
    if (syncWithUrl) {
      router.push('');
    }

    // Clear localStorage
    if (persistToLocalStorage) {
      localStorage.removeItem(`${pageKey}_filters`);
    }
  }, [pageKey, router, persistToLocalStorage, syncWithUrl, defaultFilters]);

  // Check if any filters are active
  const hasActiveFilters = Object.values(filters).some((value) => value !== '');

  // Save current filters as favorite with a name
  const saveFavoriteFilters = useCallback(
    (name: string) => {
      const favorites = getFavoriteFilters();
      const newFavorite = {
        id: Date.now().toString(),
        name,
        filters,
        createdAt: new Date().toISOString()
      };
      favorites.push(newFavorite);
      localStorage.setItem(
        `${pageKey}_favorite_filters`,
        JSON.stringify(favorites)
      );
      return newFavorite;
    },
    [pageKey, filters]
  );

  // Get all saved favorite filters
  const getFavoriteFilters = useCallback(() => {
    const saved = localStorage.getItem(`${pageKey}_favorite_filters`);
    if (!saved) return [];
    try {
      return JSON.parse(saved);
    } catch {
      return [];
    }
  }, [pageKey]);

  // Load a favorite filter by ID
  const loadFavoriteFilters = useCallback(
    (id: string) => {
      const favorites = getFavoriteFilters();
      const favorite = favorites.find((f: any) => f.id === id);
      if (favorite) {
        setFilters(favorite.filters);
        if (persistToLocalStorage) {
          localStorage.setItem(`${pageKey}_filters`, JSON.stringify(favorite.filters));
        }
        if (syncWithUrl) {
          const params = new URLSearchParams();
          for (const [k, v] of Object.entries(favorite.filters)) {
            if (v) {
              params.set(k, String(v));
            }
          }
          const queryString = params.toString();
          const newUrl = queryString ? `?${queryString}` : '';
          router.push(newUrl);
        }
      }
    },
    [pageKey, router, persistToLocalStorage, syncWithUrl, getFavoriteFilters]
  );

  // Delete a favorite filter
  const deleteFavoriteFilters = useCallback(
    (id: string) => {
      const favorites = getFavoriteFilters();
      const updated = favorites.filter((f: any) => f.id !== id);
      localStorage.setItem(
        `${pageKey}_favorite_filters`,
        JSON.stringify(updated)
      );
    },
    [pageKey, getFavoriteFilters]
  );

  return {
    filters,
    setFilterValue,
    clearFilters,
    hasActiveFilters,
    saveFavoriteFilters,
    loadFavoriteFilters,
    deleteFavoriteFilters,
    getFavoriteFilters
  };
}
