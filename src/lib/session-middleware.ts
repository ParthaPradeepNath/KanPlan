import 'server-only'

import { createMiddleware } from 'hono/factory'

import { auth } from '@/lib/auth'

type AdditionalContext = {
  Variables: {
    user: {
      id: string
      name: string
      email: string
      emailVerified: boolean
      image: string | null
      createdAt: Date
      updatedAt: Date
    }
  }
}

export const sessionMiddleware = createMiddleware<AdditionalContext>(
  async (c, next) => {
    const session = await auth.api.getSession({
      headers: c.req.raw.headers,
    })

    if (!session) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    c.set('user', {
      ...session.user,
      image: session.user.image ?? null,
    })

    await next()
  }
)
