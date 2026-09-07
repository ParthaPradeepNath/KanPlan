import { describe, it, expect } from 'vitest'

import { loginSchema, registerSchema } from './schemas'

describe('loginSchema', () => {
  it('accepts valid credentials', () => {
    const result = loginSchema.safeParse({
      email: 'user@example.com',
      password: 'anything',
    })
    expect(result.success).toBe(true)
  })

  it('rejects an invalid email', () => {
    const result = loginSchema.safeParse({
      email: 'not-an-email',
      password: 'password123',
    })
    expect(result.success).toBe(false)
  })

  it('rejects an empty password', () => {
    const result = loginSchema.safeParse({
      email: 'user@example.com',
      password: '',
    })
    expect(result.success).toBe(false)
  })

  it('rejects missing fields', () => {
    expect(loginSchema.safeParse({}).success).toBe(false)
    expect(loginSchema.safeParse({ email: 'user@example.com' }).success).toBe(
      false
    )
  })
})

describe('registerSchema', () => {
  const valid = {
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    password: 'password123',
  }

  it('accepts valid registration data', () => {
    expect(registerSchema.safeParse(valid).success).toBe(true)
  })

  it('trims the name before validating', () => {
    const result = registerSchema.safeParse({ ...valid, name: '  Ada  ' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.name).toBe('Ada')
    }
  })

  it('rejects a blank name', () => {
    expect(
      registerSchema.safeParse({ ...valid, name: '   ' }).success
    ).toBe(false)
  })

  it('rejects an invalid email', () => {
    expect(
      registerSchema.safeParse({ ...valid, email: 'nope' }).success
    ).toBe(false)
  })

  it('rejects passwords shorter than 8 characters', () => {
    expect(
      registerSchema.safeParse({ ...valid, password: 'short7' }).success
    ).toBe(false)
  })

  it('accepts a password of exactly 8 characters', () => {
    expect(
      registerSchema.safeParse({ ...valid, password: '12345678' }).success
    ).toBe(true)
  })
})
