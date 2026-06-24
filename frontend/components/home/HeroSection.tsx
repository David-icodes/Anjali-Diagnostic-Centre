'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion, useInView } from 'framer-motion'
import { useRef, useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Search, Shield, HeartPulse, Users, ArrowRight, Sparkles, CheckCircle, Activity,
} from 'lucide-react'
import GlobalSearch from './GlobalSearch'
import { BRAND, CENTRE_IMAGES } from '@/lib/site'
import api from '@/lib/api'

const stats = [
  { label: 'Happy Patients', value: '50000+', icon: Users },
  { label: 'Lab Tests', value: '100+', icon: Search },
  { label: 'Accuracy Rate', value: '99%', icon: Shield },
  { label: 'Specialities', value: '15+', icon: Activity },
]

function AnimatedCounter({ value }: { value: string }) {
  const [count, setCount] = useState(0)
  const [started, setStarted] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-50px' })
  const numValue = parseInt(value.replace(/[^0-9]/g, ''))

  useEffect(() => {
    if (!inView || started) return
    setStarted(true)
    let current = 0
    const step = Math.max(1, Math.ceil(numValue / 60))
    const interval = setInterval(() => {
      current += step
      if (current >= numValue) {
        setCount(numValue)
        clearInterval(interval)
      } else {
        setCount(current)
      }
    }, 30)
    return () => clearInterval(interval)
  }, [inView, started, numValue])

  return <span ref={ref}>{count}{value.includes('%') ? '%' : value.includes('+') ? '+' : ''}</span>
}

export default function HeroSection() {
  const fallbackSlides = [
    { _id: 'fallback-centre', image: CENTRE_IMAGES.heroCentre, title: 'Anjali Diagnostics centre' },
    { _id: 'fallback-lab', image: CENTRE_IMAGES.heroLab, title: 'Anjali Diagnostics laboratory' },
  ]
  const [slides, setSlides] = useState<{ _id: string; image: string; title?: string }[]>(fallbackSlides)
  const [activeSlide, setActiveSlide] = useState(0)

  useEffect(() => {
    const loadSlides = async () => {
      try {
        const { data } = await api.get('/hero-slides', { params: { active: true } })
        if (Array.isArray(data) && data.length > 0) {
          setSlides(data)
        }
      } catch {
        setSlides(fallbackSlides)
      }
    }

    loadSlides()
  }, [])

  useEffect(() => {
    slides.forEach((slide) => {
      const image = new window.Image()
      image.src = slide.image
    })
  }, [slides])

  useEffect(() => {
    if (slides.length <= 1) return
    const timer = window.setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length)
    }, 4000)

    return () => window.clearInterval(timer)
  }, [slides.length])

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-white via-[#F8FBFC] to-[#EEF8F5]">
      <div className="pointer-events-none absolute right-0 top-0 h-[520px] w-[520px] translate-x-1/3 -translate-y-1/3 rounded-full bg-[#1BAE9A]/10 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-[420px] w-[420px] -translate-x-1/3 translate-y-1/3 rounded-full bg-[#4CAF50]/10 blur-[120px]" />

      <div className="mx-auto max-w-7xl px-4 pb-10 pt-12 sm:px-6 md:pb-12 md:pt-16 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-[1.02fr_0.98fr] lg:gap-12">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#1BAE9A]/10 bg-[#1BAE9A]/5 px-3 py-1.5">
              <Sparkles className="h-3.5 w-3.5 text-[#1BAE9A]" />
              <span className="text-xs font-medium text-[#1BAE9A]">Reliable healthcare diagnostics</span>
            </div>

            <h1 className="mb-4 text-3xl font-bold leading-[1.1] text-gray-900 sm:text-4xl lg:text-5xl">
              {BRAND.fullName}{' '}
              <span className="bg-gradient-to-r from-[#1BAE9A] to-[#4CAF50] bg-clip-text text-transparent">
                You Can Trust
              </span>
            </h1>

            <p className="mb-3 text-base font-medium text-gray-700 sm:text-lg">
              Trusted diagnostics for better health.
            </p>

            <p className="mb-7 max-w-xl text-sm leading-relaxed text-gray-500 sm:text-base">
              Accurate laboratory testing, radiology support, and dependable reporting in a clean,
              patient-friendly diagnostic centre in Hyderabad.
            </p>

            <div className="mb-8 flex flex-wrap gap-3">
              <Link href="/tests">
                <Button size="lg" className="group bg-[#1BAE9A] text-white shadow-lg shadow-[#1BAE9A]/25 hover:bg-[#168E7E] hover:shadow-[#1BAE9A]/40">
                  Book Laboratory Test
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/find-a-centre">
                <Button variant="outline" size="lg" className="border-[#1BAE9A] text-[#1BAE9A] hover:bg-[#1BAE9A]/5 hover:border-[#1BAE9A]/30">
                  Find a Centre
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap gap-4">
              {[
                { icon: CheckCircle, text: 'Trusted local diagnostic centre' },
                { icon: Shield, text: 'Accurate and dependable reporting' },
                { icon: HeartPulse, text: 'Clean patient-friendly environment' },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-1.5 text-gray-500">
                  <item.icon className="h-3.5 w-3.5 text-[#4CAF50]" />
                  <span className="text-xs sm:text-sm">{item.text}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative h-[320px] overflow-hidden rounded-[2rem] bg-slate-100 shadow-[0_30px_80px_rgba(16,185,129,0.16)] sm:h-[420px] lg:h-[540px]">
              {slides.map((slide, index) => (
                <div
                  key={slide._id}
                  className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                    index === activeSlide ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  <Image
                    src={slide.image}
                    alt={slide.title || 'Anjali Diagnostics hero slide'}
                    fill
                    className="object-cover"
                    priority={index === 0}
                    sizes="(max-width: 1024px) 100vw, 48vw"
                  />
                </div>
              ))}

              {slides.length > 1 ? (
                <>
                  <button
                    type="button"
                    onClick={() => setActiveSlide((prev) => (prev - 1 + slides.length) % slides.length)}
                    className="absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow-lg transition hover:bg-white"
                    aria-label="Previous hero slide"
                  >
                    <span className="text-2xl leading-none">&lt;</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveSlide((prev) => (prev + 1) % slides.length)}
                    className="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow-lg transition hover:bg-white"
                    aria-label="Next hero slide"
                  >
                    <span className="text-2xl leading-none">&gt;</span>
                  </button>
                  <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2 rounded-full bg-white/75 px-3 py-2 backdrop-blur-sm">
                    {slides.map((slide, index) => (
                      <button
                        key={slide._id}
                        type="button"
                        onClick={() => setActiveSlide(index)}
                        className={`h-2.5 rounded-full transition-all ${index === activeSlide ? 'w-7 bg-brand-600' : 'w-2.5 bg-gray-300'}`}
                        aria-label={`Go to hero slide ${index + 1}`}
                      />
                    ))}
                  </div>
                </>
              ) : null}
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="mx-auto mt-12 max-w-3xl"
        >
          <GlobalSearch />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4"
        >
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-gray-100 bg-white p-4 text-center shadow-sm transition-shadow hover:shadow-md">
              <stat.icon className="mx-auto mb-1.5 h-5 w-5 text-[#1BAE9A]" />
              <p className="text-xl font-bold text-gray-900 md:text-2xl">
                <AnimatedCounter value={stat.value} />
              </p>
              <p className="mt-0.5 text-xs text-gray-500">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
