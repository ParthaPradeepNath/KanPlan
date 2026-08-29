'use client'

import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'

import { Button } from '@/components/ui/button'

const ErrorPage = () => {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-y-4">
      <AlertTriangle className="text-muted-foreground size-6" />
      <p className="text-muted-foreground text-sm">Something went wrong</p>
      <Button variant="secondary" size="sm">
        <Link href="/">Back to home</Link>
      </Button>
    </div>
  )
}

export default ErrorPage
