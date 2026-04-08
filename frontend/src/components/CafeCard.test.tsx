import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { CafeCard } from './CafeCard'
import type { CafeListItem } from '../types/cafe'

const baseCafe: CafeListItem = {
  id: '1',
  name: 'Test Cafe',
  slug: 'test-cafe',
  address: 'Main Street 1',
  district: 'Staré Mesto',
  latitude: 48.14,
  longitude: 17.1,
  google_rating: 4.5,
  google_review_count: 200,
  tags: ['specialty coffee', 'wifi'],
  photos: null,
  accepts_bookings: false,
}

function renderCard(cafe: CafeListItem = baseCafe) {
  return render(
    <MemoryRouter>
      <CafeCard cafe={cafe} />
    </MemoryRouter>
  )
}

describe('CafeCard', () => {
  it('renders cafe name', () => {
    renderCard()
    expect(screen.getByText('Test Cafe')).toBeInTheDocument()
  })

  it('renders address', () => {
    renderCard()
    expect(screen.getByText('Main Street 1')).toBeInTheDocument()
  })

  it('renders district', () => {
    renderCard()
    expect(screen.getByText('Staré Mesto')).toBeInTheDocument()
  })

  it('renders tags (up to 3)', () => {
    renderCard()
    expect(screen.getByText('specialty coffee')).toBeInTheDocument()
    expect(screen.getByText('wifi')).toBeInTheDocument()
  })

  it('shows Bookable badge when accepts_bookings is true', () => {
    renderCard({ ...baseCafe, accepts_bookings: true })
    expect(screen.getByText('Bookable')).toBeInTheDocument()
  })

  it('hides Bookable badge when accepts_bookings is false', () => {
    renderCard()
    expect(screen.queryByText('Bookable')).not.toBeInTheDocument()
  })

  it('uses placeholder image when photos is null', () => {
    renderCard()
    const img = screen.getByRole('img')
    expect(img.getAttribute('src')).toContain('unsplash')
  })

  it('uses first photo when available', () => {
    renderCard({ ...baseCafe, photos: ['https://example.com/photo.jpg'] })
    const img = screen.getByRole('img')
    expect(img.getAttribute('src')).toBe('https://example.com/photo.jpg')
  })

  it('links to cafe detail page', () => {
    renderCard()
    const link = screen.getByRole('link')
    expect(link.getAttribute('href')).toBe('/cafe/test-cafe')
  })
})
