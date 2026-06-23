'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, useScroll, useMotionValueEvent } from 'framer-motion'
import { Search, Menu, Phone, Microscope } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import MobileNav from './MobileNav'
import axios from 'axios'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/tests', label: 'Tests' },
  { href: '/book-test', label: 'Book Test' },
  { href: '/track-order', label: 'Track Order' },
  { href: '/contact', label: 'Contact' },
]

export default function Header() {
  const pathname = usePathname()
  const [hidden, setHidden] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [settings, setSettings] = useState<Record<string, string>>({})
  const { scrollY } = useScroll()

  useMotionValueEvent(scrollY, 'change', (latest) => {
    const prev = scrollY.getPrevious()
    if (latest > prev && latest > 100) {
      setHidden(true)
    } else {
      setHidden(false)
    }
  })

  useEffect(() => {
    axios.get('/api/settings/public').then((res) => {
      if (res.data?.settings) setSettings(res.data.settings)
    }).catch(() => {})
  }, [])

  return (
    <>
      <motion.header
        variants={{
          visible: { y: 0 },
          hidden: { y: '-100%' },
        }}
        animate={hidden ? 'hidden' : 'visible'}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="fixed top-0 left-0 right-0 z-30"
      >
        <div className="bg-white/70 backdrop-blur-xl border-b border-white/20 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16 lg:h-20">
              <Link href="/" className="flex items-center gap-2 group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-600 to-brand-400 flex items-center justify-center shadow-lg shadow-brand-500/20 group-hover:shadow-brand-500/40 transition-shadow">
                  <Microscope className="w-6 h-6 text-white" />
                </div>
                <div className="hidden sm:block">
                  <p className="text-lg font-bold text-brand-950 leading-tight">Anjali Diagnostic</p>
                  <p className="text-xs text-brand-600 font-medium leading-tight -mt-0.5">Centre</p>
                </div>
              </Link>

              <nav className="hidden lg:flex items-center gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      'relative px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200',
                      pathname === link.href
                        ? 'text-brand-700'
                        : 'text-gray-600 hover:text-brand-600 hover:bg-brand-50/50'
                    )}
                  >
                    {link.label}
                    {pathname === link.href && (
                      <motion.span
                        layoutId="activeNav"
                        className="absolute inset-0 rounded-lg bg-brand-50 border border-brand-100 -z-10"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                  </Link>
                ))}
              </nav>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSearchOpen(!searchOpen)}
                  className="p-2 rounded-xl text-gray-400 hover:text-brand-600 hover:bg-brand-50 transition-all"
                  aria-label="Toggle search"
                >
                  <Search className="w-5 h-5" />
                </button>

                <a
                  href={`tel:${settings.phone || '+919999999999'}`}
                  className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-gray-600 hover:text-brand-600 hover:bg-brand-50 transition-all"
                >
                  <Phone className="w-4 h-4" />
                  <span>{settings.phone || 'Contact'}</span>
                </a>

                <Link href="/book-test" className="hidden sm:block">
                  <Button variant="gradient" size="sm">
                    Book Appointment
                  </Button>
                </Link>

                <button
                  onClick={() => setMobileOpen(true)}
                  className="lg:hidden p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors"
                  aria-label="Open menu"
                >
                  <Menu className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <motion.div
          initial={false}
          animate={searchOpen ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden bg-white/80 backdrop-blur-xl border-b border-gray-100"
        >
          <div className="max-w-3xl mx-auto px-4 py-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for diagnostic tests..."
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all text-sm"
                autoFocus
              />
            </div>
          </div>
        </motion.div>
      </motion.header>

      <MobileNav isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  )
}
