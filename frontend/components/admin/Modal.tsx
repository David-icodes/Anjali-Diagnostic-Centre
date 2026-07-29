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
              'gap-0 overflow-hidden p-0',
              sizeClasses[size],
              className
            )}
          >
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <DialogHeader className="border-b border-gray-100 px-6 pb-4 pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <DialogTitle className="text-lg font-semibold text-gray-900">
                      {title}
                    </DialogTitle>
                    {description && (
                      <DialogDescription className="mt-1 text-sm text-gray-500">
                        {description}
                      </DialogDescription>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="shrink-0 text-gray-500 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </DialogHeader>
              <div className="max-h-[70vh] overflow-y-auto px-6 py-4">
                {children}
              </div>
            </motion.div>
          </DialogContent>
        )}
      </AnimatePresence>
    </Dialog>
  )
}
