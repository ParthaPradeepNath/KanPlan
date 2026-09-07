import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'

import { DottedSeparator } from './dotted-separator'

describe('DottedSeparator', () => {
  it('renders a horizontal separator by default', () => {
    const { container } = render(<DottedSeparator />)
    const outer = container.firstElementChild

    expect(outer?.className).toContain('flex')
    expect(outer?.className).toContain('w-full')
  })

  it('renders a vertical separator when requested', () => {
    const { container } = render(<DottedSeparator direction="vertical" />)
    const outer = container.firstElementChild

    expect(outer?.className).toContain('flex-col')
    expect(outer?.className).toContain('h-full')
  })

  it('merges a custom className', () => {
    const { container } = render(<DottedSeparator className="my-custom" />)

    expect(container.firstElementChild?.className).toContain('my-custom')
  })

  it('applies the custom color to the dotted background', () => {
    const { container } = render(<DottedSeparator color="#ff0000" />)
    const inner = container.firstElementChild?.firstElementChild as HTMLElement

    // jsdom normalizes hex colors to rgb()
    expect(inner?.style.backgroundImage).toContain('255, 0, 0')
  })
})
