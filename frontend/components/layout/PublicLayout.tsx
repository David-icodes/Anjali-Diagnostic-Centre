'use client'

import { usePathname } from 'next/navigation'
import MainNavigation from './MainNavigation'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdminRoute = pathname?.startsWith('/admin')

  if (isAdminRoute) return <>{children}</>

  return (
    <>
      <MainNavigation />
      {children}
    </>
  )
}
