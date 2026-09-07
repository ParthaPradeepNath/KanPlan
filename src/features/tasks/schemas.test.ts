import { z } from 'zod'
import { describe, it, expect } from 'vitest'

import { createTaskSchema } from './schemas'
import { TaskStatus } from './types'

const validTask = {
  name: 'Implement login',
  status: TaskStatus.TODO,
  workspaceId: 'ws_123',
  projectId: 'proj_123',
  dueDate: new Date('2026-10-01'),
  assigneeId: 'member_123',
}

describe('createTaskSchema', () => {
  it('accepts valid task data', () => {
    expect(createTaskSchema.safeParse(validTask).success).toBe(true)
  })

  it('accepts every TaskStatus value', () => {
    for (const status of Object.values(TaskStatus)) {
      expect(createTaskSchema.safeParse({ ...validTask, status }).success).toBe(
        true
      )
    }
  })

  it('coerces an ISO date string into a Date', () => {
    const result = createTaskSchema.safeParse({
      ...validTask,
      dueDate: '2026-10-01',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.dueDate).toBeInstanceOf(Date)
    }
  })

  it('accepts an optional description', () => {
    expect(
      createTaskSchema.safeParse({ ...validTask, description: 'Details' })
        .success
    ).toBe(true)
    expect(createTaskSchema.safeParse(validTask).success).toBe(true)
  })

  it('rejects a blank name', () => {
    expect(
      createTaskSchema.safeParse({ ...validTask, name: '   ' }).success
    ).toBe(false)
  })

  it('rejects an invalid status', () => {
    expect(
      createTaskSchema.safeParse({ ...validTask, status: 'ARCHIVED' }).success
    ).toBe(false)
  })

  it('rejects blank ids', () => {
    for (const field of ['workspaceId', 'projectId', 'assigneeId'] as const) {
      expect(
        createTaskSchema.safeParse({ ...validTask, [field]: '  ' }).success
      ).toBe(false)
    }
  })

  it('supports partial updates via .partial() (PATCH route)', () => {
    const partial = createTaskSchema.partial()
    expect(partial.safeParse({}).success).toBe(true)
    expect(partial.safeParse({ name: 'Renamed' }).success).toBe(true)
    expect(partial.safeParse({ status: TaskStatus.DONE }).success).toBe(true)
    expect(partial.safeParse({ name: '' }).success).toBe(false)
  })
})

describe('bulk-update payload schema (POST /tasks/bulk-update)', () => {
  // Mirrors the inline zod schema in src/features/tasks/server/route.ts
  const bulkUpdateSchema = z.object({
    tasks: z.array(
      z.object({
        id: z.string(),
        status: z.nativeEnum(TaskStatus),
        position: z.number().int().positive().min(1000).max(1_000_000),
      })
    ),
  })

  it('accepts a valid bulk payload', () => {
    expect(
      bulkUpdateSchema.safeParse({
        tasks: [
          { id: 't1', status: TaskStatus.DONE, position: 1000 },
          { id: 't2', status: TaskStatus.TODO, position: 2000 },
        ],
      }).success
    ).toBe(true)
  })

  it('rejects positions outside 1000..1_000_000', () => {
    expect(
      bulkUpdateSchema.safeParse({
        tasks: [{ id: 't1', status: TaskStatus.DONE, position: 999 }],
      }).success
    ).toBe(false)
    expect(
      bulkUpdateSchema.safeParse({
        tasks: [{ id: 't1', status: TaskStatus.DONE, position: 1_000_001 }],
      }).success
    ).toBe(false)
  })

  it('rejects non-integer positions and invalid statuses', () => {
    expect(
      bulkUpdateSchema.safeParse({
        tasks: [{ id: 't1', status: TaskStatus.DONE, position: 1500.5 }],
      }).success
    ).toBe(false)
    expect(
      bulkUpdateSchema.safeParse({
        tasks: [{ id: 't1', status: 'ARCHIVED', position: 1000 }],
      }).success
    ).toBe(false)
  })
})
