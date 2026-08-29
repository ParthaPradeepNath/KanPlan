import { Models } from 'node-appwrite'

import { Project } from '@/features/projects/types'
import { Member } from '@/features/members/types'

export enum TaskStatus {
  BACKLOG = 'BACKLOG',
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  IN_REVIEW = 'IN_REVIEW',
  DONE = 'DONE',
}

export type Task = Models.Document & {
  name: string
  status: TaskStatus
  workspaceId: string
  assigneeId: string
  projectId: string
  position: number
  dueDate: string
  description?: string
  project?: Project
  assignee?: Member
}
