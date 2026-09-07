import { Task, TaskStatus } from '../types'

export const BOARDS: TaskStatus[] = [
  TaskStatus.BACKLOG,
  TaskStatus.TODO,
  TaskStatus.IN_PROGRESS,
  TaskStatus.IN_REVIEW,
  TaskStatus.DONE,
]

export type TasksState = {
  [key in TaskStatus]: Task[]
}

export type KanbanUpdate = {
  id: string
  status: TaskStatus
  position: number
}

export type DragLocation = {
  droppableId: string
  index: number
}

/** Position scheme used by the board: 1000, 2000, ... capped at 1_000_000. */
export const positionForIndex = (index: number): number =>
  Math.min((index + 1) * 1000, 1_000_000)

/** Group tasks by status column, sorting each column by position. */
export const buildTasksState = (tasks: Task[]): TasksState => {
  const initialState: TasksState = {
    [TaskStatus.BACKLOG]: [],
    [TaskStatus.TODO]: [],
    [TaskStatus.IN_PROGRESS]: [],
    [TaskStatus.IN_REVIEW]: [],
    [TaskStatus.DONE]: [],
  }

  tasks.forEach((task) => {
    initialState[task.status].push(task)
  })

  ;(Object.keys(initialState) as TaskStatus[]).forEach((status) => {
    initialState[status].sort((a, b) => a.position - b.position)
  })

  return initialState
}

interface CalculateKanbanUpdatesResult {
  nextState: TasksState
  updatesPayload: KanbanUpdate[]
  movedTaskId: string | null
}

/**
 * Pure kanban drag-and-drop transition.
 *
 * Returns the next board state plus the minimal update payload
 * to persist (moved task + re-numbered siblings).
 * Returns an empty payload when the drop is invalid.
 */
export const calculateKanbanUpdates = (
  prevTasks: TasksState,
  source: DragLocation,
  destination: DragLocation | null | undefined
): CalculateKanbanUpdatesResult => {
  const empty: CalculateKanbanUpdatesResult = {
    nextState: prevTasks,
    updatesPayload: [],
    movedTaskId: null,
  }

  if (!destination) return empty

  const sourceStatus = source.droppableId as TaskStatus
  const destStatus = destination.droppableId as TaskStatus

  if (!(sourceStatus in prevTasks) || !(destStatus in prevTasks)) {
    return empty
  }

  const newTasks: TasksState = { ...prevTasks }

  const sourceColumn = [...newTasks[sourceStatus]]
  const [movedTask] = sourceColumn.splice(source.index, 1)

  if (!movedTask) {
    return empty
  }

  const updatedMovedTask =
    sourceStatus !== destStatus
      ? { ...movedTask, status: destStatus }
      : movedTask

  newTasks[sourceStatus] = sourceColumn

  const destColumn =
    sourceStatus === destStatus ? [...sourceColumn] : [...newTasks[destStatus]]
  // When moving within the same column, sourceColumn was already spliced
  // above, so rebuild from it; otherwise insert into the destination copy.
  if (sourceStatus === destStatus) {
    destColumn.splice(destination.index, 0, updatedMovedTask)
    newTasks[destStatus] = destColumn
  } else {
    const target = [...newTasks[destStatus]]
    target.splice(destination.index, 0, updatedMovedTask)
    newTasks[destStatus] = target
  }

  const updatesPayload: KanbanUpdate[] = []

  updatesPayload.push({
    id: updatedMovedTask.id,
    status: destStatus,
    position: positionForIndex(destination.index),
  })

  newTasks[destStatus].forEach((task, index) => {
    if (task && task.id !== updatedMovedTask.id) {
      updatesPayload.push({
        id: task.id,
        status: destStatus,
        position: positionForIndex(index),
      })
    }
  })

  if (sourceStatus !== destStatus) {
    newTasks[sourceStatus].forEach((task, index) => {
      if (task) {
        updatesPayload.push({
          id: task.id,
          status: sourceStatus,
          position: positionForIndex(index),
        })
      }
    })
  }

  return { nextState: newTasks, updatesPayload, movedTaskId: movedTask.id }
}
