'use client'

import { motion } from 'framer-motion'

interface PageTransitionProps {
  children: React.ReactNode
  className?: string
}

const variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
}

export default function PageTransition({ children, className }: PageTransitionProps) {
  return (
    <motion.div
      variants={variants}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
