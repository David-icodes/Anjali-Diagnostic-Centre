"use client"

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { FlaskRoundIcon as Flask, Heart, Award, BadgeCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

const stats = [
  { icon: Flask, value: 500, suffix: '+', label: 'Tests Available' },
  { icon: Heart, value: 50000, suffix: '+', label: 'Happy Patients' },
  { icon: Award, value: 15, suffix: '+', label: 'Years Experience' },
  { icon: BadgeCheck, value: 6, suffix: '', label: 'Certifications' },
]

function Counter({ target, suffix }: { target: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const displayValue = isInView ? target : 0

  return (
    <span ref={ref}>
      {displayValue.toLocaleString('en-IN')}
      {suffix}
    </span>
  )
}

export default function StatsSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' })

  return (
    <section ref={sectionRef} className="relative -mt-20 z-20 px-4 pb-16">
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={isInView ? { y: 0, opacity: 1 } : {}}
        transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="max-w-6xl mx-auto"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ y: 40, opacity: 0 }}
              animate={isInView ? { y: 0, opacity: 1 } : {}}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="relative group"
            >
              <div className="relative p-6 rounded-2xl bg-white/70 backdrop-blur-xl border border-white/30 shadow-xl shadow-black/5 hover:shadow-2xl hover:shadow-brand-500/10 transition-all duration-500 text-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <div className="inline-flex p-3 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-lg shadow-brand-500/25 mb-4">
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <div className="text-3xl md:text-4xl font-bold text-brand-700 mb-1">
                    <Counter target={stat.value} suffix={stat.suffix} />
                  </div>
                  <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  )
}
