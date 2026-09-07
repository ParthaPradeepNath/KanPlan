import { describe, it, expect } from 'vitest'

import { createWorkspaceSchema, updateWorkspaceSchema } from './schemas'

describe('createWorkspaceSchema', () => {
  it('accepts a name without an image', () => {
    const result = createWorkspaceSchema.safeParse({ name: 'My workspace' })
    expect(result.success).toBe(true)
  })

  it('accepts a File image', () => {
    const file = new File(['bytes'], 'logo.png', { type: 'image/png' })
    const result = createWorkspaceSchema.safeParse({
      name: 'My workspace',
      image: file,
    })
    expect(result.success).toBe(true)
  })

  it('accepts a URL string image', () => {
    const result = createWorkspaceSchema.safeParse({
      name: 'My workspace',
      image: 'https://example.com/logo.png',
    })
    expect(result.success).toBe(true)
  })

  it('treats an empty image string as undefined', () => {
    const result = createWorkspaceSchema.safeParse({
      name: 'My workspace',
      image: '',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.image).toBeUndefined()
    }
  })

  it('trims the name before validating', () => {
    const result = createWorkspaceSchema.safeParse({ name: '  Acme  ' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.name).toBe('Acme')
    }
  })

  it('rejects a blank name', () => {
    expect(createWorkspaceSchema.safeParse({ name: '' }).success).toBe(false)
    expect(createWorkspaceSchema.safeParse({ name: '   ' }).success).toBe(false)
    expect(createWorkspaceSchema.safeParse({}).success).toBe(false)
  })
})

describe('updateWorkspaceSchema', () => {
  it('accepts an empty object (all fields optional)', () => {
    expect(updateWorkspaceSchema.safeParse({}).success).toBe(true)
  })

  it('accepts a name-only update', () => {
    const result = updateWorkspaceSchema.safeParse({ name: 'Renamed' })
    expect(result.success).toBe(true)
  })

  it('rejects a blank name when provided', () => {
    expect(updateWorkspaceSchema.safeParse({ name: '' }).success).toBe(false)
  })

  it('accepts a File image update', () => {
    const file = new File(['bytes'], 'logo.png', { type: 'image/png' })
    expect(updateWorkspaceSchema.safeParse({ image: file }).success).toBe(true)
  })

  it('treats an empty image string as undefined', () => {
    const result = updateWorkspaceSchema.safeParse({ image: '' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.image).toBeUndefined()
    }
  })
})
