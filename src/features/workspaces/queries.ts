import 'server-only'

import { prisma } from '@/lib/prisma'
import { getCurrent } from '@/features/auth/queries'

import { Workspace } from './types'

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

export const getWorkspaces = async () => {
  const user = await getCurrent()

  if (!user) {
    return { documents: [], total: 0 }
  }

  const members = await prisma.member.findMany({
    where: { userId: user.id },
  })

  if (members.length === 0) {
    return { documents: [], total: 0 }
  }

  const workspaceIds = members.map((member) => member.workspaceId)

  const workspaces = await prisma.workspace.findMany({
    where: { id: { in: workspaceIds } },
    orderBy: { createdAt: 'desc' },
  })

  return {
    documents: workspaces.map(serializeWorkspace),
    total: workspaces.length,
  }
}

interface GetWorkspaceProps {
  workspaceId: string
}

export const getWorkspace = async ({ workspaceId }: GetWorkspaceProps) => {
  try {
    const user = await getCurrent()

    if (!user) {
      return null
    }

    const member = await prisma.member.findFirst({
      where: {
        workspaceId,
        userId: user.id,
      },
    })

    if (!member) {
      return null
    }

    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
    })

    return workspace ? serializeWorkspace(workspace) : null
  } catch {
    return null
  }
}

interface GetWorkspaceInfoProps {
  workspaceId: string
}

export const getWorkspaceInfo = async ({
  workspaceId,
}: GetWorkspaceInfoProps) => {
  try {
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: {
        id: true,
        name: true,
        imageUrl: true,
      },
    })

    if (!workspace) {
      return null
    }

    return workspace
  } catch {
    return null
  }
}
