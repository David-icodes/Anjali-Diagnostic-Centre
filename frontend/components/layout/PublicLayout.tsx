'use client'

import { usePathname } from 'next/navigation'
import TopHeader from './TopHeader'
import MainNavigation from './MainNavigation'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdminRoute = pathname?.startsWith('/admin')

  if (isAdminRoute) return <>{children}</>

  return (
    <>
      <TopHeader />
      <MainNavigation />
      {children}
    </>
  )
}
