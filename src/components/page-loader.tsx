import { Loader } from 'lucide-react'

export const PageLoader = () => {
  return (
    <div className="flex h-screen items-center justify-center">
      <Loader className="text-muted-foreground size-6 animate-spin" />
    </div>
  )
}
