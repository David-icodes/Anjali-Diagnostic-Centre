'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { motion, useScroll, useMotionValueEvent } from 'framer-motion'
import { Menu, Phone, Search as SearchIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import MobileNav from './MobileNav'
import { BRAND } from '@/lib/site'
import GlobalSearch from '@/components/home/GlobalSearch'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About Us' },
  { href: '/tests', label: 'Services' },
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
  const { scrollY } = useScroll()
  const searchAnchorRef = useRef<HTMLDivElement>(null)

  useMotionValueEvent(scrollY, 'change', (latest) => {
    const prev = scrollY.getPrevious() ?? 0
    if (latest > prev && latest > 150) setHidden(true)
    else setHidden(false)
    setScrolled(latest > 20)
  })

  useEffect(() => {
    const handleSearchScroll = () => {
      const target = searchAnchorRef.current
      if (!target) return
      target.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }

    window.addEventListener('focus-header-search', handleSearchScroll)
    return () => window.removeEventListener('focus-header-search', handleSearchScroll)
  }, [])

  return (
    <>
      <motion.header
        variants={{ visible: { y: 0 }, hidden: { y: '-100%' } }}
        animate={hidden ? 'hidden' : 'visible'}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className={cn(
          'sticky top-0 z-50 border-b border-[#DCEFEB] bg-white/95 backdrop-blur-xl transition-all duration-150',
          scrolled ? 'shadow-[0_16px_34px_rgba(15,118,110,0.10)]' : 'shadow-[0_8px_20px_rgba(15,118,110,0.05)]'
        )}
      >
        <div className="border-b border-[#E7F2EF] bg-[#F8FAFC]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4 py-4 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
              <Link href="/" className="flex items-center gap-3 shrink-0">
                <div className="relative h-12 w-12 overflow-hidden rounded-2xl border border-[#DCEFEB] bg-white shadow-sm">
                  <Image src={BRAND.logo} alt={BRAND.fullName} fill className="object-cover p-1.5" sizes="48px" />
                </div>
                <div>
                  <p className="text-lg font-bold leading-tight text-gray-900 sm:text-xl">Anjali Diagnostics Centre</p>
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#0F766E]">Accurate Diagnostic Care</p>
                </div>
              </Link>

              <div ref={searchAnchorRef} className="flex-1 lg:max-w-2xl">
                <GlobalSearch
                  compact
                  placeholder="Search for tests and health checkups"
                />
              </div>

              <div className="hidden shrink-0 items-center gap-3 rounded-2xl border border-[#DCEFEB] bg-white px-4 py-3 shadow-sm sm:flex">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E8F8F5] text-[#14B8A6]">
                  <Phone className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.16em] text-gray-400">Call Us</p>
                  <a href="tel:9989220938" className="text-base font-semibold text-[#0F766E]">9989220938</a>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 sm:hidden">
                <button
                  type="button"
                  onClick={() => window.dispatchEvent(new Event('focus-header-search'))}
                  className="flex items-center gap-2 rounded-full border border-[#DCEFEB] bg-white px-4 py-2 text-sm font-medium text-[#0F766E] shadow-sm"
                >
                  <SearchIcon className="h-4 w-4" />
                  Search
                </button>
                <a href="tel:9989220938" className="flex items-center gap-2 rounded-full border border-[#DCEFEB] bg-white px-4 py-2 text-sm font-semibold text-[#0F766E] shadow-sm">
                  <Phone className="h-4 w-4" />
                  9989220938
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#0F766E]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-12 items-center justify-between gap-4">
              <nav className="hidden flex-1 items-center justify-center gap-1 lg:flex">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                        'rounded-full px-4 py-2 text-sm font-medium transition-colors duration-150',
                        isActive ? 'bg-white text-[#0F766E]' : 'text-white hover:bg-white/10'
                      )}
                    >
                      {link.label}
                    </Link>
                  )
                })}
              </nav>

              <button
                onClick={() => setMobileOpen(true)}
                className="ml-auto rounded-full border border-white/20 bg-white/10 p-2 text-white transition-colors duration-150 hover:bg-white/20 lg:hidden"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      <MobileNav isOpen={mobileOpen} onClose={() => setMobileOpen(false)} navLinks={navLinks} />
    </>
  )
}
