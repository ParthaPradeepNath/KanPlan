import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'

import { AnalyticsCard } from './analytics-card'

describe('AnalyticsCard', () => {
  it('renders the title, value and increase value', () => {
    render(
      <AnalyticsCard
        title="Total tasks"
        value={42}
        variant="up"
        increaseValue={5}
      />
    )

    expect(screen.getByText('Total tasks')).toBeInTheDocument()
    expect(screen.getByText('42')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('uses emerald styling for the up variant', () => {
    const { container } = render(
      <AnalyticsCard
        title="Completed tasks"
        value={7}
        variant="up"
        increaseValue={2}
      />
    )

    expect(container.querySelector('.text-emerald-500')).not.toBeNull()
    expect(container.querySelector('.text-red-500')).toBeNull()
  })

  it('uses red styling for the down variant', () => {
    const { container } = render(
      <AnalyticsCard
        title="Overdue tasks"
        value={3}
        variant="down"
        increaseValue={-1}
      />
    )

    expect(container.querySelector('.text-red-500')).not.toBeNull()
    expect(container.querySelector('.text-emerald-500')).toBeNull()
  })

  it('renders zero values without crashing', () => {
    render(
      <AnalyticsCard
        title="Total tasks"
        value={0}
        variant="down"
        increaseValue={0}
      />
    )

    // Both the card value and the increase value render as "0"
    expect(screen.getAllByText('0')).toHaveLength(2)
  })
})
