"use client"

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import {
  ShieldCheck,
  Target,
  Users,
  Timer,
  Home,
  Cpu,
} from 'lucide-react'

const reasons = [
  {
    icon: ShieldCheck,
    title: 'Certified Laboratory',
    description:
      'NABL accredited and ISO certified lab with strict quality control protocols ensuring reliable results every time.',
  },
  {
    icon: Target,
    title: 'Accurate Results',
    description:
      'State-of-the-art equipment and rigorous testing procedures guarantee precision and accuracy in every report.',
  },
  {
    icon: Users,
    title: 'Experienced Staff',
    description:
      'Our team of skilled pathologists, technicians, and healthcare professionals bring decades of expertise.',
  },
  {
    icon: Timer,
    title: 'Fast Reports',
    description:
      'Quick turnaround times with digital reports delivered directly to your email and mobile app.',
  },
  {
    icon: Home,
    title: 'Home Sample Collection',
    description:
      'Convenient doorstep sample collection service at no extra cost, saving you time and effort.',
  },
  {
    icon: Cpu,
    title: 'Advanced Technology',
    description:
      'Cutting-edge diagnostic equipment and automated systems for the most accurate health insights.',
  },
]

export default function WhyChooseUs() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' })

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
    },
  }

  return (
    <section className="py-24 px-4 relative overflow-hidden" id="why-choose-us">
      <div className="absolute inset-0 bg-gradient-to-b from-brand-50/50 to-transparent pointer-events-none" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-200/30 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-300/20 rounded-full blur-3xl" />

      <div ref={sectionRef} className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 rounded-full bg-brand-100 text-brand-700 text-sm font-medium mb-4">
            Why Choose Us
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Why We Are{' '}
            <span className="text-gradient">Different</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We combine cutting-edge technology with compassionate care to deliver
            the best diagnostic experience
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {reasons.map((reason) => (
            <motion.div
              key={reason.title}
              variants={cardVariants}
              className="group relative p-8 rounded-2xl bg-white/70 backdrop-blur-xl border border-white/30 shadow-lg hover:shadow-2xl hover:shadow-brand-500/10 transition-all duration-500 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-brand-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 10 }}
                  className="inline-flex p-3 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-lg shadow-brand-500/25 mb-5"
                >
                  <reason.icon className="w-6 h-6" />
                </motion.div>
                <h3 className="text-lg font-semibold mb-3">{reason.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {reason.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
