import { describe, it, expect } from 'vitest'

import { createProjectSchema, updateProjectSchema } from './schemas'

describe('createProjectSchema', () => {
  const valid = { name: 'Website relaunch', workspaceId: 'ws_123' }

  it('accepts valid data without an image', () => {
    expect(createProjectSchema.safeParse(valid).success).toBe(true)
  })

  it('accepts a File image', () => {
    const file = new File(['bytes'], 'cover.png', { type: 'image/png' })
    expect(
      createProjectSchema.safeParse({ ...valid, image: file }).success
    ).toBe(true)
  })

  it('accepts a URL string image', () => {
    expect(
      createProjectSchema.safeParse({
        ...valid,
        image: 'https://example.com/cover.png',
      }).success
    ).toBe(true)
  })

  it('treats an empty image string as undefined', () => {
    const result = createProjectSchema.safeParse({ ...valid, image: '' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.image).toBeUndefined()
    }
  })

  it('trims the name before validating', () => {
    const result = createProjectSchema.safeParse({
      ...valid,
      name: '  Apollo  ',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.name).toBe('Apollo')
    }
  })

  it('rejects a blank name', () => {
    expect(createProjectSchema.safeParse({ ...valid, name: '' }).success).toBe(
      false
    )
    expect(
      createProjectSchema.safeParse({ ...valid, name: '   ' }).success
    ).toBe(false)
  })

  it('rejects a missing workspaceId', () => {
    const { workspaceId: _ignored, ...withoutWorkspace } = valid
    void _ignored
    expect(createProjectSchema.safeParse(withoutWorkspace).success).toBe(false)
  })
})

describe('updateProjectSchema', () => {
  it('accepts an empty object (all fields optional)', () => {
    expect(updateProjectSchema.safeParse({}).success).toBe(true)
  })

  it('accepts a name-only update', () => {
    expect(updateProjectSchema.safeParse({ name: 'Renamed' }).success).toBe(
      true
    )
  })

  it('rejects a blank name when provided', () => {
    expect(updateProjectSchema.safeParse({ name: '' }).success).toBe(false)
  })

  it('accepts a File image update', () => {
    const file = new File(['bytes'], 'cover.png', { type: 'image/png' })
    expect(updateProjectSchema.safeParse({ image: file }).success).toBe(true)
  })

  it('treats an empty image string as undefined', () => {
    const result = updateProjectSchema.safeParse({ image: '' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.image).toBeUndefined()
    }
  })
})
