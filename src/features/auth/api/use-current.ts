import { authClient } from '@/lib/auth-client'

export const useCurrent = () => {
  const query = authClient.useSession()

  return {
    ...query,
    isLoading: query.isPending,
    data: query.data?.user ?? null,
  }
}
