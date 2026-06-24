"use client"

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Menu, Plus, ChevronDown, LogOut, UserRound, Settings2 } from 'lucide-react'
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
    <header className="sticky top-0 z-50 border-b border-white/70 bg-white/80 shadow-[0_12px_30px_rgba(15,118,110,0.08)] backdrop-blur-xl">
      <div className="flex h-14 items-center justify-between px-4 lg:h-[60px] lg:px-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onMenuToggle} className="-ml-2 text-gray-500 hover:text-brand-600 lg:hidden">
            <Menu className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-base font-semibold leading-tight text-gray-900">{title}</h1>
            <p className="hidden text-[11px] leading-tight text-gray-500 sm:block">{clock ? `${clock} IST` : ''}</p>
          </div>
        </div>

        <div className="relative z-[70] flex items-center gap-2">
          <Button
            variant="default"
            size="sm"
            className="h-9 gap-1.5 rounded-full bg-gradient-to-r from-brand-600 to-emerald-500 px-4 text-xs shadow-sm"
            onClick={() => router.push('/admin/bookings')}
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">New Booking</span>
          </Button>

          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-10 gap-2 rounded-xl px-2 hover:bg-gray-50">
                <Avatar className="h-8 w-8 ring-2 ring-brand-100">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback className="bg-brand-50 text-[10px] font-semibold text-brand-700">
                    {user?.name?.charAt(0) || 'A'}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden text-left leading-tight md:block">
                  <p className="text-xs font-medium text-gray-700">{user?.name || 'Admin'}</p>
                  <p className="text-[10px] text-gray-500">{user?.role || 'Administrator'}</p>
                </div>
                <ChevronDown className="hidden h-3 w-3 text-gray-500 md:block" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              sideOffset={10}
              className="z-[120] w-60 rounded-2xl border border-gray-200 bg-white/95 p-2 shadow-[0_22px_50px_rgba(15,23,42,0.16)] backdrop-blur-xl"
            >
              <DropdownMenuLabel className="rounded-xl px-3 py-3">
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-gray-900">{user?.name || 'Admin'}</span>
                  <span className="text-xs font-normal text-gray-500">{user?.email || 'admin@anjali.com'}</span>
                  <span className="mt-1 text-[11px] font-medium uppercase tracking-[0.16em] text-brand-600">{user?.role || 'Administrator'}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/admin/users')} className="rounded-xl px-3 py-2.5">
                <UserRound className="mr-2 h-4 w-4 text-brand-600" /> Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/admin/settings')} className="rounded-xl px-3 py-2.5">
                <Settings2 className="mr-2 h-4 w-4 text-brand-600" /> Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="rounded-xl px-3 py-2.5 text-red-600 focus:text-red-600">
                <LogOut className="mr-2 h-4 w-4" /> Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
