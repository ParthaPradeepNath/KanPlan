import 'server-only'

import { prisma } from '@/lib/prisma'
import { getCurrent } from '@/features/auth/queries'

import { Project } from './types'

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

interface GetProjectProps {
  projectId: string
}

export const getProject = async ({ projectId }: GetProjectProps) => {
  const user = await getCurrent()

  if (!user) {
    throw new Error('Unauthorized')
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
  })

  if (!project) {
    throw new Error('Project not found')
  }

  const member = await prisma.member.findFirst({
    where: {
      workspaceId: project.workspaceId,
      userId: user.id,
    },
  })

  if (!member) {
    throw new Error('Unauthorized')
  }

  return serializeProject(project)
}
