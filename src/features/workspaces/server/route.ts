import 'server-only'

import { z } from 'zod'
import { Hono } from 'hono'

import { zValidator } from '@hono/zod-validator'
import { startOfMonth, endOfMonth, subMonths } from 'date-fns'

import { sessionMiddleware } from '@/lib/session-middleware'
import { prisma } from '@/lib/prisma'
import { uploadImage } from '@/lib/uploadthing'
import { generateInviteCode } from '@/lib/utils'
import { MemberRole } from '@/features/members/types'
import { TaskStatus } from '@/features/tasks/types'

import { createWorkspaceSchema, updateWorkspaceSchema } from '../schemas'
import { Workspace } from '../types'
import { getMember } from '@/features/members/utils'

const serializeWorkspace = (workspace: {
  id: string
  name: string
  imageUrl: string | null
  inviteCode: string
  userId: string
  createdAt: Date
  updatedAt: Date
}): Workspace => ({
  id: workspace.id,
  name: workspace.name,
  imageUrl: workspace.imageUrl ?? undefined,
  inviteCode: workspace.inviteCode,
  userId: workspace.userId,
  createdAt: workspace.createdAt.toISOString(),
  updatedAt: workspace.updatedAt.toISOString(),
})

const app = new Hono()
  .get('/', sessionMiddleware, async (c) => {
    const user = c.get('user')

    const members = await prisma.member.findMany({
      where: { userId: user.id },
    })

    if (members.length === 0) {
      return c.json({ data: { documents: [], total: 0 } })
    }

    const workspaceIds = members.map((member) => member.workspaceId)

    const workspaces = await prisma.workspace.findMany({
      where: { id: { in: workspaceIds } },
      orderBy: { createdAt: 'desc' },
    })

    const documents = workspaces.map(serializeWorkspace)

    return c.json({ data: { documents, total: documents.length } })
  })
  .get('/:workspaceId', sessionMiddleware, async (c) => {
    const user = c.get('user')

    const { workspaceId } = c.req.param()
    const member = await getMember({
      workspaceId,
      userId: user.id,
    })

    if (!member) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
    })

    if (!workspace) {
      return c.json({ error: 'Workspace not found' }, 404)
    }

    return c.json({ data: serializeWorkspace(workspace) })
  })
  .get('/:workspaceId/info', sessionMiddleware, async (c) => {
    const { workspaceId } = c.req.param()

    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: {
        id: true,
        name: true,
        imageUrl: true,
      },
    })

    if (!workspace) {
      return c.json({ error: 'Workspace not found' }, 404)
    }

    return c.json({
      data: {
        id: workspace.id,
        name: workspace.name,
        imageUrl: workspace.imageUrl,
      },
    })
  })
  .post(
    '/',
    zValidator('form', createWorkspaceSchema),
    sessionMiddleware,
    async (c) => {
      const user = c.get('user')

      const { name, image } = c.req.valid('form')

      let uploadedImageUrl: string | undefined

      if (image instanceof File) {
        uploadedImageUrl = await uploadImage(image)
      }

      const workspace = await prisma.$transaction(async (tx) => {
        const ws = await tx.workspace.create({
          data: {
            name,
            userId: user.id,
            imageUrl: uploadedImageUrl,
            inviteCode: generateInviteCode(6),
          },
        })

        await tx.member.create({
          data: {
            workspaceId: ws.id,
            role: MemberRole.ADMIN,
            userId: user.id,
          },
        })

        return ws
      })

      return c.json({ data: serializeWorkspace(workspace) })
    }
  )
  .patch(
    '/:workspaceId',
    sessionMiddleware,
    zValidator('form', updateWorkspaceSchema),
    async (c) => {
      const user = c.get('user')

      const { workspaceId } = c.req.param()
      const { name, image } = c.req.valid('form')

      const member = await getMember({
        workspaceId,
        userId: user.id,
      })

      if (!member || member.role !== MemberRole.ADMIN) {
        return c.json({ error: 'Unauthorized' }, 401)
      }

      let uploadedImageUrl: string | undefined

      if (image instanceof File) {
        uploadedImageUrl = await uploadImage(image)
      } else {
        uploadedImageUrl = image
      }

      const workspace = await prisma.workspace.update({
        where: { id: workspaceId },
        data: {
          name,
          imageUrl: uploadedImageUrl,
        },
      })

      return c.json({ data: serializeWorkspace(workspace) })
    }
  )
  .delete('/:workspaceId', sessionMiddleware, async (c) => {
    const user = c.get('user')

    const { workspaceId } = c.req.param()

    const member = await getMember({
      workspaceId,
      userId: user.id,
    })

    if (!member || member.role !== MemberRole.ADMIN) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    await prisma.workspace.delete({
      where: { id: workspaceId },
    })

    return c.json({ data: { id: workspaceId } })
  })
  .post('/:workspaceId/reset-invite-code', sessionMiddleware, async (c) => {
    const user = c.get('user')

    const { workspaceId } = c.req.param()

    const member = await getMember({
      workspaceId,
      userId: user.id,
    })

    if (!member || member.role !== MemberRole.ADMIN) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const workspace = await prisma.workspace.update({
      where: { id: workspaceId },
      data: {
        inviteCode: generateInviteCode(6),
      },
    })

    return c.json({ data: serializeWorkspace(workspace) })
  })
  .post(
    '/:workspaceId/join',
    sessionMiddleware,
    zValidator('json', z.object({ code: z.string() })),
    async (c) => {
      const { workspaceId } = c.req.param()
      const { code } = c.req.valid('json')

      const user = c.get('user')

      const member = await getMember({
        workspaceId,
        userId: user.id,
      })

      if (member) {
        return c.json({ error: 'Already a member' }, 400)
      }

      const workspace = await prisma.workspace.findUnique({
        where: { id: workspaceId },
      })

      if (!workspace) {
        return c.json({ error: 'Workspace not found' }, 404)
      }

      if (workspace.inviteCode !== code) {
        return c.json({ error: 'Invalid invite code' }, 400)
      }

      await prisma.member.create({
        data: {
          workspaceId,
          userId: user.id,
          role: MemberRole.MEMBER,
        },
      })

      return c.json({ data: serializeWorkspace(workspace) })
    }
  )
  .get('/:workspaceId/analytics', sessionMiddleware, async (c) => {
    const user = c.get('user')
    const { workspaceId } = c.req.param()

    const member = await getMember({
      workspaceId,
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
          workspaceId,
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
    const assignedTaskDifference =
      thisMonthAssignedTasks - lastMonthAssignedTasks

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
    const completedTaskDifference =
      thisMonthCompletedTasks - lastMonthCompletedTasks

    const thisMonthOverdueTasks = await prisma.task.count({
      where: {
        workspaceId,
        status: { not: TaskStatus.DONE },
        dueDate: { lt: now },
        createdAt: { gte: thisMonthStart, lte: thisMonthEnd },
      },
    })
    const lastMonthOverdueTasks = await prisma.task.count({
      where: {
        workspaceId,
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
