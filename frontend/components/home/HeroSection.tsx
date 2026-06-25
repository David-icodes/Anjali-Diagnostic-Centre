'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import { BRAND, CENTRE_IMAGES } from '@/lib/site'
import api from '@/lib/api'
import GlobalSearch from '@/components/home/GlobalSearch'

const departments = [
  'Blood Test',
  'Diabetes',
  'Thyroid',
  'Liver',
  'Kidney',
  'Heart',
  'Hormones',
  'Vitamin',
  'Radiology',
]

export default function HeroSection() {
  const router = useRouter()
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
      <div className="pointer-events-none absolute right-0 top-0 h-[520px] w-[520px] translate-x-1/3 -translate-y-1/3 rounded-full bg-[#14B8A6]/10 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-[420px] w-[420px] -translate-x-1/3 translate-y-1/3 rounded-full bg-[#0F766E]/10 blur-[120px]" />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        <div className="grid items-center gap-8 lg:grid-cols-[1fr_1fr] lg:gap-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="max-w-xl"
          >
            <h1 className="mb-4 text-3xl font-bold leading-[1.1] text-gray-900 sm:text-4xl lg:text-5xl">
              {BRAND.fullName}{' '}
              <span className="bg-gradient-to-r from-[#14B8A6] to-[#0F766E] bg-clip-text text-transparent">
                You Can Trust
              </span>
            </h1>

            <p className="mb-3 text-base font-medium text-gray-700 sm:text-lg">
              Trusted diagnostics for better health.
            </p>

            <p className="mb-7 text-sm leading-relaxed text-gray-500 sm:text-base">
              Accurate laboratory testing, radiology support, and dependable reporting in a clean,
              patient-friendly diagnostic centre in Hyderabad.
            </p>

            <div className="mb-5">
              <GlobalSearch className="max-w-xl" placeholder="Search blood tests, thyroid, vitamin, MRI, CT scan, and more..." />
            </div>

            <div className="mb-7 flex flex-wrap gap-2">
              {departments.map((department) => (
                <button
                  key={department}
                  type="button"
                  onClick={() => {
                    if (department === 'Radiology') {
                      router.push('/booking?department=Radiology')
                      return
                    }
                    router.push(`/booking?department=${encodeURIComponent(department)}`)
                  }}
                  className="rounded-full border border-[#14B8A6]/20 bg-white/90 px-3 py-1.5 text-sm font-medium text-[#0F766E] shadow-sm transition hover:border-[#14B8A6] hover:bg-[#14B8A6]/5"
                >
                  {department}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href="/tests">
                <Button size="lg" className="group bg-[#14B8A6] text-white shadow-lg shadow-[#14B8A6]/20 hover:bg-[#0F766E]">
                  Book Laboratory Test
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-150 group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/find-a-centre">
                <Button variant="outline" size="lg" className="border-[#14B8A6] text-[#0F766E] hover:bg-[#14B8A6]/5 hover:border-[#14B8A6]/30">
                  Find a Centre
                </Button>
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2, delay: 0.05 }}
            className="relative"
          >
            <div className="relative h-[300px] overflow-hidden rounded-[2rem] bg-slate-100 shadow-[0_24px_60px_rgba(20,184,166,0.14)] sm:h-[380px] lg:h-[500px]">
              {slides.map((slide, index) => (
                <div
                  key={slide._id}
                  className={`absolute inset-0 transition-opacity duration-300 ease-in-out ${index === activeSlide ? 'opacity-100' : 'opacity-0'}`}
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
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
