import { addDays, format } from 'date-fns'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'

import { TaskDate } from './task-date'

describe('TaskDate', () => {
  it('renders nothing when no value is provided', () => {
    const { container } = render(<TaskDate value={undefined} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders nothing for a null value', () => {
    const { container } = render(<TaskDate value={null} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('formats the date in PPP format', () => {
    const value = addDays(new Date(), 60).toISOString()
    render(<TaskDate value={value} />)

    expect(screen.getByText(format(value, 'PPP'))).toBeInTheDocument()
  })

  it('marks overdue/near-due dates red (<= 3 days)', () => {
    const value = addDays(new Date(), 1).toISOString()
    const { container } = render(<TaskDate value={value} />)

    expect(container.firstElementChild?.className).toContain('text-red-500')
  })

  it('marks dates within a week orange (4-7 days)', () => {
    const value = addDays(new Date(), 5).toISOString()
    const { container } = render(<TaskDate value={value} />)

    expect(container.firstElementChild?.className).toContain('text-orange-500')
  })

  it('marks dates within two weeks yellow (8-14 days)', () => {
    const value = addDays(new Date(), 10).toISOString()
    const { container } = render(<TaskDate value={value} />)

    expect(container.firstElementChild?.className).toContain('text-yellow-500')
  })

  it('uses the muted color for distant dates (> 14 days)', () => {
    const value = addDays(new Date(), 60).toISOString()
    const { container } = render(<TaskDate value={value} />)

    expect(container.firstElementChild?.className).toContain(
      'text-muted-foreground'
    )
  })
})
