import Image from 'next/image'

import { cn } from '@/lib/utils'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'

interface ProjectAvatarProps {
  image?: string | null
  name: string
  className?: string
  fallbackClassName?: string
}

export const ProjectAvatar = ({
  image,
  name,
  className,
  fallbackClassName,
}: ProjectAvatarProps) => {
  if (image) {
    return (
      <div
        className={cn('relative size-5 overflow-hidden rounded-md', className)}
      >
        <Image src={image} alt={name} fill className="object-cover" />
      </div>
    )
  }

  return (
    <Avatar className={cn('size-5 rounded-md', className)}>
      <AvatarFallback
        className={cn(
          'rounded-md bg-blue-600 text-sm font-semibold text-white uppercase',
          fallbackClassName
        )}
      >
        {name[0]}
      </AvatarFallback>
    </Avatar>
  )
}
