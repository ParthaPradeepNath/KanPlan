import 'server-only'

import { prisma } from '@/lib/prisma'

import { MemberRole } from './types'

interface GetMemberProps {
  workspaceId: string
  userId: string
}

export const getMember = async ({
  workspaceId,
  userId,
}: GetMemberProps) => {
  const member = await prisma.member.findFirst({
    where: {
      workspaceId,
      userId,
    },
  })

  if (!member) {
    return null
  }

  return {
    ...member,
    role: member.role as MemberRole,
  }
}
