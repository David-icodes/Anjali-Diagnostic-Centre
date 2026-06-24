"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, CalendarCheck, Settings, Users, ChevronLeft, ChevronRight, LogOut, Radio, Package, FileText, Activity, Syringe, Images, BadgePercent,
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
      { href: '/admin/offers', label: 'Offers', icon: BadgePercent },
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
        <div className="flex items-center gap-3 px-4 h-14 border-b border-gray-100 shrink-0 bg-gradient-to-r from-brand-600 to-brand-500">
          <div className="relative h-9 w-9 overflow-hidden rounded-xl border border-white/20 bg-white shrink-0">
            <Image src={BRAND.logo} alt={BRAND.fullName} fill className="object-cover p-1" sizes="36px" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="overflow-hidden whitespace-nowrap">
                <p className="text-sm font-bold text-white leading-tight">{BRAND.name}</p>
                <p className="text-[9px] text-white/70 font-medium leading-tight">Administration Panel</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <nav className="flex-1 py-3 px-2 overflow-y-auto overflow-x-hidden scrollbar-thin">
          {navGroups.map((group) => (
            <div key={group.label} className="mb-4 last:mb-0">
              <AnimatePresence>
                {!collapsed && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="px-3 mb-1 text-[10px] font-semibold tracking-widest text-gray-400 uppercase"
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
                          'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150',
                          active
                            ? 'text-brand-700 bg-brand-50 border border-brand-100'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 border border-transparent'
                        )}
                      >
                        <item.icon className={cn('w-4.5 h-4.5 shrink-0', active ? 'text-brand-600' : 'text-gray-400')} />
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

        <div className="border-t border-gray-100 shrink-0">
          <button
            onClick={() => onCollapse?.(!collapsed)}
            className="hidden lg:flex items-center justify-center w-full h-8 text-gray-400 hover:text-brand-600 hover:bg-brand-50 transition-all"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
          <div className={cn('flex items-center gap-3 p-3', collapsed && 'justify-center')}>
            <Avatar className="w-8 h-8 shrink-0 ring-2 ring-brand-100">
              <AvatarImage src={user?.avatar} />
              <AvatarFallback className="bg-brand-50 text-brand-700 text-xs font-semibold">
                {user?.name?.charAt(0) || 'A'}
              </AvatarFallback>
            </Avatar>
            <AnimatePresence>
              {!collapsed && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate leading-tight">{user?.name || 'Admin'}</p>
                  <p className="text-[10px] text-gray-400 truncate">{user?.role || 'Administrator'}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}
            className={cn('w-full rounded-none h-9 text-gray-400 hover:text-red-600 hover:bg-red-50 text-xs', collapsed && 'px-0')}
          >
            <LogOut className="w-3.5 h-3.5 shrink-0" />
            <AnimatePresence>{!collapsed && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="ml-2">Sign Out</motion.span>}</AnimatePresence>
          </Button>
        </div>
      </motion.aside>
    </>
  )
}
