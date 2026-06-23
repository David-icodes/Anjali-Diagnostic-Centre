"use client"

import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: React.ReactNode
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
}

const sizeClasses: Record<string, string> = {
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-md',
  lg: 'sm:max-w-lg',
  xl: 'sm:max-w-xl',
  full: 'sm:max-w-2xl',
}

export default function Modal({
  open,
  onClose,
  title,
  description,
  children,
  className,
  size = 'md',
}: ModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <AnimatePresence>
        {open && (
          <DialogContent
            className={cn(
              'p-0 gap-0 overflow-hidden',
              sizeClasses[size],
              className
            )}
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.96 }}
              transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <DialogTitle className="text-lg font-semibold text-gray-900">
                      {title}
                    </DialogTitle>
                    {description && (
                      <DialogDescription className="text-sm text-gray-500 mt-1">
                        {description}
                      </DialogDescription>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </DialogHeader>
              <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
                {children}
              </div>
            </motion.div>
          </DialogContent>
        )}
      </AnimatePresence>
    </Dialog>
  )
}
