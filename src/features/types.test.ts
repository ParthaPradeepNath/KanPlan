import { describe, it, expect } from 'vitest'

import { TaskStatus } from '@/features/tasks/types'
import { MemberRole } from '@/features/members/types'

describe('TaskStatus', () => {
  it('contains all five kanban columns', () => {
    expect(Object.values(TaskStatus)).toEqual([
      'BACKLOG',
      'TODO',
      'IN_PROGRESS',
      'IN_REVIEW',
      'DONE',
    ])
  })

  it('round-trips through JSON', () => {
    const parsed = JSON.parse(JSON.stringify({ status: TaskStatus.IN_PROGRESS }))
    expect(parsed.status).toBe('IN_PROGRESS')
  })
})

describe('MemberRole', () => {
  it('contains admin and member roles', () => {
    expect(Object.values(MemberRole)).toEqual(['ADMIN', 'MEMBER'])
  })
})
