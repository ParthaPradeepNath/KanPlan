import { z } from 'zod'
import { Hono } from 'hono'

import { zValidator } from '@hono/zod-validator'

import { sessionMiddleware } from '@/lib/session-middleware'
import { prisma } from '@/lib/prisma'

import { getMember } from '../utils'
import { Member, MemberRole } from '../types'

const app = new Hono()
  .get(
    '/',
    sessionMiddleware,
    zValidator('query', z.object({ workspaceId: z.string() })),
    async (c) => {
      const user = c.get('user')
      const { workspaceId } = c.req.valid('query')

      const member = await getMember({
        workspaceId,
        userId: user.id,
      })

      if (!member) {
        return c.json({ error: 'Unauthorized' }, 401)
      }

      const members = await prisma.member.findMany({
        where: { workspaceId },
        include: { user: true },
        orderBy: { createdAt: 'desc' },
      })

      const populatedMembers: Member[] = members.map((m) => ({
        id: m.id,
        workspaceId: m.workspaceId,
        userId: m.userId,
        role: m.role as MemberRole,
        name: m.user.name || m.user.email,
        email: m.user.email,
        createdAt: m.createdAt.toISOString(),
        updatedAt: m.updatedAt.toISOString(),
      }))

      return c.json({
        data: {
          documents: populatedMembers,
          total: populatedMembers.length,
        },
      })
    }
  )
  .delete('/:memberId', sessionMiddleware, async (c) => {
    const { memberId } = c.req.param()
    const user = c.get('user')

    const memberToDelete = await prisma.member.findUnique({
      where: { id: memberId },
    })

    if (!memberToDelete) {
      return c.json({ error: 'Member not found' }, 404)
    }

    const allMembersInWorkspace = await prisma.member.count({
      where: { workspaceId: memberToDelete.workspaceId },
    })

    const member = await getMember({
      workspaceId: memberToDelete.workspaceId,
      userId: user.id,
    })

    if (!member) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    if (member.id !== memberToDelete.id && member.role !== MemberRole.ADMIN) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    if (allMembersInWorkspace === 1) {
      return c.json({ error: 'Cannot delete the only member' }, 400)
    }

    await prisma.member.delete({
      where: { id: memberId },
    })

    return c.json({ data: { id: memberToDelete.id } })
  })
  .patch(
    '/:memberId',
    sessionMiddleware,
    zValidator('json', z.object({ role: z.nativeEnum(MemberRole) })),
    async (c) => {
      const { memberId } = c.req.param()
      const { role } = c.req.valid('json')
      const user = c.get('user')

      const memberToUpdate = await prisma.member.findUnique({
        where: { id: memberId },
      })

      if (!memberToUpdate) {
        return c.json({ error: 'Member not found' }, 404)
      }

      const allMembersInWorkspace = await prisma.member.count({
        where: { workspaceId: memberToUpdate.workspaceId },
      })

      const member = await getMember({
        workspaceId: memberToUpdate.workspaceId,
        userId: user.id,
      })

      if (!member) {
        return c.json({ error: 'Unauthorized' }, 401)
      }

      if (member.role !== MemberRole.ADMIN) {
        return c.json({ error: 'Unauthorized' }, 401)
      }

      if (allMembersInWorkspace === 1) {
        return c.json({ error: 'Cannot downgrade the only member' }, 400)
      }

      await prisma.member.update({
        where: { id: memberId },
        data: { role },
      })

      return c.json({ data: { id: memberToUpdate.id } })
    }
  )

export default app
