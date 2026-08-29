import 'server-only'

import { z } from 'zod'
import { Hono } from 'hono'

import { zValidator } from '@hono/zod-validator'

import { sessionMiddleware } from '@/lib/session-middleware'
import { prisma } from '@/lib/prisma'
import { getMember } from '@/features/members/utils'
import { Member, MemberRole } from '@/features/members/types'
import { Project } from '@/features/projects/types'

import { createTaskSchema } from '../schemas'
import { Task, TaskStatus } from '../types'

const serializeProject = (project: {
  id: string
  name: string
  imageUrl: string | null
  workspaceId: string
  createdAt: Date
  updatedAt: Date
}): Project => ({
  id: project.id,
  name: project.name,
  imageUrl: project.imageUrl ?? undefined,
  workspaceId: project.workspaceId,
  createdAt: project.createdAt.toISOString(),
  updatedAt: project.updatedAt.toISOString(),
})

const serializeMember = (m: {
  id: string
  workspaceId: string
  userId: string
  role: string
  createdAt: Date
  updatedAt: Date
  name?: string
  email?: string
}): Member => ({
  id: m.id,
  workspaceId: m.workspaceId,
  userId: m.userId,
  role: m.role as MemberRole,
  name: m.name,
  email: m.email,
  createdAt: m.createdAt.toISOString(),
  updatedAt: m.updatedAt.toISOString(),
})

const app = new Hono()
  .delete('/:taskId', sessionMiddleware, async (c) => {
    const user = c.get('user')
    const { taskId } = c.req.param()

    const task = await prisma.task.findUnique({
      where: { id: taskId },
    })

    if (!task) {
      return c.json({ error: 'Task not found' }, 404)
    }

    const member = await getMember({
      workspaceId: task.workspaceId,
      userId: user.id,
    })

    if (!member) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    await prisma.task.delete({
      where: { id: taskId },
    })

    return c.json({ data: { id: task.id } })
  })
  .get(
    '/',
    sessionMiddleware,
    zValidator(
      'query',
      z.object({
        workspaceId: z.string(),
        projectId: z.string().nullish(),
        assigneeId: z.string().nullish(),
        status: z.nativeEnum(TaskStatus).nullish(),
        search: z.string().nullish(),
        dueDate: z.string().nullish(),
      })
    ),
    async (c) => {
      const user = c.get('user')

      const { workspaceId, projectId, status, assigneeId, search, dueDate } =
        c.req.valid('query')

      const member = await getMember({
        workspaceId,
        userId: user.id,
      })

      if (!member) {
        return c.json({ error: 'Unauthorized' }, 401)
      }

      const where: Record<string, unknown> = {
        workspaceId,
      }

      if (projectId) {
        where.projectId = projectId
      }

      if (status) {
        where.status = status
      }

      if (assigneeId) {
        where.assigneeId = assigneeId
      }

      if (dueDate) {
        where.dueDate = new Date(dueDate)
      }

      if (search) {
        where.name = { contains: search, mode: 'insensitive' }
      }

      const tasks = await prisma.task.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      })

      const projectIds = tasks.map((task) => task.projectId)
      const assigneeIds = tasks.map((task) => task.assigneeId)

      const projects = await prisma.project.findMany({
        where: { id: { in: projectIds } },
      })

      const memberRecords = await prisma.member.findMany({
        where: { id: { in: assigneeIds } },
        include: { user: true },
      })

      const assignees = memberRecords.map((m) =>
        serializeMember({
          ...m,
          name: m.user.name || m.user.email,
          email: m.user.email,
        })
      )

      const populatedTasks: Task[] = tasks.map((task) => {
        const project = projects.find(
          (p) => p.id === task.projectId
        )
        const assignee = assignees.find(
          (a) => a.id === task.assigneeId
        )

        return {
          id: task.id,
          name: task.name,
          status: task.status as TaskStatus,
          workspaceId: task.workspaceId,
          assigneeId: task.assigneeId,
          projectId: task.projectId,
          position: task.position,
          dueDate: task.dueDate ? task.dueDate.toISOString() : undefined,
          description: task.description ?? undefined,
          project: project ? serializeProject(project) : undefined,
          assignee,
          createdAt: task.createdAt.toISOString(),
          updatedAt: task.updatedAt.toISOString(),
        }
      })

      return c.json({
        data: {
          documents: populatedTasks,
          total: populatedTasks.length,
        },
      })
    }
  )
  .post(
    '/',
    sessionMiddleware,
    zValidator('json', createTaskSchema),
    async (c) => {
      const user = c.get('user')
      const { name, status, workspaceId, projectId, dueDate, assigneeId } =
        c.req.valid('json')

      const member = await getMember({
        workspaceId,
        userId: user.id,
      })

      if (!member) {
        return c.json({ error: 'Unauthorized' }, 401)
      }

      const highestPositionTask = await prisma.task.findFirst({
        where: {
          status,
          workspaceId,
        },
        orderBy: { position: 'desc' },
      })

      const newPosition =
        highestPositionTask && highestPositionTask.position
          ? highestPositionTask.position + 1000
          : 1000

      const task = await prisma.task.create({
        data: {
          name,
          status,
          workspaceId,
          projectId,
          dueDate: dueDate ? new Date(dueDate) : null,
          assigneeId,
          position: newPosition,
        },
      })

      return c.json({
        data: {
          id: task.id,
          name: task.name,
          status: task.status as TaskStatus,
          workspaceId: task.workspaceId,
          assigneeId: task.assigneeId,
          projectId: task.projectId,
          position: task.position,
          dueDate: task.dueDate ? task.dueDate.toISOString() : undefined,
          description: task.description ?? undefined,
          createdAt: task.createdAt.toISOString(),
          updatedAt: task.updatedAt.toISOString(),
        },
      })
    }
  )
  .patch(
    '/:taskId',
    sessionMiddleware,
    zValidator('json', createTaskSchema.partial()),
    async (c) => {
      const user = c.get('user')
      const { name, status, description, projectId, dueDate, assigneeId } =
        c.req.valid('json')
      const { taskId } = c.req.param()

      const existingTask = await prisma.task.findUnique({
        where: { id: taskId },
      })

      if (!existingTask) {
        return c.json({ error: 'Task not found' }, 404)
      }

      const member = await getMember({
        workspaceId: existingTask.workspaceId,
        userId: user.id,
      })

      if (!member) {
        return c.json({ error: 'Unauthorized' }, 401)
      }

      const task = await prisma.task.update({
        where: { id: taskId },
        data: {
          name,
          status,
          projectId,
          dueDate: dueDate ? new Date(dueDate) : undefined,
          assigneeId,
          description,
        },
      })

      return c.json({
        data: {
          id: task.id,
          name: task.name,
          status: task.status as TaskStatus,
          workspaceId: task.workspaceId,
          assigneeId: task.assigneeId,
          projectId: task.projectId,
          position: task.position,
          dueDate: task.dueDate ? task.dueDate.toISOString() : undefined,
          description: task.description ?? undefined,
          createdAt: task.createdAt.toISOString(),
          updatedAt: task.updatedAt.toISOString(),
        },
      })
    }
  )
  .get('/:taskId', sessionMiddleware, async (c) => {
    const currentUser = c.get('user')
    const { taskId } = c.req.param()

    const task = await prisma.task.findUnique({
      where: { id: taskId },
    })

    if (!task) {
      return c.json({ error: 'Task not found' }, 404)
    }

    const currentMember = await getMember({
      workspaceId: task.workspaceId,
      userId: currentUser.id,
    })

    if (!currentMember) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const project = await prisma.project.findUnique({
      where: { id: task.projectId },
    })

    const member = await prisma.member.findUnique({
      where: { id: task.assigneeId },
      include: { user: true },
    })

    const assignee = member
      ? serializeMember({
          ...member,
          name: member.user.name || member.user.email,
          email: member.user.email,
        })
      : undefined

    return c.json({
      data: {
        id: task.id,
        name: task.name,
        status: task.status as TaskStatus,
        workspaceId: task.workspaceId,
        assigneeId: task.assigneeId,
        projectId: task.projectId,
        position: task.position,
        dueDate: task.dueDate ? task.dueDate.toISOString() : undefined,
        description: task.description ?? undefined,
        project: project ? serializeProject(project) : undefined,
        assignee,
        createdAt: task.createdAt.toISOString(),
        updatedAt: task.updatedAt.toISOString(),
      },
    })
  })
  .post(
    '/bulk-update',
    sessionMiddleware,
    zValidator(
      'json',
      z.object({
        tasks: z.array(
          z.object({
            id: z.string(),
            status: z.nativeEnum(TaskStatus),
            position: z.number().int().positive().min(1000).max(1_000_000),
          })
        ),
      })
    ),
    async (c) => {
      const user = c.get('user')
      const { tasks } = c.req.valid('json')

      const tasksToUpdate = await prisma.task.findMany({
        where: {
          id: { in: tasks.map((task) => task.id) },
        },
      })

      const workspaceIds = new Set(
        tasksToUpdate.map((task) => task.workspaceId)
      )

      if (workspaceIds.size !== 1) {
        return c.json({ error: 'All tasks must belong to the same workspace' })
      }

      const workspaceId = workspaceIds.values().next().value as string

      if (!workspaceId) {
        return c.json({ error: 'Workspace ID is required' }, 400)
      }

      const member = await getMember({
        workspaceId,
        userId: user.id,
      })

      if (!member) {
        return c.json({ error: 'Unauthorized' }, 401)
      }

      const updatePromises = tasks.map(async (task) => {
        const { id, status, position } = task
        return prisma.task.update({
          where: { id },
          data: { status, position },
          select: {
            id: true,
            name: true,
            status: true,
            workspaceId: true,
            assigneeId: true,
            projectId: true,
            position: true,
            dueDate: true,
            description: true,
            createdAt: true,
            updatedAt: true,
          },
        })
      })

      const updatedTasks = await Promise.all(updatePromises)

      return c.json({
        data: updatedTasks.map((task) => ({
          id: task.id,
          name: task.name,
          status: task.status as TaskStatus,
          workspaceId: task.workspaceId,
          assigneeId: task.assigneeId,
          projectId: task.projectId,
          position: task.position,
          dueDate: task.dueDate ? task.dueDate.toISOString() : undefined,
          description: task.description ?? undefined,
          createdAt: task.createdAt.toISOString(),
          updatedAt: task.updatedAt.toISOString(),
        })),
      })
    }
  )

export default app
