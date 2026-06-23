"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  FlaskConical,
  CalendarCheck,
  Tag,
  Star,
  MessageSquare,
  Settings,
  Users,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Microscope,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/tests', label: 'Tests', icon: FlaskConical },
  { href: '/admin/bookings', label: 'Bookings', icon: CalendarCheck },
  { href: '/admin/offers', label: 'Offers', icon: Tag },
  { href: '/admin/testimonials', label: 'Testimonials', icon: Star },
  { href: '/admin/enquiries', label: 'Enquiries', icon: MessageSquare },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
  { href: '/admin/users', label: 'Users', icon: Users },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [user, setUser] = useState<{ name: string; email: string; avatar?: string } | null>(null)

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

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="fixed left-0 top-0 h-screen z-40 flex flex-col bg-white border-r border-gray-200 shadow-sm overflow-hidden"
    >
      <div className="flex items-center gap-3 px-4 h-16 border-b border-gray-100 shrink-0">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-600 to-brand-400 flex items-center justify-center shadow-md shrink-0">
          <Microscope className="w-5 h-5 text-white" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className="overflow-hidden whitespace-nowrap"
            >
              <p className="text-sm font-bold text-brand-950 leading-tight">Anjali Diagnostic</p>
              <p className="text-[10px] text-brand-600 font-medium leading-tight">Admin Panel</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ x: 2 }}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors duration-200 relative',
                  isActive
                    ? 'text-brand-700 bg-brand-50'
                    : 'text-gray-500 hover:text-brand-600 hover:bg-brand-50/50'
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId="sidebarActive"
                    className="absolute inset-0 rounded-xl bg-brand-50 border border-brand-100"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <item.icon className="w-5 h-5 shrink-0 relative z-10" />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="relative z-10"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            </Link>
          )
        })}
      </nav>

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="hidden lg:flex items-center justify-center h-8 mx-2 mb-2 rounded-lg text-gray-400 hover:text-brand-600 hover:bg-brand-50 transition-all"
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      <div className="border-t border-gray-100 p-3 shrink-0">
        <div className={cn('flex items-center gap-3', collapsed && 'justify-center')}>
          <Avatar className="w-9 h-9 shrink-0 ring-2 ring-brand-100">
            <AvatarImage src={user?.avatar} />
            <AvatarFallback className="bg-brand-50 text-brand-700 text-xs font-semibold">
              {user?.name?.charAt(0) || 'A'}
            </AvatarFallback>
          </Avatar>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 min-w-0"
              >
                <p className="text-sm font-medium text-gray-900 truncate">{user?.name || 'Admin'}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email || 'admin@anjali.com'}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className={cn(
            'w-full mt-2 text-gray-500 hover:text-red-600 hover:bg-red-50',
            collapsed && 'px-0'
          )}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="ml-2"
              >
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </Button>
      </div>
    </motion.aside>
  )
}
