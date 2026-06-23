'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminHeader from '@/components/admin/AdminHeader'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  const isLoginPage = pathname === '/admin/login'

  useEffect(() => {
    const saved = localStorage.getItem('adminSidebarCollapsed')
    if (saved === 'true') setSidebarCollapsed(true)
  }, [])

  const handleCollapse = useCallback((val: boolean) => {
    setSidebarCollapsed(val)
    localStorage.setItem('adminSidebarCollapsed', String(val))
  }, [])

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token && !isLoginPage) {
      router.replace('/admin/login')
    } else {
      setIsChecking(false)
    }
  }, [isLoginPage, router])

  if (isLoginPage) return <>{children}</>

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-950 via-brand-900 to-slate-900">
        <Loader2 className="w-8 h-8 animate-spin text-brand-400" />
      </div>
    )
  }

  const sidebarWidth = sidebarCollapsed ? 72 : 256

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        collapsed={sidebarCollapsed}
        onCollapse={handleCollapse}
      />
      <AdminHeader onMenuToggle={() => setIsSidebarOpen(true)} />
      <main
        className="pt-14 transition-all duration-250"
        style={{ paddingLeft: `${sidebarWidth}px` }}
      >
        <div className="p-4 sm:p-5">
          {children}
        </div>
      </main>
    </div>
  )
}
