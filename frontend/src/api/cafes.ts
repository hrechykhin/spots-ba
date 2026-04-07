import type { CafeDetail, CafeFilters, CafeListResponse, CafeMapPin } from '../types/cafe'

const BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`)
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`)
  return res.json()
}

export function fetchCafes(filters: CafeFilters = {}): Promise<CafeListResponse> {
  const params = new URLSearchParams()
  if (filters.district) params.set('district', filters.district)
  if (filters.min_rating != null) params.set('min_rating', String(filters.min_rating))
  if (filters.tags) params.set('tags', filters.tags)
  if (filters.q) params.set('q', filters.q)
  if (filters.limit != null) params.set('limit', String(filters.limit))
  if (filters.offset != null) params.set('offset', String(filters.offset))
  const qs = params.toString()
  return apiFetch<CafeListResponse>(`/cafes${qs ? `?${qs}` : ''}`)
}

export function fetchCafe(id: string): Promise<CafeDetail> {
  return apiFetch<CafeDetail>(`/cafes/${id}`)
}

export function fetchMapPins(): Promise<CafeMapPin[]> {
  return apiFetch<CafeMapPin[]>('/cafes/map')
}
