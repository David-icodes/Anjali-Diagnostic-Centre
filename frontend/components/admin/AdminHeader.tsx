"use client"

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Menu, Plus, ChevronDown, LogOut } from 'lucide-react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import toast from 'react-hot-toast'

const pageTitles: Record<string, string> = {
  '/admin/dashboard': 'Dashboard',
  '/admin/users': 'User Management',
  '/admin/bookings': 'Booking Management',
  '/admin/health-packages': 'Health Packages',
  '/admin/tests': 'Lab Tests',
  '/admin/radiology': 'Radiology Services',
  '/admin/reports': 'Report Management',
  '/admin/offers': 'Offers',
  '/admin/hero-slides': 'Hero Slider Management',
  '/admin/activity-logs': 'Activity Logs',
  '/admin/settings': 'System Settings',
}

interface AdminHeaderProps {
  onMenuToggle: () => void
}

export default function AdminHeader({ onMenuToggle }: AdminHeaderProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<{ name: string; email: string; role?: string; avatar?: string } | null>(null)
  const [clock, setClock] = useState('')

  useEffect(() => {
    try {
      const stored = localStorage.getItem('user')
      if (stored) setUser(JSON.parse(stored))
    } catch {}
    const update = () => {
      const now = new Date()
      setClock(now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }))
    }
    update()
    const id = setInterval(update, 30000)
    return () => clearInterval(id)
  }, [])

  const title = Object.entries(pageTitles).find(([k]) => pathname === k || pathname.startsWith(k + '/'))?.[1] || 'Admin'

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    toast.success('Logged out')
    router.push('/admin/login')
  }

  return (
    <header className="sticky top-0 z-30 border-b border-white/70 bg-white/75 shadow-[0_12px_30px_rgba(15,118,110,0.08)] backdrop-blur-xl">
      <div className="flex h-14 items-center justify-between px-4 lg:h-[60px] lg:px-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onMenuToggle} className="lg:hidden text-gray-500 hover:text-brand-600 -ml-2">
            <Menu className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-base font-semibold text-gray-900 leading-tight">{title}</h1>
            <p className="text-[11px] text-gray-400 leading-tight hidden sm:block">{clock ? `${clock} IST` : ''}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="default" size="sm" className="h-9 gap-1.5 rounded-full bg-gradient-to-r from-brand-600 to-emerald-500 px-4 text-xs shadow-sm" onClick={() => router.push('/admin/bookings')}>
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Booking</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 h-8 px-2 rounded-lg hover:bg-gray-50">
                <Avatar className="w-7 h-7 ring-2 ring-brand-100">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback className="bg-brand-50 text-brand-700 text-[10px] font-semibold">
                    {user?.name?.charAt(0) || 'A'}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block text-left leading-tight">
                  <p className="text-xs font-medium text-gray-700">{user?.name || 'Admin'}</p>
                  <p className="text-[9px] text-gray-400">{user?.role || 'Administrator'}</p>
                </div>
                <ChevronDown className="w-3 h-3 text-gray-400 hidden md:block" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{user?.name || 'Admin'}</span>
                  <span className="text-xs text-gray-500 font-normal">{user?.email || 'admin@anjali.com'}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/admin/settings')}>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                <LogOut className="w-3.5 h-3.5 mr-2" /> Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
