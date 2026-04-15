import { useState, useEffect } from 'react'
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

const PAGE_SIZE = 9

function getTodayKey(): string {
  const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  const day = new Date().getDay()
  return DAYS[day === 0 ? 6 : day - 1]
}

function toMinutes(h: string, m: string, period: string): number {
  let hours = parseInt(h)
  if (period === 'PM' && hours !== 12) hours += 12
  if (period === 'AM' && hours === 12) hours = 0
  return hours * 60 + parseInt(m)
}

function isOpenNow(hours: Record<string, string> | null): boolean {
  if (!hours) return false
  const todayHours = hours[getTodayKey()]
  if (!todayHours || todayHours === 'Closed') return false
  const match = todayHours.match(
    /^(\d{1,2}):(\d{2})\s*(AM|PM)\s*[\u2013-]\s*(\d{1,2}):(\d{2})\s*(AM|PM)$/i
  )
  if (!match) return false
  const now = new Date()
  const nowMin = now.getHours() * 60 + now.getMinutes()
  const openMin = toMinutes(match[1], match[2], match[3].toUpperCase())
  const closeMin = toMinutes(match[4], match[5], match[6].toUpperCase())
  return nowMin >= openMin && nowMin < closeMin
}

export function ListingPage() {
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [district, setDistrict] = useState('')
  const [minRating, setMinRating] = useState<number | undefined>()
  const [ordering, setOrdering] = useState('rating')
  const [openNow, setOpenNow] = useState(false)
  const [page, setPage] = useState(0)
  const [searchInput, setSearchInput] = useState('')
  const [q, setQ] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => {
      setQ(searchInput)
      setPage(0)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  const filters = {
    tags: selectedTags.length > 0 ? selectedTags.join(',') : undefined,
    district: district || undefined,
    min_rating: minRating,
    q: q || undefined,
    ordering,
    limit: openNow ? 200 : PAGE_SIZE,
    offset: openNow ? 0 : page * PAGE_SIZE,
  }

  const { data, isLoading, isError } = useCafes(filters)

  const allCafes = data?.results ?? []
  const cafes = openNow ? allCafes.filter((c) => isOpenNow(c.opening_hours)) : allCafes
  const total = openNow ? cafes.length : (data?.total ?? 0)
  const totalPages = openNow ? 1 : Math.ceil((data?.total ?? 0) / PAGE_SIZE)

  function resetFilters() {
    setSelectedTags([])
    setDistrict('')
    setMinRating(undefined)
    setOrdering('rating')
    setOpenNow(false)
    setSearchInput('')
    setQ('')
    setPage(0)
  }

  function toggleTag(tag: string) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
    setPage(0)
  }

  const hasFilters = selectedTags.length > 0 || district || minRating || q || openNow || ordering !== 'rating'

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <button onClick={() => { resetFilters(); window.scrollTo({ top: 0, behavior: 'smooth' }) }} className="text-left">
              <h1 className="text-xl font-bold text-stone-900 tracking-tight">☕ Spots BA</h1>
              <p className="text-xs text-stone-500">Cafes in Bratislava</p>
            </button>
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
          {/* Search */}
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search cafes…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-stone-200 rounded-lg bg-white text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            {searchInput && (
              <button
                onClick={() => setSearchInput('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Tag chips + Open now */}
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
            <button
              onClick={() => { setOpenNow((v) => !v); setPage(0) }}
              className={`text-sm px-3 py-1.5 rounded-full border transition-colors font-medium flex items-center gap-1.5 ${
                openNow
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white text-stone-600 border-stone-200 hover:border-emerald-400 hover:text-emerald-700'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${openNow ? 'bg-white' : 'bg-emerald-500'}`} />
              Open now
            </button>
          </div>

          {/* District + rating + sort */}
          <div className="flex flex-wrap gap-2">
            <select
              value={district}
              onChange={(e) => { setDistrict(e.target.value); setPage(0) }}
              className="text-sm border border-stone-200 rounded-lg px-3 py-1.5 bg-white text-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              <option value="">All districts</option>
              {DISTRICTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>

            <select
              value={minRating ?? ''}
              onChange={(e) => { setMinRating(e.target.value ? Number(e.target.value) : undefined); setPage(0) }}
              className="text-sm border border-stone-200 rounded-lg px-3 py-1.5 bg-white text-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              <option value="">Any rating</option>
              <option value="4.5">★ 4.5+</option>
              <option value="4.0">★ 4.0+</option>
              <option value="3.5">★ 3.5+</option>
            </select>

            <select
              value={ordering}
              onChange={(e) => { setOrdering(e.target.value); setPage(0) }}
              className="text-sm border border-stone-200 rounded-lg px-3 py-1.5 bg-white text-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              <option value="rating">Top rated</option>
              <option value="reviews">Most reviewed</option>
              <option value="name">Name A–Z</option>
            </select>

            {hasFilters && (
              <button
                onClick={resetFilters}
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

        {cafes && cafes.length === 0 && !isLoading && (
          <div className="text-center py-16 text-stone-500">
            <p className="text-lg">No cafes match your filters.</p>
            <button onClick={resetFilters} className="mt-3 text-amber-700 hover:underline font-medium">
              Clear filters
            </button>
          </div>
        )}

        {cafes && cafes.length > 0 && (
          <>
            <p className="text-sm text-stone-500 mb-4">
              {total} cafe{total !== 1 ? 's' : ''} found
              {!openNow && totalPages > 1 && ` — page ${page + 1} of ${totalPages}`}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {cafes.map((cafe) => (
                <CafeCard key={cafe.id} cafe={cafe} />
              ))}
            </div>

            {/* Pagination — hidden when Open now is active */}
            {!openNow && totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => { setPage((p) => p - 1); document.documentElement.scrollTop = 0; document.body.scrollTop = 0 }}
                  disabled={page === 0}
                  className="px-4 py-2 text-sm font-medium rounded-lg border border-stone-200 bg-white text-stone-700 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  ← Prev
                </button>
                <span className="text-sm text-stone-500">{page + 1} / {totalPages}</span>
                <button
                  onClick={() => { setPage((p) => p + 1); document.documentElement.scrollTop = 0; document.body.scrollTop = 0 }}
                  disabled={page >= totalPages - 1}
                  className="px-4 py-2 text-sm font-medium rounded-lg border border-stone-200 bg-white text-stone-700 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
