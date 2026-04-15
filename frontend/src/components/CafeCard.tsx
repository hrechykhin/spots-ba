import { Link } from 'react-router-dom'
import type { CafeListItem } from '../types/cafe'
import { RatingBadge } from './RatingBadge'
import { useFavorites } from '../hooks/useFavorites'

interface CafeCardProps {
  cafe: CafeListItem
}

const PLACEHOLDER = 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&q=80'

export function CafeCard({ cafe }: CafeCardProps) {
  const photo = cafe.photos?.[0] ?? PLACEHOLDER
  const { isFavorite, toggle } = useFavorites()
  const fav = isFavorite(cafe.id)

  return (
    <Link
      to={`/cafe/${cafe.slug}`}
      className="group block bg-white rounded-2xl overflow-hidden shadow-sm border border-stone-200 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
    >
      <div className="relative h-48 overflow-hidden bg-stone-100">
        <img
          src={photo}
          alt={cafe.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        <button
          onClick={(e) => { e.preventDefault(); toggle(cafe.id) }}
          className="absolute top-3 left-3 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 hover:bg-white transition-colors shadow-sm"
          aria-label={fav ? 'Remove from favorites' : 'Add to favorites'}
        >
          <svg
            className={`w-4 h-4 transition-colors ${fav ? 'fill-red-500 text-red-500' : 'fill-none text-stone-400'}`}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
        {cafe.accepts_bookings && (
          <span className="absolute top-3 right-3 bg-amber-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
            Bookable
          </span>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h2 className="font-semibold text-stone-900 text-base leading-tight group-hover:text-amber-700 transition-colors line-clamp-1">
            {cafe.name}
          </h2>
          <RatingBadge rating={cafe.google_rating} size="sm" />
        </div>
        {cafe.district && (
          <p className="text-xs text-stone-500 mb-2">{cafe.district}</p>
        )}
        <p className="text-sm text-stone-600 line-clamp-1 mb-3">{cafe.address}</p>
        {cafe.tags && cafe.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {cafe.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-xs bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  )
}
