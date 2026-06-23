'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminHeader from '@/components/admin/AdminHeader'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  const isLoginPage = pathname === '/admin/login'

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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <AdminHeader onMenuClick={() => setIsSidebarOpen(true)} />
      <main className="lg:pl-64 pt-16">
        <div className="p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
