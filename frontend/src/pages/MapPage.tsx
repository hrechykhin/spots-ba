import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CafeMap } from '../components/CafeMap'
import { RatingBadge } from '../components/RatingBadge'
import { useMapPins } from '../hooks/useCafes'

export function MapPage() {
  const { data: cafes, isLoading, isError } = useMapPins()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const [locating, setLocating] = useState(false)

  function locateMe() {
    if (!navigator.geolocation) return
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation([pos.coords.latitude, pos.coords.longitude])
        setLocating(false)
      },
      () => setLocating(false)
    )
  }

  return (
    <div className="flex flex-col h-screen bg-stone-50">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 px-4 py-3 flex items-center gap-3 shrink-0 z-10">
        <Link
          to="/"
          className="flex items-center gap-1 text-sm text-stone-600 hover:text-stone-900"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </Link>
        <h1 className="text-base font-semibold text-stone-900">
          ☕ Cafes in Bratislava
        </h1>
        {cafes && (
          <span className="text-sm text-stone-500 ml-auto">{cafes.length} cafes</span>
        )}
        <button
          onClick={locateMe}
          disabled={locating}
          className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2a10 10 0 100 20A10 10 0 0012 2zm0 0v4m0 12v4M2 12h4m12 0h4" />
          </svg>
          {locating ? 'Locating…' : 'Locate me'}
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="hidden sm:flex flex-col w-72 shrink-0 border-r border-stone-200 bg-white overflow-y-auto">
          {isLoading && (
            <div className="p-4 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="animate-pulse space-y-1">
                  <div className="h-4 bg-stone-200 rounded w-3/4" />
                  <div className="h-3 bg-stone-100 rounded w-1/2" />
                </div>
              ))}
            </div>
          )}
          {isError && (
            <p className="p-4 text-sm text-stone-500">Could not load cafes.</p>
          )}
          {cafes?.map((cafe) => (
            <button
              key={cafe.id}
              onClick={() => setSelectedId(cafe.id === selectedId ? null : cafe.id)}
              className={`text-left px-4 py-3 border-b border-stone-100 hover:bg-amber-50 transition-colors ${
                selectedId === cafe.id ? 'bg-amber-50 border-l-2 border-l-amber-500' : ''
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-sm text-stone-900 truncate">{cafe.name}</span>
                <RatingBadge rating={cafe.google_rating} size="sm" />
              </div>
              <Link
                to={`/cafe/${cafe.id}`}
                onClick={(e) => e.stopPropagation()}
                className="text-xs text-amber-700 hover:underline mt-0.5 inline-block"
              >
                View details →
              </Link>
            </button>
          ))}
        </aside>

        {/* Map */}
        <div className="flex-1 relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-stone-100 z-20">
              <p className="text-stone-500">Loading map...</p>
            </div>
          )}
          {cafes && (
            <CafeMap
              cafes={cafes}
              zoom={13}
              height="100%"
              userLocation={userLocation}
            />
          )}
        </div>
      </div>
    </div>
  )
}
