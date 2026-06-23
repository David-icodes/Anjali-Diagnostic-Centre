"use client"

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { TrendingUp, TrendingDown, LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

const gradients: Record<string, string> = {
  blue: 'from-blue-500 to-blue-600',
  green: 'from-emerald-500 to-emerald-600',
  purple: 'from-purple-500 to-purple-600',
  orange: 'from-orange-500 to-orange-600',
  pink: 'from-pink-500 to-pink-600',
  teal: 'from-teal-500 to-teal-600',
}

const shadowColors: Record<string, string> = {
  blue: 'shadow-blue-500/25',
  green: 'shadow-emerald-500/25',
  purple: 'shadow-purple-500/25',
  orange: 'shadow-orange-500/25',
  pink: 'shadow-pink-500/25',
  teal: 'shadow-teal-500/25',
}

interface StatsCardProps {
  title: string
  value: number
  icon: LucideIcon
  trend?: { value: number; isPositive: boolean }
  gradient?: string
  prefix?: string
  suffix?: string
  delay?: number
}

function Counter({ target, prefix = '', suffix = '' }: { target: number; prefix?: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })

  return (
    <span ref={ref} className="text-3xl font-bold">
      {prefix}{isInView ? target.toLocaleString('en-IN') : 0}{suffix}
    </span>
  )
}

export default function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  gradient = 'blue',
  prefix = '',
  suffix = '',
  delay = 0,
}: StatsCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })

  return (
    <motion.div
      ref={ref}
      initial={{ y: 30, opacity: 0, scale: 0.95 }}
      animate={isInView ? { y: 0, opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.5, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="relative group cursor-pointer"
    >
      <div className="relative p-5 rounded-2xl bg-white border border-gray-100 shadow-lg shadow-black/5 hover:shadow-xl transition-shadow duration-300 overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 -translate-y-8 translate-x-8">
          <div
            className={cn(
              'w-full h-full rounded-full bg-gradient-to-br opacity-5 group-hover:opacity-10 transition-opacity',
              gradients[gradient]
            )}
          />
        </div>

        <div className="flex items-start justify-between relative z-10">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <Counter target={value} prefix={prefix} suffix={suffix} />
            {trend && (
              <div className="flex items-center gap-1 mt-2">
                {trend.isPositive ? (
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500" />
                )}
                <span
                  className={cn(
                    'text-xs font-medium',
                    trend.isPositive ? 'text-emerald-600' : 'text-red-600'
                  )}
                >
                  {trend.isPositive ? '+' : ''}{trend.value}%
                </span>
                <span className="text-xs text-gray-400">vs last month</span>
              </div>
            )}
          </div>

          <div
            className={cn(
              'p-3 rounded-xl bg-gradient-to-br shadow-lg',
              gradients[gradient],
              shadowColors[gradient]
            )}
          >
            <Icon className="w-5 h-5 text-white" />
          </div>
        </div>
      </div>
    </motion.div>
  )
}
