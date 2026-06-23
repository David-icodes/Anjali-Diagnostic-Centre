"use client"

import { useState, useEffect, useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Search, Microscope, Heart, Dna, Stethoscope, ArrowRight, Phone } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const searchSuggestions = [
  'Complete Blood Count',
  'Thyroid Profile',
  'Lipid Profile',
  'Blood Sugar Fasting',
  'Liver Function Test',
  'Kidney Function Test',
  'Vitamin D Test',
  'HbA1c',
]

const floatingIcons = [
  { Icon: Microscope, delay: 0, x: '10%', y: '20%', size: 32 },
  { Icon: Heart, delay: 1.5, x: '85%', y: '25%', size: 36 },
  { Icon: Dna, delay: 0.8, x: '90%', y: '65%', size: 28 },
  { Icon: Stethoscope, delay: 2, x: '8%', y: '70%', size: 30 },
]

export default function HeroSection() {
  const [search, setSearch] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([])
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start start', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [0, 150])
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  useEffect(() => {
    if (search.length > 0) {
      setFilteredSuggestions(
        searchSuggestions.filter((s) => s.toLowerCase().includes(search.toLowerCase()))
      )
      setShowSuggestions(true)
    } else {
      setShowSuggestions(false)
    }
  }, [search])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.3 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] } },
  }

  const iconFloatVariants = {
    initial: { opacity: 0, scale: 0 },
    animate: (delay: number) => ({
      opacity: [0, 1, 1, 1, 0],
      scale: [0, 1, 1, 1, 0],
      y: [0, -15, 0, -15, 0],
      transition: {
        delay,
        duration: 6,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    }),
  }

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden hero-gradient"
    >
      <motion.div style={{ y, opacity }} className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(43,143,255,0.3)_0%,_transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_rgba(15,39,86,0.5)_0%,_transparent_60%)]" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-300/10 rounded-full blur-3xl" />
      </motion.div>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {floatingIcons.map(({ Icon, delay, x, y, size }) => (
          <motion.div
            key={delay}
            custom={delay}
            variants={iconFloatVariants}
            initial="initial"
            animate="animate"
            className="absolute text-white/20"
            style={{ left: x, top: y }}
          >
            <Icon size={size} />
          </motion.div>
        ))}
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 max-w-5xl mx-auto px-4 text-center"
      >
        <motion.div variants={itemVariants} className="mb-6">
          <span className="inline-block px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-sm font-medium">
            Welcome to Anjali Diagnostic Centre
          </span>
        </motion.div>

        <motion.h1
          variants={itemVariants}
          className="text-5xl md:text-7xl lg:text-8xl font-bold text-white leading-tight mb-6"
        >
          Your Health,{' '}
          <span className="bg-gradient-to-r from-blue-200 via-white to-blue-200 bg-clip-text text-transparent">
            Our Priority
          </span>
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="text-xl md:text-2xl text-white/70 max-w-3xl mx-auto mb-10 leading-relaxed"
        >
          Accurate diagnostics, compassionate care, and cutting-edge technology —
          all under one roof.
        </motion.p>

        <motion.div variants={itemVariants} className="relative max-w-2xl mx-auto mb-10">
          <div className="relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-white/50 w-5 h-5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => search && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder="Search for diagnostic tests..."
              className="w-full pl-14 pr-6 py-5 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 text-white placeholder:text-white/40 text-lg focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 transition-all"
            />
          </div>
          {showSuggestions && filteredSuggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-full left-0 right-0 mt-2 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 overflow-hidden"
            >
              {filteredSuggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  onMouseDown={() => {
                    setSearch(suggestion)
                    setShowSuggestions(false)
                  }}
                  className="w-full px-6 py-3 text-left text-white/80 hover:bg-white/10 hover:text-white transition-colors text-sm"
                >
                  {suggestion}
                </button>
              ))}
            </motion.div>
          )}
        </motion.div>

        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            size="xl"
            variant="gradient"
            className="group relative overflow-hidden"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            Book Test Now
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button
            size="xl"
            variant="gradient-outline"
            className="group text-white border-white/30 hover:bg-white/10"
          >
            <Phone className="mr-2 w-5 h-5" />
            Contact Us
          </Button>
        </motion.div>

        <motion.div variants={itemVariants} className="mt-16 flex items-center justify-center gap-8 text-white/50 text-sm">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            ISO Certified
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            NABL Accredited
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            100% Accurate
          </span>
        </motion.div>
      </motion.div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </section>
  )
}
