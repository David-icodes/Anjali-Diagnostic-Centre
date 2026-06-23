"use client"

import { useState, useEffect, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { ChevronLeft, ChevronRight, Tag, Clock } from 'lucide-react'
import { cn, formatDate } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import api from '@/lib/api'

interface Offer {
  _id: string
  title: string
  description: string
  discountPercentage: number
  couponCode?: string
  validUntil: string
  image?: string
}

export default function OffersSection() {
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const sectionRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(sectionRef, { once: true })

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const { data } = await api.get('/offers', { params: { isActive: true } })
        setOffers(Array.isArray(data) ? data : data?.offers || data?.data || [])
      } catch {
        setOffers([])
      } finally {
        setLoading(false)
      }
    }
    fetchOffers()
  }, [])

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % Math.max(offers.length, 1))
  }

  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 + Math.max(offers.length, 1)) % Math.max(offers.length, 1))
  }

  useEffect(() => {
    if (offers.length <= 1) return
    const timer = setInterval(next, 5000)
    return () => clearInterval(timer)
  }, [offers.length])

  return (
    <section className="py-24 px-4 relative overflow-hidden" id="offers">
      <div className="absolute inset-0 bg-gradient-to-b from-brand-50/30 to-background pointer-events-none" />

      <div ref={sectionRef} className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 rounded-full bg-amber-100 text-amber-700 text-sm font-medium mb-4">
            Special Offers
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Exclusive{' '}
            <span className="text-gradient">Discounts</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Save big on your health checkups with our limited-time offers
          </p>
        </motion.div>

        {loading ? (
          <div className="max-w-4xl mx-auto">
            <Skeleton className="h-64 rounded-2xl" />
          </div>
        ) : offers.length === 0 ? null : (
          <div className="relative max-w-4xl mx-auto">
            <div className="overflow-hidden rounded-2xl">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
              >
                <div className="relative bg-gradient-to-br from-brand-600 to-brand-800 rounded-2xl overflow-hidden">
                  {offers[currentIndex]?.image && (
                    <div className="absolute inset-0">
                      <img
                        src={offers[currentIndex].image}
                        alt=""
                        className="w-full h-full object-cover opacity-20"
                      />
                    </div>
                  )}
                  <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row items-center gap-8">
                    <div className="flex-1 text-white">
                      <div className="flex items-center gap-3 mb-4">
                        <Badge variant="warning" className="text-base px-4 py-1">
                          <Tag className="w-4 h-4 mr-1" />
                          {offers[currentIndex].discountPercentage}% OFF
                        </Badge>
                      </div>
                      <h3 className="text-2xl md:text-3xl font-bold mb-3">
                        {offers[currentIndex].title}
                      </h3>
                      <p className="text-white/80 mb-4 max-w-lg">
                        {offers[currentIndex].description}
                      </p>
                      {offers[currentIndex].validUntil && (
                        <div className="flex items-center gap-2 text-white/60 text-sm">
                          <Clock className="w-4 h-4" />
                          Valid till: {formatDate(offers[currentIndex].validUntil)}
                        </div>
                      )}
                      {offers[currentIndex].couponCode && (
                        <div className="mt-4 inline-block px-4 py-2 rounded-lg bg-white/10 backdrop-blur border border-white/20">
                          <span className="text-sm font-mono">Code: </span>
                          <span className="font-bold tracking-wider">
                            {offers[currentIndex].couponCode}
                          </span>
                        </div>
                      )}
                    </div>
                    <Button
                      variant="secondary"
                      size="lg"
                      className="shrink-0 whitespace-nowrap"
                    >
                      Claim Offer
                    </Button>
                  </div>
                </div>
              </motion.div>
            </div>

            {offers.length > 1 && (
              <div className="flex items-center justify-center gap-4 mt-6">
                <button
                  onClick={prev}
                  className="p-2 rounded-full border hover:bg-brand-50 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex gap-2">
                  {offers.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentIndex(i)}
                      className={cn(
                        'w-2.5 h-2.5 rounded-full transition-all duration-300',
                        i === currentIndex
                          ? 'bg-brand-500 w-8'
                          : 'bg-brand-200 hover:bg-brand-300'
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
        )}
      </div>
    </section>
  )
}
