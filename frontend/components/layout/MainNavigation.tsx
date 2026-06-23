'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from 'framer-motion'
import { Menu, ChevronDown, FlaskRoundIcon as Flask, Scan, CalendarPlus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import MobileNav from './MobileNav'
import { BRAND } from '@/lib/site'

const dropdownItems = [
  { href: '/tests', label: 'Laboratory Services', icon: Flask },
  { href: '/radiology', label: 'Radiology Services', icon: Scan },
]

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About Us' },
]

const navItemsRight = [
  { href: '/health-packages', label: 'Health Packages' },
  { href: '/find-a-centre', label: 'Find a Centre' },
  { href: '/track-order', label: 'Download Report' },
  { href: '/contact', label: 'Contact' },
]

const mobileNavLinks = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About Us' },
  { href: '/tests', label: 'Laboratory Services' },
  { href: '/radiology', label: 'Radiology Services' },
  { href: '/health-packages', label: 'Health Packages' },
  { href: '/find-a-centre', label: 'Find a Centre' },
  { href: '/track-order', label: 'Download Report' },
  { href: '/contact', label: 'Contact' },
]

export default function MainNavigation() {
  const pathname = usePathname()
  const [hidden, setHidden] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { scrollY } = useScroll()

  useMotionValueEvent(scrollY, 'change', (latest) => {
    const prev = scrollY.getPrevious() ?? 0
    if (latest > prev && latest > 150) setHidden(true)
    else setHidden(false)
    setScrolled(latest > 20)
  })

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setDropdownOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <>
      <motion.header
        variants={{ visible: { y: 0 }, hidden: { y: '-100%' } }}
        animate={hidden ? 'hidden' : 'visible'}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={cn(
          'sticky top-0 z-50 border-b border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.94)_0%,rgba(237,248,255,0.88)_100%)] backdrop-blur-xl transition-all duration-300',
          scrolled ? 'shadow-[0_18px_45px_rgba(15,118,110,0.12)]' : 'shadow-[0_8px_24px_rgba(15,118,110,0.06)]'
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-[74px] items-center justify-between lg:h-[82px]">
            <Link href="/" className="flex items-center gap-2.5 group shrink-0">
              <div className="relative h-11 w-11 overflow-hidden rounded-2xl border border-white/80 bg-white/85 shadow-[0_10px_25px_rgba(15,118,110,0.12)] backdrop-blur-sm transition-all group-hover:scale-[1.02] group-hover:shadow-[0_16px_32px_rgba(15,118,110,0.16)]">
                <Image src={BRAND.logo} alt={BRAND.fullName} fill className="object-cover p-1.5" sizes="48px" />
              </div>
              <div>
                <p className="text-base font-bold text-gray-900 leading-tight">{BRAND.name}</p>
                <p className="text-[9px] text-[#0F9A88] font-semibold uppercase tracking-[0.24em] leading-tight -mt-0.5">Centre</p>
              </div>
            </Link>

            <nav className="hidden flex-1 items-center justify-center lg:flex">
              <div className="flex items-center gap-1 rounded-full border border-white/80 bg-white/60 px-2 py-2 shadow-[0_12px_28px_rgba(15,118,110,0.08)] backdrop-blur-md">
              {navItems.map((link) => {
                const isActive = pathname === link.href
                return (
                  <Link key={link.href} href={link.href}
                    className={cn(
                      'relative rounded-full px-4 py-2 text-sm font-medium transition-all duration-200',
                      isActive ? 'bg-[#E8F8F5] text-[#0F9A88] shadow-sm' : 'text-gray-700 hover:bg-[#F3FBF8] hover:text-[#0F9A88]'
                    )}
                  >
                    {link.label}
                  </Link>
                )
              })}

              <div ref={dropdownRef} className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className={cn(
                    'flex items-center gap-1 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200',
                    pathname === '/tests' || pathname === '/radiology' ? 'bg-[#E8F8F5] text-[#0F9A88] shadow-sm' : 'text-gray-700 hover:bg-[#F3FBF8] hover:text-[#0F9A88]'
                  )}
                >
                  Services
                  <ChevronDown className={cn('w-4 h-4 transition-transform', dropdownOpen && 'rotate-180')} />
                </button>
                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div initial={{ opacity: 0, y: 8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="absolute left-0 top-full z-50 mt-3 w-56 overflow-hidden rounded-2xl border border-white/80 bg-white/90 shadow-[0_24px_50px_rgba(15,118,110,0.14)] backdrop-blur-xl"
                    >
                      {dropdownItems.map((item) => (
                        <Link key={item.href} href={item.href} onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 transition-colors hover:bg-[#F3FBF8] hover:text-[#0F9A88]">
                          <item.icon className="w-4 h-4 text-[#0F9A88]" />
                          {item.label}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {navItemsRight.map((link) => {
                const isActive = pathname === link.href
                return (
                  <Link key={link.href} href={link.href}
                    className={cn(
                      'relative rounded-full px-4 py-2 text-sm font-medium transition-all duration-200',
                      isActive ? 'bg-[#E8F8F5] text-[#0F9A88] shadow-sm' : 'text-gray-700 hover:bg-[#F3FBF8] hover:text-[#0F9A88]'
                    )}
                  >
                    {link.label}
                  </Link>
                )
              })}
              </div>
            </nav>

            <div className="flex items-center gap-3">
              <Link href="/booking">
                <Button className="hidden h-11 rounded-full bg-gradient-to-r from-[#14B8A6] via-[#22C1A6] to-[#78D96B] px-5 text-sm font-semibold text-white shadow-[0_16px_34px_rgba(20,184,166,0.28)] transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_20px_40px_rgba(20,184,166,0.34)] sm:flex">
                  <CalendarPlus className="mr-2 h-4 w-4" />
                  Book a Test
                </Button>
              </Link>

              <button
                onClick={() => setMobileOpen(true)}
                className="rounded-full border border-white/80 bg-white/70 p-2.5 text-gray-700 shadow-sm transition-all hover:bg-[#F3FBF8] hover:text-[#0F9A88] lg:hidden"
                aria-label="Open menu"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      <MobileNav isOpen={mobileOpen} onClose={() => setMobileOpen(false)} navLinks={mobileNavLinks} />
    </>
  )
}
