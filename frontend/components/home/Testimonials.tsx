"use client"

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import api from '@/lib/api'

interface Testimonial {
  _id: string
  name: string
  role?: string
  content: string
  rating: number
  avatar?: string
}

const fallbackTestimonials: Testimonial[] = [
  {
    _id: '1',
    name: 'Priya Sharma',
    role: 'Regular Patient',
    content:
      'Excellent service! The home collection made it so convenient. Reports were delivered within 24 hours. Highly recommended!',
    rating: 5,
  },
  {
    _id: '2',
    name: 'Rajesh Kumar',
    role: 'Business Owner',
    content:
      'I have been using Anjali Diagnostic Centre for over 5 years. Their accuracy and professionalism is unmatched.',
    rating: 5,
  },
  {
    _id: '3',
    name: 'Sneha Patel',
    role: 'Teacher',
    content:
      'The staff is very caring and professional. They explained everything clearly. Great experience overall.',
    rating: 4,
  },
  {
    _id: '4',
    name: 'Amit Verma',
    role: 'Software Engineer',
    content:
      'Online booking was seamless. The reports were available on the app within hours. Truly digital-first approach!',
    rating: 5,
  },
]

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            'w-4 h-4',
            i < rating ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground/20'
          )}
        />
      ))}
    </div>
  )
}

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(fallbackTestimonials)
  const [loading, setLoading] = useState(true)
  const [current, setCurrent] = useState(0)
  const sectionRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(sectionRef, { once: true })
  const intervalRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const { data } = await api.get('/testimonials/active')
        const fetched = data?.testimonials || data?.data
        if (fetched?.length) setTestimonials(fetched)
      } catch {
        // use fallback
      } finally {
        setLoading(false)
      }
    }
    fetchTestimonials()
  }, [])

  const startAutoSlide = useCallback(() => {
    intervalRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length)
    }, 5000)
  }, [testimonials.length])

  useEffect(() => {
    startAutoSlide()
    return () => clearInterval(intervalRef.current)
  }, [startAutoSlide])

  const goTo = (index: number) => {
    setCurrent(index)
    clearInterval(intervalRef.current)
    startAutoSlide()
  }

  const next = () => goTo((current + 1) % testimonials.length)
  const prev = () => goTo((current - 1 + testimonials.length) % testimonials.length)

  if (loading) {
    return (
      <section className="py-24 px-4 bg-gradient-to-b from-background to-brand-50/50">
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </section>
    )
  }

  return (
    <section className="py-24 px-4 bg-gradient-to-b from-background to-brand-50/50" id="testimonials">
      <div ref={sectionRef} className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 rounded-full bg-brand-100 text-brand-700 text-sm font-medium mb-4">
            Testimonials
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            What Our{' '}
            <span className="text-gradient">Patients Say</span>
          </h2>
        </motion.div>

        <div className="relative max-w-3xl mx-auto">
          <div className="overflow-hidden rounded-2xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
                className="bg-card border rounded-2xl p-8 md:p-12 text-center"
              >
                <Quote className="w-10 h-10 text-brand-200 mx-auto mb-6" />
                <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-8 italic">
                  &ldquo;{testimonials[current].content}&rdquo;
                </p>
                <div className="flex items-center justify-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold text-lg">
                    {testimonials[current].name.charAt(0)}
                  </div>
                  <div className="text-left">
                    <h4 className="font-semibold">{testimonials[current].name}</h4>
                    {testimonials[current].role && (
                      <p className="text-sm text-muted-foreground">{testimonials[current].role}</p>
                    )}
                  </div>
                </div>
                <div className="mt-4 flex justify-center">
                  <StarRating rating={testimonials[current].rating} />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {testimonials.length > 1 && (
            <div className="flex items-center justify-center gap-4 mt-8">
              <button
                onClick={prev}
                className="p-2 rounded-full border hover:bg-brand-50 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="flex gap-2">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goTo(i)}
                    className={cn(
                      'w-2.5 h-2.5 rounded-full transition-all duration-300',
                      i === current ? 'bg-brand-500 w-8' : 'bg-brand-200 hover:bg-brand-300'
                    )}
                  />
                ))}
              </div>
              <button
                onClick={next}
                className="p-2 rounded-full border hover:bg-brand-50 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
