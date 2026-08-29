export enum MemberRole {
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
}

export type Member = {
  id: string
  workspaceId: string
  userId: string
  role: MemberRole
  name?: string
  email?: string
  createdAt: string
  updatedAt: string
}
