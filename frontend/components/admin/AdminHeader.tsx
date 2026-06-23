"use client"

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Search, Bell, Menu, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'

const breadcrumbMap: Record<string, string> = {
  '/admin': 'Dashboard',
  '/admin/tests': 'Tests',
  '/admin/bookings': 'Bookings',
  '/admin/offers': 'Offers',
  '/admin/testimonials': 'Testimonials',
  '/admin/enquiries': 'Enquiries',
  '/admin/settings': 'Settings',
  '/admin/users': 'Users',
}

interface AdminHeaderProps {
  onMenuToggle: () => void
}

export default function AdminHeader({ onMenuToggle }: AdminHeaderProps) {
  const pathname = usePathname()
  const [user, setUser] = useState<{ name: string; email: string; avatar?: string } | null>(null)

  useEffect(() => {
    try {
      const stored = localStorage.getItem('user')
      if (stored) setUser(JSON.parse(stored))
    } catch {}
  }, [])

  const breadcrumbs = pathname
    .split('/')
    .filter(Boolean)
    .reduce<{ href: string; label: string }[]>((acc, segment, i, arr) => {
      const href = '/' + arr.slice(0, i + 1).join('/')
      acc.push({ href, label: breadcrumbMap[href] || segment.charAt(0).toUpperCase() + segment.slice(1) })
      return acc
    }, [])

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 backdrop-blur-xl border-b border-gray-200">
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuToggle}
            className="lg:hidden text-gray-500 hover:text-brand-600"
          >
            <Menu className="w-5 h-5" />
          </Button>

          <nav className="hidden sm:flex items-center gap-1.5 text-sm text-gray-500">
            {breadcrumbs.map((crumb, i) => (
              <span key={crumb.href} className="flex items-center gap-1.5">
                {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-gray-400" />}
                <span
                  className={cn(
                    i === breadcrumbs.length - 1
                      ? 'text-gray-900 font-medium'
                      : 'hover:text-brand-600 transition-colors'
                  )}
                >
                  {crumb.label}
                </span>
              </span>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="w-56 lg:w-72 pl-9 pr-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:bg-white focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all"
            />
          </div>

          <Button variant="ghost" size="icon" className="relative text-gray-500 hover:text-brand-600">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-[9px] font-bold text-white flex items-center justify-center">
              3
            </span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="w-8 h-8 ring-2 ring-brand-100 cursor-pointer">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback className="bg-brand-50 text-brand-700 text-xs font-semibold">
                    {user?.name?.charAt(0) || 'A'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{user?.name || 'Admin'}</span>
                  <span className="text-xs text-gray-500 font-normal">{user?.email || 'admin@anjali.com'}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600 focus:text-red-600">
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
