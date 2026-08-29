import 'server-only'

import z from 'zod'
import { Hono } from 'hono'

import { endOfMonth, startOfMonth, subMonths } from 'date-fns'

import { zValidator } from '@hono/zod-validator'

import { sessionMiddleware } from '@/lib/session-middleware'
import { prisma } from '@/lib/prisma'
import { uploadImage } from '@/lib/uploadthing'
import { getMember } from '@/features/members/utils'
import { TaskStatus } from '@/features/tasks/types'

import { createProjectSchema, updateProjectSchema } from '../schemas'
import { Project } from '../types'

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

const app = new Hono()
  .post(
    '/',
    zValidator('form', createProjectSchema),
    sessionMiddleware,
    async (c) => {
      const user = c.get('user')

      const { name, image, workspaceId } = c.req.valid('form')

      const member = await getMember({
        workspaceId,
        userId: user.id,
      })

      if (!member) {
        return c.json({ error: 'Unauthorized' }, 401)
      }

      let uploadedImageUrl: string | undefined

      if (image instanceof File) {
        uploadedImageUrl = await uploadImage(image)
      }

      const project = await prisma.project.create({
        data: {
          name,
          imageUrl: uploadedImageUrl,
          workspaceId,
        },
      })

      return c.json({ data: serializeProject(project) })
    }
  )
  .get(
    '/',
    sessionMiddleware,
    zValidator('query', z.object({ workspaceId: z.string() })),
    async (c) => {
      const user = c.get('user')

      const { workspaceId } = c.req.valid('query')

      if (!workspaceId) {
        return c.json({ error: 'Missing workspaceId' }, 400)
      }

      const member = await getMember({
        workspaceId,
        userId: user.id,
      })

      if (!member) {
        return c.json({ error: 'Unauthorized' }, 401)
      }

      const projects = await prisma.project.findMany({
        where: { workspaceId },
        orderBy: { createdAt: 'desc' },
      })

      const documents = projects.map(serializeProject)

      return c.json({ data: { documents, total: documents.length } })
    }
  )
  .get('/:projectId', sessionMiddleware, async (c) => {
    const user = c.get('user')

    const { projectId } = c.req.param()

    const project = await prisma.project.findUnique({
      where: { id: projectId },
    })

    if (!project) {
      return c.json({ error: 'Project not found' }, 404)
    }

    const member = await getMember({
      workspaceId: project.workspaceId,
      userId: user.id,
    })

    if (!member) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    return c.json({ data: serializeProject(project) })
  })
  .patch(
    '/:projectId',
    sessionMiddleware,
    zValidator('form', updateProjectSchema),
    async (c) => {
      const user = c.get('user')

      const { projectId } = c.req.param()
      const { name, image } = c.req.valid('form')

      const existingProject = await prisma.project.findUnique({
        where: { id: projectId },
      })

      if (!existingProject) {
        return c.json({ error: 'Project not found' }, 404)
      }

      const member = await getMember({
        workspaceId: existingProject.workspaceId,
        userId: user.id,
      })

      if (!member) {
        return c.json({ error: 'Unauthorized' }, 401)
      }

      let uploadedImageUrl: string | undefined

      if (image instanceof File) {
        uploadedImageUrl = await uploadImage(image)
      } else {
        uploadedImageUrl = image
      }

      const project = await prisma.project.update({
        where: { id: projectId },
        data: {
          name,
          imageUrl: uploadedImageUrl,
        },
      })

      return c.json({ data: serializeProject(project) })
    }
  )
  .delete('/:projectId', sessionMiddleware, async (c) => {
    const user = c.get('user')

    const { projectId } = c.req.param()

    const existingProject = await prisma.project.findUnique({
      where: { id: projectId },
    })

    if (!existingProject) {
      return c.json({ error: 'Project not found' }, 404)
    }

    const member = await getMember({
      workspaceId: existingProject.workspaceId,
      userId: user.id,
    })

    if (!member) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    await prisma.project.delete({
      where: { id: projectId },
    })

    return c.json({ data: { id: existingProject.id } })
  })
  .get('/:projectId/analytics', sessionMiddleware, async (c) => {
    const user = c.get('user')
    const { projectId } = c.req.param()

    const project = await prisma.project.findUnique({
      where: { id: projectId },
    })

    if (!project) {
      return c.json({ error: 'Project not found' }, 404)
    }

    const member = await getMember({
      workspaceId: project.workspaceId,
      userId: user.id,
    })

    if (!member) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const now = new Date()
    const thisMonthStart = startOfMonth(now)
    const thisMonthEnd = endOfMonth(now)
    const lastMonthStart = startOfMonth(subMonths(now, 1))
    const lastMonthEnd = endOfMonth(subMonths(now, 1))

    const countTasks = (start: Date, end: Date, extra?: object) =>
      prisma.task.count({
        where: {
          projectId,
          ...(extra ?? {}),
          createdAt: { gte: start, lte: end },
        },
      })

    const thisMonthTasks = await countTasks(thisMonthStart, thisMonthEnd)
    const lastMonthTasks = await countTasks(lastMonthStart, lastMonthEnd)

    const taskCount = thisMonthTasks
    const taskDifference = thisMonthTasks - lastMonthTasks

    const thisMonthAssignedTasks = await countTasks(thisMonthStart, thisMonthEnd, {
      assigneeId: member.id,
    })
    const lastMonthAssignedTasks = await countTasks(
      lastMonthStart,
      lastMonthEnd,
      { assigneeId: member.id }
    )

    const assignedTaskCount = thisMonthAssignedTasks
    const assignedTaskDifference = thisMonthAssignedTasks - lastMonthAssignedTasks

    const thisMonthIncompleteTasks = await countTasks(thisMonthStart, thisMonthEnd, {
      NOT: { status: TaskStatus.DONE },
    })
    const lastMonthIncompleteTasks = await countTasks(
      lastMonthStart,
      lastMonthEnd,
      { NOT: { status: TaskStatus.DONE } }
    )

    const incompleteTaskCount = thisMonthIncompleteTasks
    const incompleteTaskDifference =
      thisMonthIncompleteTasks - lastMonthIncompleteTasks

    const thisMonthCompletedTasks = await countTasks(thisMonthStart, thisMonthEnd, {
      status: TaskStatus.DONE,
    })
    const lastMonthCompletedTasks = await countTasks(
      lastMonthStart,
      lastMonthEnd,
      { status: TaskStatus.DONE }
    )

    const completedTaskCount = thisMonthCompletedTasks
    const completedTaskDifference = thisMonthCompletedTasks - lastMonthCompletedTasks

    const thisMonthOverdueTasks = await prisma.task.count({
      where: {
        projectId,
        status: { not: TaskStatus.DONE },
        dueDate: { lt: now },
        createdAt: { gte: thisMonthStart, lte: thisMonthEnd },
      },
    })
    const lastMonthOverdueTasks = await prisma.task.count({
      where: {
        projectId,
        status: { not: TaskStatus.DONE },
        dueDate: { lt: now },
        createdAt: { gte: lastMonthStart, lte: lastMonthEnd },
      },
    })

    const overdueTaskCount = thisMonthOverdueTasks
    const overdueTaskDifference = thisMonthOverdueTasks - lastMonthOverdueTasks

    return c.json({
      data: {
        taskCount,
        taskDifference,
        assignedTaskCount,
        assignedTaskDifference,
        completedTaskCount,
        completedTaskDifference,
        incompleteTaskCount,
        incompleteTaskDifference,
        overdueTaskCount,
        overdueTaskDifference,
      },
    })
  })

export default app
