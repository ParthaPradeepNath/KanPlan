import { describe, it, expect } from 'vitest'

import { cn, generateInviteCode, snakeCaseToTitleCase } from './utils'

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('px-2', 'py-1')).toBe('px-2 py-1')
  })

  it('merges conflicting Tailwind classes, keeping the last one', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4')
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500')
  })

  it('handles conditional and falsy values', () => {
    expect(cn('base', false && 'hidden', undefined, null, 'active')).toBe(
      'base active'
    )
  })

  it('supports object and array syntax from clsx', () => {
    expect(cn({ active: true, disabled: false }, ['a', 'b'])).toBe('active a b')
  })
})

describe('generateInviteCode', () => {
  it('generates a code of the requested length', () => {
    expect(generateInviteCode(6)).toHaveLength(6)
    expect(generateInviteCode(1)).toHaveLength(1)
    expect(generateInviteCode(32)).toHaveLength(32)
  })

  it('returns an empty string for length 0', () => {
    expect(generateInviteCode(0)).toBe('')
  })

  it('only uses alphanumeric characters', () => {
    expect(generateInviteCode(200)).toMatch(/^[A-Za-z0-9]+$/)
  })

  it('generates unique codes across calls', () => {
    const codes = new Set(Array.from({ length: 50 }, () => generateInviteCode(6)))
    // Collisions with 62^6 space are practically impossible
    expect(codes.size).toBe(50)
  })
})

describe('snakeCaseToTitleCase', () => {
  it.each([
    ['BACKLOG', 'Backlog'],
    ['IN_PROGRESS', 'In Progress'],
    ['IN_REVIEW', 'In Review'],
    ['TODO', 'Todo'],
    ['DONE', 'Done'],
  ])('converts %s to %s', (input, expected) => {
    expect(snakeCaseToTitleCase(input)).toBe(expected)
  })

  it('handles lowercase input', () => {
    expect(snakeCaseToTitleCase('in_progress')).toBe('In Progress')
  })

  it('handles multiple underscores', () => {
    expect(snakeCaseToTitleCase('A_B_C')).toBe('A B C')
  })

  it('handles an empty string', () => {
    expect(snakeCaseToTitleCase('')).toBe('')
  })
})
