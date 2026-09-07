import { describe, it, expect } from 'vitest'

import { Task, TaskStatus } from '../types'
import {
  BOARDS,
  buildTasksState,
  calculateKanbanUpdates,
  positionForIndex,
} from './kanban-utils'

const makeTask = (overrides: Partial<Task> & { id: string }): Task => ({
  name: overrides.id,
  status: TaskStatus.BACKLOG,
  workspaceId: 'ws_1',
  assigneeId: 'm_1',
  projectId: 'p_1',
  position: 1000,
  createdAt: new Date('2026-01-01').toISOString(),
  updatedAt: new Date('2026-01-01').toISOString(),
  ...overrides,
})

describe('BOARDS', () => {
  it('lists columns in workflow order', () => {
    expect(BOARDS).toEqual([
      TaskStatus.BACKLOG,
      TaskStatus.TODO,
      TaskStatus.IN_PROGRESS,
      TaskStatus.IN_REVIEW,
      TaskStatus.DONE,
    ])
  })
})

describe('positionForIndex', () => {
  it.each([
    [0, 1000],
    [1, 2000],
    [4, 5000],
  ])('maps index %i to position %i', (index, expected) => {
    expect(positionForIndex(index)).toBe(expected)
  })

  it('caps positions at 1_000_000', () => {
    expect(positionForIndex(999)).toBe(1_000_000)
    expect(positionForIndex(5000)).toBe(1_000_000)
  })
})

describe('buildTasksState', () => {
  it('groups tasks by status', () => {
    const tasks = [
      makeTask({ id: 'a', status: TaskStatus.TODO }),
      makeTask({ id: 'b', status: TaskStatus.DONE }),
      makeTask({ id: 'c', status: TaskStatus.TODO }),
    ]

    const state = buildTasksState(tasks)

    expect(state[TaskStatus.TODO].map((t) => t.id)).toEqual(['a', 'c'])
    expect(state[TaskStatus.DONE].map((t) => t.id)).toEqual(['b'])
    expect(state[TaskStatus.BACKLOG]).toEqual([])
  })

  it('sorts each column by position', () => {
    const tasks = [
      makeTask({ id: 'a', status: TaskStatus.TODO, position: 3000 }),
      makeTask({ id: 'b', status: TaskStatus.TODO, position: 1000 }),
      makeTask({ id: 'c', status: TaskStatus.TODO, position: 2000 }),
    ]

    const state = buildTasksState(tasks)

    expect(state[TaskStatus.TODO].map((t) => t.id)).toEqual(['b', 'c', 'a'])
  })

  it('returns empty columns for an empty task list', () => {
    const state = buildTasksState([])
    for (const board of BOARDS) {
      expect(state[board]).toEqual([])
    }
  })
})

describe('calculateKanbanUpdates', () => {
  const seed = () => ({
    [TaskStatus.BACKLOG]: [
      makeTask({ id: 'b1', status: TaskStatus.BACKLOG, position: 1000 }),
    ],
    [TaskStatus.TODO]: [
      makeTask({ id: 't1', status: TaskStatus.TODO, position: 1000 }),
      makeTask({ id: 't2', status: TaskStatus.TODO, position: 2000 }),
    ],
    [TaskStatus.IN_PROGRESS]: [],
    [TaskStatus.IN_REVIEW]: [],
    [TaskStatus.DONE]: [],
  })

  it('moves a task across columns and renumbers both sides', () => {
    const { nextState, updatesPayload } = calculateKanbanUpdates(
      seed(),
      { droppableId: TaskStatus.TODO, index: 0 },
      { droppableId: TaskStatus.DONE, index: 0 }
    )

    expect(nextState[TaskStatus.TODO].map((t) => t.id)).toEqual(['t2'])
    expect(nextState[TaskStatus.DONE].map((t) => t.id)).toEqual(['t1'])
    expect(nextState[TaskStatus.DONE][0]?.status).toBe(TaskStatus.DONE)

    const byId = Object.fromEntries(updatesPayload.map((u) => [u.id, u]))
    expect(byId['t1']).toMatchObject({
      status: TaskStatus.DONE,
      position: 1000,
    })
    // t2 shifted to the top of its column
    expect(byId['t2']).toMatchObject({
      status: TaskStatus.TODO,
      position: 1000,
    })
  })

  it('reorders within the same column', () => {
    const { nextState, updatesPayload } = calculateKanbanUpdates(
      seed(),
      { droppableId: TaskStatus.TODO, index: 0 },
      { droppableId: TaskStatus.TODO, index: 1 }
    )

    expect(nextState[TaskStatus.TODO].map((t) => t.id)).toEqual(['t2', 't1'])

    const byId = Object.fromEntries(updatesPayload.map((u) => [u.id, u]))
    expect(byId['t1']).toMatchObject({
      status: TaskStatus.TODO,
      position: 2000,
    })
    expect(byId['t2']).toMatchObject({
      status: TaskStatus.TODO,
      position: 1000,
    })
  })

  it('returns an empty payload when the drop is outside any column', () => {
    const prev = seed()
    const { nextState, updatesPayload } = calculateKanbanUpdates(
      prev,
      { droppableId: TaskStatus.TODO, index: 0 },
      null
    )

    expect(nextState).toBe(prev)
    expect(updatesPayload).toEqual([])
  })

  it('returns an empty payload for an out-of-range source index', () => {
    const prev = seed()
    const { nextState, updatesPayload } = calculateKanbanUpdates(
      prev,
      { droppableId: TaskStatus.TODO, index: 99 },
      { droppableId: TaskStatus.DONE, index: 0 }
    )

    expect(nextState).toBe(prev)
    expect(updatesPayload).toEqual([])
  })

  it('returns an empty payload for unknown columns', () => {
    const prev = seed()
    const { updatesPayload } = calculateKanbanUpdates(
      prev,
      { droppableId: 'NOPE', index: 0 },
      { droppableId: TaskStatus.DONE, index: 0 }
    )

    expect(updatesPayload).toEqual([])
  })

  it('does not mutate the previous state', () => {
    const prev = seed()
    const snapshot = structuredClone(prev)

    calculateKanbanUpdates(
      prev,
      { droppableId: TaskStatus.TODO, index: 0 },
      { droppableId: TaskStatus.DONE, index: 0 }
    )

    expect(prev).toEqual(snapshot)
  })

  it('caps payload positions at 1_000_000 for deep columns', () => {
    const prev = seed()
    const { updatesPayload } = calculateKanbanUpdates(
      prev,
      { droppableId: TaskStatus.BACKLOG, index: 0 },
      { droppableId: TaskStatus.DONE, index: 5000 }
    )

    expect(updatesPayload.find((u) => u.id === 'b1')?.position).toBe(1_000_000)
  })
})
