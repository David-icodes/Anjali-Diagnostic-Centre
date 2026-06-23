'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, Quote, ChevronLeft, ChevronRight, User } from 'lucide-react'
import api from '@/lib/api'

interface Testimonial {
  _id: string
  name: string
  content: string
  rating?: number
  location?: string
}

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [current, setCurrent] = useState(0)
  const [direction, setDirection] = useState(0)
  const fetched = useRef(false)
  const intervalRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (fetched.current) return
    fetched.current = true
    api.get('/testimonials?isActive=true')
      .then((res) => {
        const data = res.data?.testimonials || res.data || []
        if (Array.isArray(data)) setTestimonials(data.slice(0, 8))
      })
      .catch(() => {})
  }, [])

  const defaultTestimonials: Testimonial[] = [
    { _id: '1', name: 'Priya Sharma', content: 'Excellent diagnostic centre with very professional staff. Got my reports within 24 hours. Highly recommended!', rating: 5, location: 'Kukatpally' },
    { _id: '2', name: 'Ramesh Kumar', content: 'Very impressed with the home sample collection service. The phlebotomist was gentle and professional. Reports were accurate.', rating: 5, location: 'HITEC City' },
    { _id: '3', name: 'Sneha Patel', content: 'The health checkup package was comprehensive and very reasonably priced. Clean facility and friendly staff.', rating: 5, location: 'Madhapur' },
    { _id: '4', name: 'Dr. Venkatesh', content: 'I refer my patients to Anjali Diagnostics regularly. Their accuracy and turnaround time are consistently excellent.', rating: 5, location: 'Hyderabad' },
  ]

  const items = testimonials.length > 0 ? testimonials : defaultTestimonials

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setDirection(1)
      setCurrent(prev => (prev + 1) % items.length)
    }, 5000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [items.length])

  const goTo = (index: number) => {
    setDirection(index > current ? 1 : -1)
    setCurrent(index)
    if (intervalRef.current) clearInterval(intervalRef.current)
  }

  const goNext = () => {
    setDirection(1)
    setCurrent(prev => (prev + 1) % items.length)
  }

  const goPrev = () => {
    setDirection(-1)
    setCurrent(prev => (prev - 1 + items.length) % items.length)
  }

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -300 : 300, opacity: 0 }),
  }

  return (
    <section className="relative py-20 md:py-28 bg-gradient-to-b from-[#F8FAFC] to-white overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#0D47A1]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-14"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#00B8A9]/5 border border-[#00B8A9]/10 mb-4">
            <Quote className="w-4 h-4 text-[#00B8A9]" />
            <span className="text-sm font-medium text-[#00B8A9]">Testimonials</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            What Our Patients Say
          </h2>
          <p className="text-lg text-gray-600">
            Trusted by thousands of patients across Hyderabad for accurate diagnostics and compassionate care.
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto">
          <div className="relative overflow-hidden min-h-[280px]">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={current}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.4, ease: 'easeInOut' }}
                className="bg-white rounded-3xl border border-gray-100 p-8 md:p-10 shadow-xl shadow-gray-200/50"
              >
                <div className="flex items-center gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${i < (items[current]?.rating || 5) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`}
                    />
                  ))}
                </div>

                <Quote className="w-10 h-10 text-[#00B8A9]/20 mb-4" />

                <p className="text-gray-600 text-lg leading-relaxed mb-8 italic">
                  &ldquo;{items[current]?.content}&rdquo;
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0D47A1] to-[#00B8A9] flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{items[current]?.name || 'Patient'}</p>
                      <p className="text-sm text-gray-400">{items[current]?.location || 'Hyderabad'}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={goPrev}
              className="w-12 h-12 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:border-[#0D47A1]/30 hover:text-[#0D47A1] hover:shadow-md transition-all"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              {items.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === current
                      ? 'w-8 bg-gradient-to-r from-[#0D47A1] to-[#00B8A9]'
                      : 'w-2 bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to testimonial ${i + 1}`}
                />
              ))}
            </div>

            <button
              onClick={goNext}
              className="w-12 h-12 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:border-[#0D47A1]/30 hover:text-[#0D47A1] hover:shadow-md transition-all"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
