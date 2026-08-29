import 'server-only'

import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'

import { prisma } from '@/lib/prisma'

export const auth = betterAuth({
  basePath: '/api/auth',
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  emailAndPassword: {
    enabled: true,
  },
  trustedOrigins: [process.env.BETTER_AUTH_URL!],
})
