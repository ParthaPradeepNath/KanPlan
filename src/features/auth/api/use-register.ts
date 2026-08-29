import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { authClient } from '@/lib/auth-client'

export const useRegister = () => {
  const router = useRouter()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async ({
      json,
    }: {
      json: { name: string; email: string; password: string }
    }) => {
      const { error } = await authClient.signUp.email({
        name: json.name,
        email: json.email,
        password: json.password,
      })

      if (error) {
        throw new Error(error.message ?? error.code ?? 'Failed to register')
      }

      return { success: true }
    },
    onSuccess: () => {
      toast.success('Registered')
      router.refresh()
      queryClient.invalidateQueries({
        queryKey: ['current'],
      })
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  return mutation
}
