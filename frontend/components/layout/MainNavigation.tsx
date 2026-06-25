'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { motion, useScroll, useMotionValueEvent } from 'framer-motion'
import { Menu, Search as SearchIcon } from 'lucide-react'
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

const WHATSAPP_LINK = 'https://wa.me/919440626892'
const WHATSAPP_LABEL = '9440626892'

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M19.11 17.34c-.28-.14-1.64-.81-1.89-.9-.25-.09-.43-.14-.61.14-.18.28-.7.9-.86 1.09-.16.18-.31.21-.58.07-.28-.14-1.16-.43-2.2-1.37-.81-.72-1.35-1.61-1.51-1.88-.16-.28-.02-.42.12-.56.12-.12.28-.31.42-.46.14-.16.18-.28.28-.46.09-.18.05-.35-.02-.49-.07-.14-.61-1.48-.84-2.02-.22-.53-.44-.46-.61-.47h-.52c-.18 0-.46.07-.7.35-.24.28-.92.9-.92 2.2s.94 2.56 1.07 2.74c.14.18 1.85 2.82 4.49 3.95.63.27 1.12.43 1.5.55.63.2 1.2.17 1.65.1.5-.07 1.64-.67 1.87-1.32.23-.65.23-1.21.16-1.32-.06-.12-.24-.19-.52-.33Z" />
      <path d="M16.01 3.2c-7.05 0-12.77 5.72-12.77 12.77 0 2.24.58 4.43 1.68 6.36L3.2 28.8l6.64-1.69c1.84 1 3.91 1.53 6 1.53h.01c7.04 0 12.95-5.72 12.95-12.77 0-3.42-1.33-6.64-3.75-9.06A12.69 12.69 0 0 0 16.01 3.2Zm-.16 23.28h-.01c-1.9 0-3.76-.51-5.38-1.48l-.38-.22-3.94 1 1.05-3.84-.25-.39a10.57 10.57 0 0 1-1.64-5.62c0-5.86 4.77-10.63 10.64-10.63 2.83 0 5.49 1.1 7.49 3.11 2 2 3.1 4.66 3.1 7.49 0 5.86-4.96 10.58-10.68 10.58Z" />
    </svg>
  )
}

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
              <Link href="/" className="flex shrink-0 items-center gap-3">
                <div className="relative h-12 w-12 overflow-hidden rounded-2xl border border-[#DCEFEB] bg-white shadow-sm">
                  <Image src={BRAND.logo} alt={BRAND.fullName} fill className="object-cover p-1.5" sizes="48px" />
                </div>
                <div>
                  <p className="text-lg font-bold leading-tight text-gray-900 sm:text-xl">Anjali Diagnostics Centre</p>
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#0F766E]">Accurate Diagnostic Care</p>
                </div>
              </Link>

              <div ref={searchAnchorRef} className="flex-1 lg:max-w-2xl">
                <GlobalSearch compact placeholder="Search for tests and health checkups" />
              </div>

              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noreferrer"
                className="hidden shrink-0 items-center gap-3 rounded-2xl border border-[#DCEFEB] bg-white px-4 py-3 shadow-sm transition hover:border-[#25D366]/30 hover:shadow-md sm:flex"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EAFBF1] text-[#25D366]">
                  <WhatsAppIcon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.16em] text-gray-400">WhatsApp</p>
                  <span className="text-base font-semibold text-[#0F766E]">{WHATSAPP_LABEL}</span>
                </div>
              </a>

              <div className="flex items-center justify-between gap-3 sm:hidden">
                <button
                  type="button"
                  onClick={() => window.dispatchEvent(new Event('focus-header-search'))}
                  className="flex items-center gap-2 rounded-full border border-[#DCEFEB] bg-white px-4 py-2 text-sm font-medium text-[#0F766E] shadow-sm"
                >
                  <SearchIcon className="h-4 w-4" />
                  Search
                </button>
                <a
                  href={WHATSAPP_LINK}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 rounded-full border border-[#DCEFEB] bg-white px-4 py-2 text-sm font-semibold text-[#0F766E] shadow-sm"
                >
                  <WhatsAppIcon className="h-4 w-4 text-[#25D366]" />
                  {WHATSAPP_LABEL}
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
