import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchCafes, fetchCafe, fetchMapPins } from './cafes'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

function mockResponse(data: unknown, ok = true) {
  mockFetch.mockResolvedValueOnce({
    ok,
    status: ok ? 200 : 500,
    json: () => Promise.resolve(data),
  })
}

beforeEach(() => {
  mockFetch.mockReset()
})

describe('fetchCafes', () => {
  it('calls /cafes with no params when no filters', async () => {
    mockResponse({ total: 0, results: [] })
    await fetchCafes()
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/cafes'))
    expect(mockFetch).toHaveBeenCalledWith(expect.not.stringContaining('?'))
  })

  it('appends district filter to query string', async () => {
    mockResponse({ total: 0, results: [] })
    await fetchCafes({ district: 'Staré Mesto' })
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('district=Star%C3%A9+Mesto'))
  })

  it('appends min_rating filter', async () => {
    mockResponse({ total: 0, results: [] })
    await fetchCafes({ min_rating: 4.5 })
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('min_rating=4.5'))
  })

  it('appends limit and offset', async () => {
    mockResponse({ total: 0, results: [] })
    await fetchCafes({ limit: 9, offset: 18 })
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('limit=9'))
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('offset=18'))
  })

  it('returns total and results', async () => {
    mockResponse({ total: 1, results: [{ id: '1', name: 'Cafe' }] })
    const result = await fetchCafes()
    expect(result.total).toBe(1)
    expect(result.results).toHaveLength(1)
  })

  it('throws on non-ok response', async () => {
    mockResponse({}, false)
    await expect(fetchCafes()).rejects.toThrow('API error 500')
  })
})

describe('fetchCafe', () => {
  it('calls /cafes/:id', async () => {
    mockResponse({ id: 'abc', name: 'My Cafe' })
    await fetchCafe('abc')
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/cafes/abc'))
  })
})

describe('fetchMapPins', () => {
  it('calls /cafes/map', async () => {
    mockResponse([])
    await fetchMapPins()
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/cafes/map'))
  })
})
