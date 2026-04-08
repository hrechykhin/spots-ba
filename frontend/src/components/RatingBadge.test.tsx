import { render, screen } from '@testing-library/react'
import { RatingBadge } from './RatingBadge'

describe('RatingBadge', () => {
  it('renders nothing when rating is null', () => {
    const { container } = render(<RatingBadge rating={null} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('displays rating formatted to 1 decimal', () => {
    render(<RatingBadge rating={4.7} />)
    expect(screen.getByText('4.7')).toBeInTheDocument()
  })

  it('rounds rating to 1 decimal place', () => {
    render(<RatingBadge rating={4.666} />)
    expect(screen.getByText('4.7')).toBeInTheDocument()
  })

  it('shows review count when provided', () => {
    render(<RatingBadge rating={4.5} reviewCount={123} />)
    expect(screen.getByText('(123)')).toBeInTheDocument()
  })

  it('hides review count when not provided', () => {
    render(<RatingBadge rating={4.5} />)
    expect(screen.queryByText(/\(/)).not.toBeInTheDocument()
  })
})
