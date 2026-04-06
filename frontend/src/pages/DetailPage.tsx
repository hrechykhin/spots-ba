import { Link, useParams } from 'react-router-dom'
import { useCafe } from '../hooks/useCafes'
import { RatingBadge } from '../components/RatingBadge'
import { OpeningHours } from '../components/OpeningHours'
import { PhotoGallery } from '../components/PhotoGallery'
import { CafeMap } from '../components/CafeMap'

export function DetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: cafe, isLoading, isError } = useCafe(id ?? '')

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-50">
        <div className="max-w-3xl mx-auto px-4 py-8 animate-pulse space-y-4">
          <div className="h-8 bg-stone-200 rounded w-1/3" />
          <div className="h-64 bg-stone-200 rounded-2xl" />
          <div className="h-6 bg-stone-200 rounded w-2/3" />
        </div>
      </div>
    )
  }

  if (isError || !cafe) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center text-stone-500">
          <p className="text-xl mb-2">Cafe not found</p>
          <Link to="/" className="text-amber-700 hover:underline">← Back to list</Link>
        </div>
      </div>
    )
  }

  const mapPin = {
    id: cafe.id,
    name: cafe.name,
    latitude: cafe.latitude,
    longitude: cafe.longitude,
    google_rating: cafe.google_rating,
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Back nav */}
      <div className="bg-white border-b border-stone-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link
            to="/"
            className="flex items-center gap-1 text-sm text-stone-600 hover:text-stone-900"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            All cafes
          </Link>
          <span className="text-stone-300">/</span>
          <span className="text-sm text-stone-500 truncate">{cafe.name}</span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-8">
        {/* Hero */}
        <div>
          <div className="flex items-start justify-between gap-4 mb-3">
            <div>
              <h1 className="text-2xl font-bold text-stone-900">{cafe.name}</h1>
              {cafe.district && (
                <p className="text-sm text-stone-500 mt-0.5">{cafe.district}</p>
              )}
            </div>
            <RatingBadge rating={cafe.google_rating} reviewCount={cafe.google_review_count} />
          </div>

          {/* Tags */}
          {cafe.tags && cafe.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {cafe.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-full font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <PhotoGallery photos={cafe.photos} cafeName={cafe.name} />
        </div>

        {/* Description */}
        {cafe.description && (
          <section>
            <p className="text-stone-700 leading-relaxed">{cafe.description}</p>
          </section>
        )}

        {/* Info grid */}
        <section className="grid sm:grid-cols-2 gap-6">
          {/* Contact & location */}
          <div className="space-y-3">
            <h2 className="text-base font-semibold text-stone-900">Location & Contact</h2>
            <div className="space-y-2 text-sm text-stone-700">
              <div className="flex items-start gap-2">
                <svg className="w-4 h-4 mt-0.5 text-stone-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{cafe.address}</span>
              </div>
              {cafe.phone && (
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-stone-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <a href={`tel:${cafe.phone}`} className="hover:text-amber-700">{cafe.phone}</a>
                </div>
              )}
              {cafe.website && (
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-stone-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" />
                  </svg>
                  <a href={cafe.website} target="_blank" rel="noopener noreferrer" className="hover:text-amber-700 truncate">
                    {cafe.website.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}
              {cafe.instagram && (
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-stone-400 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                  <a href={`https://instagram.com/${cafe.instagram}`} target="_blank" rel="noopener noreferrer" className="hover:text-amber-700">
                    @{cafe.instagram}
                  </a>
                </div>
              )}
              {cafe.google_maps_url && (
                <a
                  href={cafe.google_maps_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 mt-1 text-amber-700 hover:text-amber-800 font-medium"
                >
                  Open in Google Maps →
                </a>
              )}
            </div>
          </div>

          {/* Opening hours */}
          {cafe.opening_hours && (
            <div>
              <h2 className="text-base font-semibold text-stone-900 mb-3">Opening Hours</h2>
              <OpeningHours hours={cafe.opening_hours} />
            </div>
          )}
        </section>

        {/* Mini map */}
        <section>
          <h2 className="text-base font-semibold text-stone-900 mb-3">Location</h2>
          <div className="rounded-2xl overflow-hidden border border-stone-200 h-56">
            <CafeMap cafes={[mapPin]} singleMarker height="224px" />
          </div>
        </section>

        {/* Book a table — coming soon */}
        <section className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center">
          <h2 className="text-base font-semibold text-stone-900 mb-1">Book a Table</h2>
          <p className="text-sm text-stone-600 mb-4">
            Online reservations are coming soon. For now, call or visit to book.
          </p>
          <button
            disabled
            title="Coming soon"
            className="bg-amber-600 text-white font-semibold px-6 py-2.5 rounded-xl opacity-40 cursor-not-allowed"
          >
            Book a Table (Coming Soon)
          </button>
          {cafe.phone && (
            <p className="mt-3 text-sm text-stone-500">
              Or call us:{' '}
              <a href={`tel:${cafe.phone}`} className="text-amber-700 font-medium hover:underline">
                {cafe.phone}
              </a>
            </p>
          )}
        </section>
      </div>
    </div>
  )
}
