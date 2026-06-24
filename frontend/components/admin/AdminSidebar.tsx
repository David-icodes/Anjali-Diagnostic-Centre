"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, CalendarCheck, Settings, Users, ChevronLeft, ChevronRight, LogOut, Radio, Package, FileText, Activity, Syringe, Images,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'
import { BRAND } from '@/lib/site'

interface NavGroup {
  label: string
  items: { href: string; label: string; icon: any }[]
}

const navGroups: NavGroup[] = [
  {
    label: 'MAIN',
    items: [
      { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    label: 'MANAGEMENT',
    items: [
      { href: '/admin/users', label: 'Users', icon: Users },
      { href: '/admin/bookings', label: 'Bookings', icon: CalendarCheck },
    ],
  },
  {
    label: 'SERVICES',
    items: [
      { href: '/admin/health-packages', label: 'Health Packages', icon: Package },
      { href: '/admin/tests', label: 'Lab Tests', icon: Syringe },
      { href: '/admin/radiology', label: 'Radiology', icon: Radio },
    ],
  },
  {
    label: 'REPORTS',
    items: [
      { href: '/admin/reports', label: 'Reports', icon: FileText },
      { href: '/admin/activity-logs', label: 'Activity Logs', icon: Activity },
      { href: '/admin/hero-slides', label: 'Hero Slider', icon: Images },
    ],
  },
  {
    label: 'SYSTEM',
    items: [
      { href: '/admin/settings', label: 'Settings', icon: Settings },
    ],
  },
]

export default function AdminSidebar({ isOpen, onClose, collapsed, onCollapse }: { isOpen?: boolean; onClose?: () => void; collapsed?: boolean; onCollapse?: (val: boolean) => void }) {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<{ name: string; email: string; role?: string; avatar?: string } | null>(null)

  useEffect(() => {
    try {
      const stored = localStorage.getItem('user')
      if (stored) setUser(JSON.parse(stored))
    } catch {}
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    toast.success('Logged out successfully')
    router.push('/admin/login')
  }

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  return (
    <>
      {isOpen && <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={onClose} />}
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 72 : 256 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className={cn(
          'fixed left-0 top-0 z-40 flex h-screen flex-col overflow-hidden border-r border-gray-200 bg-white transition-transform duration-300',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex h-14 shrink-0 items-center gap-3 border-b border-gray-100 bg-gradient-to-r from-brand-600 to-brand-500 px-4">
          <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-xl border border-white/20 bg-white">
            <Image src={BRAND.logo} alt={BRAND.fullName} fill className="object-cover p-1" sizes="36px" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="overflow-hidden whitespace-nowrap">
                <p className="text-sm font-bold leading-tight text-white">{BRAND.name}</p>
                <p className="text-[9px] font-medium leading-tight text-white/70">Administration Panel</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <nav className="scrollbar-thin flex-1 overflow-x-hidden overflow-y-auto px-2 py-3">
          {navGroups.map((group) => (
            <div key={group.label} className="mb-4 last:mb-0">
              <AnimatePresence>
                {!collapsed && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-gray-400"
                  >
                    {group.label}
                  </motion.p>
                )}
              </AnimatePresence>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const active = isActive(item.href)
                  return (
                    <Link key={item.href} href={item.href}>
                      <div
                        className={cn(
                          'flex items-center gap-3 rounded-lg border px-3 py-2 text-sm font-medium transition-all duration-150',
                          active
                            ? 'border-brand-100 bg-brand-50 text-brand-700'
                            : 'border-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                        )}
                      >
                        <item.icon className={cn('h-4.5 w-4.5 shrink-0', active ? 'text-brand-600' : 'text-gray-400')} />
                        <AnimatePresence>
                          {!collapsed && (
                            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                              {item.label}
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="shrink-0 border-t border-gray-100">
          <button
            onClick={() => onCollapse?.(!collapsed)}
            className="hidden h-8 w-full items-center justify-center text-gray-400 transition-all hover:bg-brand-50 hover:text-brand-600 lg:flex"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
          <div className={cn('flex items-center gap-3 p-3', collapsed && 'justify-center')}>
            <Avatar className="h-8 w-8 shrink-0 ring-2 ring-brand-100">
              <AvatarImage src={user?.avatar} />
              <AvatarFallback className="bg-brand-50 text-xs font-semibold text-brand-700">
                {user?.name?.charAt(0) || 'A'}
              </AvatarFallback>
            </Avatar>
            <AnimatePresence>
              {!collapsed && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium leading-tight text-gray-900">{user?.name || 'Admin'}</p>
                  <p className="truncate text-[10px] text-gray-400">{user?.role || 'Administrator'}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}
            className={cn('h-9 w-full rounded-none text-xs text-gray-400 hover:bg-red-50 hover:text-red-600', collapsed && 'px-0')}
          >
            <LogOut className="h-3.5 w-3.5 shrink-0" />
            <AnimatePresence>{!collapsed && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="ml-2">Sign Out</motion.span>}</AnimatePresence>
          </Button>
        </div>
      </motion.aside>
    </>
  )
}
