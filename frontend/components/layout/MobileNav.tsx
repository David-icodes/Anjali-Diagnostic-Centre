'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/tests', label: 'Tests' },
  { href: '/book-test', label: 'Book Test' },
  { href: '/track-order', label: 'Track Order' },
  { href: '/contact', label: 'Contact' },
]

const itemVariants = {
  hidden: { x: 60, opacity: 0 },
  visible: (i: number) => ({
    x: 0,
    opacity: 1,
    transition: { delay: 0.1 + i * 0.08, type: 'spring', stiffness: 120, damping: 12 },
  }),
}

interface MobileNavProps {
  isOpen: boolean
  onClose: () => void
}

export default function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const pathname = usePathname()

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
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
            className="fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <span className="text-xl font-bold text-brand-700">Menu</span>
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                aria-label="Close menu"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <nav className="flex flex-col p-6 gap-2">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.href}
                  custom={i}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <Link
                    href={link.href}
                    onClick={onClose}
                    className={cn(
                      'block px-4 py-3 rounded-xl text-lg font-medium transition-all duration-300',
                      'hover:bg-brand-50 hover:text-brand-700 hover:pl-6',
                      pathname === link.href
                        ? 'bg-brand-50 text-brand-700 border-l-4 border-brand-500'
                        : 'text-gray-600'
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
                className="mt-4 pt-4 border-t border-gray-100"
              >
                <Link href="/book-test" onClick={onClose}>
                  <Button variant="gradient" size="lg" className="w-full">
                    Book Appointment
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
