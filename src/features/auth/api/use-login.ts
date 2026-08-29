import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { authClient } from '@/lib/auth-client'

export const useLogin = () => {
  const router = useRouter()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async ({
      json,
    }: {
      json: { email: string; password: string }
    }) => {
      const { error } = await authClient.signIn.email({
        email: json.email,
        password: json.password,
      })

      if (error) {
        throw new Error(error.message ?? 'Failed to login')
      }

      return { success: true }
    },
    onSuccess: () => {
      toast.success('Logged in')
      router.refresh()
      queryClient.invalidateQueries({
        queryKey: ['current'],
      })
    },
    onError: () => {
      toast.error('Failed to log in')
    },
  })

  return mutation
}
