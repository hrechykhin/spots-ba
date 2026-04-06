import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CafeCard } from '../components/CafeCard'
import { useCafes } from '../hooks/useCafes'

const DISTRICTS = ['Staré Mesto', 'Nové Mesto', 'Ružinov', 'Petržalka', 'Dúbravka']

const ALL_TAGS = [
  'specialty coffee',
  'wifi',
  'outdoor seating',
  'dog friendly',
  'brunch',
  'vegan',
  'roastery',
]

export function ListingPage() {
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [district, setDistrict] = useState('')
  const [minRating, setMinRating] = useState<number | undefined>()

  const filters = {
    tags: selectedTags.length > 0 ? selectedTags.join(',') : undefined,
    district: district || undefined,
    min_rating: minRating,
  }

  const { data: cafes, isLoading, isError } = useCafes(filters)

  function toggleTag(tag: string) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-stone-900 tracking-tight">
              ☕ Places BA
            </h1>
            <p className="text-xs text-stone-500">Cafes in Bratislava</p>
          </div>
          <Link
            to="/map"
            className="flex items-center gap-1.5 text-sm font-medium text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 px-3 py-2 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            Map view
          </Link>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Filters */}
        <div className="mb-6 space-y-3">
          {/* Tag chips */}
          <div className="flex flex-wrap gap-2">
            {ALL_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`text-sm px-3 py-1.5 rounded-full border transition-colors font-medium ${
                  selectedTags.includes(tag)
                    ? 'bg-amber-600 text-white border-amber-600'
                    : 'bg-white text-stone-600 border-stone-200 hover:border-amber-400 hover:text-amber-700'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* District + rating */}
          <div className="flex flex-wrap gap-2">
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="text-sm border border-stone-200 rounded-lg px-3 py-1.5 bg-white text-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              <option value="">All districts</option>
              {DISTRICTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>

            <select
              value={minRating ?? ''}
              onChange={(e) => setMinRating(e.target.value ? Number(e.target.value) : undefined)}
              className="text-sm border border-stone-200 rounded-lg px-3 py-1.5 bg-white text-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              <option value="">Any rating</option>
              <option value="4.5">★ 4.5+</option>
              <option value="4.0">★ 4.0+</option>
              <option value="3.5">★ 3.5+</option>
            </select>

            {(selectedTags.length > 0 || district || minRating) && (
              <button
                onClick={() => { setSelectedTags([]); setDistrict(''); setMinRating(undefined) }}
                className="text-sm text-stone-500 hover:text-stone-700 px-3 py-1.5 underline"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>

        {/* Results */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden border border-stone-200 animate-pulse">
                <div className="h-48 bg-stone-200" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-stone-200 rounded w-3/4" />
                  <div className="h-3 bg-stone-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {isError && (
          <div className="text-center py-16 text-stone-500">
            <p className="text-lg">Could not load cafes.</p>
            <p className="text-sm mt-1">Make sure the API is running at <code className="bg-stone-100 px-1 rounded">{import.meta.env.VITE_API_BASE_URL}</code></p>
          </div>
        )}

        {cafes && cafes.length === 0 && (
          <div className="text-center py-16 text-stone-500">
            <p className="text-lg">No cafes match your filters.</p>
            <button
              onClick={() => { setSelectedTags([]); setDistrict(''); setMinRating(undefined) }}
              className="mt-3 text-amber-700 hover:underline font-medium"
            >
              Clear filters
            </button>
          </div>
        )}

        {cafes && cafes.length > 0 && (
          <>
            <p className="text-sm text-stone-500 mb-4">{cafes.length} cafe{cafes.length !== 1 ? 's' : ''} found</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {cafes.map((cafe) => (
                <CafeCard key={cafe.id} cafe={cafe} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
