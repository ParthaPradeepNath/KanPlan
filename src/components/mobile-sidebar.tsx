'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { MenuIcon } from 'lucide-react'

import { Button } from './ui/button'
import { Sheet, SheetTrigger, SheetContent } from './ui/sheet'
import { Sidebar } from './sidebar'

export const MobileSidebar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  // Adjust state during render to close the sidebar whenever the route changes
  const [prevPathname, setPrevPathname] = useState(pathname)
  if (prevPathname !== pathname) {
    setPrevPathname(pathname)
    setIsOpen(false)
  }

  return (
    <Sheet modal={false} open={isOpen} onOpenChange={setIsOpen}>
      {/* to remove the hydration error putting a button inside a button so pass asChild inside the trigger to prevent it */}
      <SheetTrigger asChild>
        <Button variant="secondary" className="lg:hidden">
          <MenuIcon className="size-4 text-neutral-500" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0">
        <Sidebar />
      </SheetContent>
    </Sheet>
  )
}
