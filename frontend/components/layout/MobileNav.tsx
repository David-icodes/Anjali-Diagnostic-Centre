'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CalendarPlus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { BRAND } from '@/lib/site'

interface MobileNavProps {
  isOpen: boolean
  onClose: () => void
  navLinks: { href: string; label: string }[]
}

const itemVariants = {
  hidden: { x: 60, opacity: 0 },
  visible: (i: number) => ({
    x: 0, opacity: 1,
    transition: { delay: 0.1 + i * 0.06, type: 'spring', stiffness: 120, damping: 12 },
  }),
}

export default function MobileNav({ isOpen, onClose, navLinks }: MobileNavProps) {
  const pathname = usePathname()

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-y-0 right-0 z-50 w-full max-w-sm border-l border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(237,248,255,0.94)_100%)] shadow-2xl backdrop-blur-xl"
          >
            <div className="flex items-center justify-between border-b border-[#D9ECE8] p-6">
              <div className="flex items-center gap-2.5">
                <div className="relative h-10 w-10 overflow-hidden rounded-2xl border border-white/80 bg-white/85 shadow-sm">
                  <Image src={BRAND.logo} alt={BRAND.fullName} fill className="object-cover p-1" sizes="40px" />
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-900">Menu</p>
                  <p className="text-xs text-[#0F9A88]">{BRAND.name}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-full p-2 text-gray-500 transition-colors hover:bg-[#F3FBF8] hover:text-[#0F9A88]"
                aria-label="Close menu"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <nav className="flex flex-col p-6 gap-1.5">
              {navLinks.map((link, i) => (
                <motion.div key={link.href} custom={i} variants={itemVariants} initial="hidden" animate="visible">
                  <Link
                    href={link.href}
                    onClick={onClose}
                    className={cn(
                      'block rounded-2xl px-4 py-3 text-base font-medium transition-all duration-300',
                      'hover:bg-[#F3FBF8] hover:pl-6 hover:text-[#0F9A88]',
                      pathname === link.href
                        ? 'border border-[#CFE9E3] bg-[#E8F8F5] text-[#0F9A88] shadow-sm'
                        : 'text-gray-700'
                    )}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <motion.div
                custom={navLinks.length}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                className="mt-4 border-t border-[#D9ECE8] pt-4"
              >
                <Link href="/booking" onClick={onClose}>
                  <Button className="w-full rounded-full bg-gradient-to-r from-[#14B8A6] via-[#22C1A6] to-[#78D96B] text-white shadow-[0_16px_34px_rgba(20,184,166,0.26)]">
                    <CalendarPlus className="mr-2 h-4 w-4" />
                    Book a Test
                  </Button>
                </Link>
              </motion.div>
            </nav>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
