import { useState, useCallback } from 'react'

import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from '@hello-pangea/dnd'

import { Task, TaskStatus } from '../types'
import {
  BOARDS as boards,
  buildTasksState,
  calculateKanbanUpdates,
  type TasksState,
} from './kanban-utils'
import { KanbanColumnHeader } from './kanban-column-header'
import { KanbanCard } from './kanban-card'

interface DataKanbanProps {
  data: Task[]
  onChange: (
    tasks: { id: string; status: TaskStatus; position: number }[]
  ) => void
}

export const DataKanban = ({ data, onChange }: DataKanbanProps) => {
  const [tasks, setTasks] = useState<TasksState>(() => buildTasksState(data))

  const [prevData, setPrevData] = useState(data)

  // Adjust state during render when the incoming `data` changes
  if (prevData !== data) {
    setPrevData(data)
    setTasks(buildTasksState(data))
  }

  const onDragEnd = useCallback(
    (result: DropResult) => {
      if (!result.destination) return

      const { source, destination } = result

      let updatesPayload: {
        id: string
        status: TaskStatus
        position: number
      }[] = []

      setTasks((prevTasks) => {
        const { nextState, updatesPayload: payload } = calculateKanbanUpdates(
          prevTasks,
          source,
          destination
        )

        if (payload.length === 0 && nextState === prevTasks) {
          console.error('No task found at the source index')
          return prevTasks
        }

        updatesPayload = payload
        return nextState
      })

      onChange(updatesPayload)
    },
    [onChange]
  )

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex overflow-x-auto">
        {boards.map((board) => {
          return (
            <div
              key={board}
              className="bg-muted mx-3 min-w-[200px] flex-1 rounded-md p-1.5"
            >
              <KanbanColumnHeader
                board={board}
                taskCount={tasks[board].length}
              />
              <Droppable droppableId={board}>
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="min-h-[200px] py-1.5"
                  >
                    {tasks[board].map((task, index) => (
                      <Draggable
                        key={task.id}
                        draggableId={task.id}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <KanbanCard task={task} />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          )
        })}
      </div>
    </DragDropContext>
  )
}
