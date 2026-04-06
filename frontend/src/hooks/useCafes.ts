import { useQuery } from '@tanstack/react-query'
import { fetchCafe, fetchCafes, fetchMapPins } from '../api/cafes'
import type { CafeFilters } from '../types/cafe'

export function useCafes(filters: CafeFilters = {}) {
  return useQuery({
    queryKey: ['cafes', filters],
    queryFn: () => fetchCafes(filters),
  })
}

export function useCafe(id: string) {
  return useQuery({
    queryKey: ['cafe', id],
    queryFn: () => fetchCafe(id),
    enabled: !!id,
  })
}

export function useMapPins() {
  return useQuery({
    queryKey: ['cafes', 'map'],
    queryFn: fetchMapPins,
  })
}
