"use client"

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { ClipboardList, MousePointerClick, Syringe, FileText } from 'lucide-react'

const steps = [
  {
    icon: ClipboardList,
    title: 'Choose Test',
    description: 'Browse our comprehensive list of diagnostic tests and packages.',
  },
  {
    icon: MousePointerClick,
    title: 'Book Online',
    description: 'Select your preferred date and time slot for sample collection.',
  },
  {
    icon: Syringe,
    title: 'Sample Collection',
    description: 'Visit our center or get a free home sample collection.',
  },
  {
    icon: FileText,
    title: 'Receive Report',
    description: 'Get your detailed reports online via email and app.',
  },
]

export default function HowItWorks() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' })

  return (
    <section className="py-24 px-4 bg-gradient-to-b from-background to-brand-50/50" id="how-it-works">
      <div ref={sectionRef} className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 rounded-full bg-brand-100 text-brand-700 text-sm font-medium mb-4">
            How It Works
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Simple{' '}
            <span className="text-gradient">4-Step Process</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Getting your health checkup done has never been easier
          </p>
        </motion.div>

        <div className="relative">
          <div className="hidden lg:block absolute top-24 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-brand-200 via-brand-400 to-brand-200">
            <motion.div
              initial={{ scaleX: 0 }}
              animate={isInView ? { scaleX: 1 } : {}}
              transition={{ duration: 1.5, delay: 0.5, ease: 'easeInOut' }}
              className="h-full bg-gradient-to-r from-brand-500 to-brand-400 origin-left"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 50 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="relative flex flex-col items-center text-center group"
              >
                <div className="relative mb-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={isInView ? { scale: 1 } : {}}
                    transition={{
                      duration: 0.5,
                      delay: index * 0.2 + 0.3,
                      type: 'spring',
                      stiffness: 200,
                    }}
                    className="relative z-10 w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-lg shadow-brand-500/25 flex items-center justify-center group-hover:shadow-xl group-hover:shadow-brand-500/40 group-hover:scale-105 transition-all duration-300"
                  >
                    <step.icon className="w-7 h-7" />
                  </motion.div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-brand-100 border-2 border-white flex items-center justify-center">
                    <span className="text-sm font-bold text-brand-600">
                      {index + 1}
                    </span>
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground max-w-xs">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
