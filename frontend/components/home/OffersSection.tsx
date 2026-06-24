"use client"

import { useState, useEffect, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { ArrowRight, BadgePercent, Sparkles } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import api from '@/lib/api'

interface OfferTest {
  _id: string
  name: string
  category: string
  description?: string
  originalPrice: number
  offerPrice: number
  offerLabel?: string
  offerBadge?: string
}

export default function OffersSection() {
  const [offers, setOffers] = useState<OfferTest[]>([])
  const [loading, setLoading] = useState(true)
  const sectionRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(sectionRef, { once: true, margin: '-80px' })
  const router = useRouter()

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const { data } = await api.get('/tests', {
          params: { hasOffer: true, isActive: true, limit: 6 },
        })
        setOffers(data?.tests || [])
      } catch {
        setOffers([])
      } finally {
        setLoading(false)
      }
    }

    fetchOffers()
  }, [])

  if (!loading && offers.length === 0) {
    return null
  }

  return (
    <section className="bg-[#F8FAFC] px-4 py-[30px] sm:px-6 sm:py-10 lg:px-8 lg:py-[60px]" id="offers">
      <div ref={sectionRef} className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.2 }}
          className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#FDE7B0] bg-[#FFF7E6] px-3 py-1.5 text-sm font-medium text-[#B45309]">
              <Sparkles className="h-4 w-4" />
              Special Offers
            </div>
            <h2 className="text-xl font-bold text-gray-900 sm:text-2xl lg:text-3xl">Diagnostic Savings</h2>
            <p className="mt-2 text-base text-[#0F766E]">Book Today & Save More</p>
          </div>

          <button
            type="button"
            onClick={() => router.push('/tests')}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#0F766E] transition-colors duration-150 hover:text-[#14B8A6]"
          >
            View All
            <ArrowRight className="h-4 w-4" />
          </button>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((item) => <Skeleton key={item} className="h-[290px] rounded-2xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {offers.map((offer, index) => {
              const savings = Math.max(offer.originalPrice - offer.offerPrice, 0)
              const percentage = offer.originalPrice > 0 ? Math.round((savings / offer.originalPrice) * 100) : 0
              const badgeText = offer.offerBadge || `${percentage}% OFF`

              return (
                <motion.div
                  key={offer._id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.2, delay: index * 0.04 }}
                  className="group flex h-[290px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-150 hover:-translate-y-[3px] hover:shadow-lg"
                >
                  <div className="flex h-full flex-col p-5">
                    <div className="mb-3 flex items-start justify-between gap-2">
                      <Badge variant="info" className="rounded-full px-2.5 py-1 text-xs">
                        {offer.category}
                      </Badge>
                      <Badge variant="warning" className="shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold">
                        {badgeText}
                      </Badge>
                    </div>

                    <h3 className="mb-1 line-clamp-2 text-lg font-semibold text-gray-900">
                      {offer.name}
                    </h3>

                    <p className="mb-3 line-clamp-2 text-sm leading-5 text-gray-500">
                      {offer.description || 'Save more on essential diagnostics with accurate testing and patient-friendly support.'}
                    </p>

                    <div className="flex-1" />

                    <div className="mb-3 flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-[#0F766E]">
                        {formatPrice(offer.offerPrice)}
                      </span>
                      <span className="text-sm text-gray-400 line-through">
                        {formatPrice(offer.originalPrice)}
                      </span>
                      <span className="ml-auto rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-600">
                        Save {formatPrice(savings)}
                      </span>
                    </div>

                    <Button
                      className="h-10 w-full rounded-full bg-[#14B8A6] text-white shadow-sm transition-all duration-150 hover:bg-[#0F766E]"
                      onClick={() => router.push(`/booking?test=${offer._id}`)}
                    >
                      Book Now
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
