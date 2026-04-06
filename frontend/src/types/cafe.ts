export interface CafeMapPin {
  id: string
  name: string
  latitude: number
  longitude: number
  google_rating: number | null
}

export interface CafeListItem extends CafeMapPin {
  slug: string
  address: string
  district: string | null
  tags: string[] | null
  photos: string[] | null
  accepts_bookings: boolean
  google_review_count: number | null
}

export interface CafeDetail extends CafeListItem {
  description: string | null
  phone: string | null
  website: string | null
  instagram: string | null
  google_maps_url: string | null
  google_place_id: string | null
  opening_hours: Record<string, string> | null
}

export interface CafeFilters {
  district?: string
  min_rating?: number
  tags?: string
  q?: string
  limit?: number
  offset?: number
}
