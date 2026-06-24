"use client"

import { useState, useEffect, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { ArrowRight, BadgePercent, Search, Sparkles } from 'lucide-react'
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
  image?: string
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
    <section className="bg-[#F8FAFC] px-4 py-10 sm:px-6 sm:py-[60px] lg:px-8 lg:py-20" id="offers">
      <div ref={sectionRef} className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.45 }}
          className="mb-8 text-center sm:mb-10"
        >
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#FDE7B0] bg-[#FFF7E6] px-3 py-1.5 text-sm font-medium text-[#B45309]">
            <Sparkles className="h-4 w-4" />
            Special Offers
          </div>
          <h2 className="text-xl font-bold text-gray-900 sm:text-2xl lg:text-3xl">Diagnostic Savings</h2>
          <p className="mt-2 text-base text-[#0F766E]">Book Today & Save More</p>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((item) => <Skeleton key={item} className="h-[360px] rounded-2xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {offers.map((offer, index) => {
              const savings = Math.max(offer.originalPrice - offer.offerPrice, 0)
              const percentage = offer.originalPrice > 0 ? Math.round((savings / offer.originalPrice) * 100) : 0
              const badgeText = offer.offerBadge || `${percentage}% OFF`

              return (
                <motion.div
                  key={offer._id}
                  initial={{ opacity: 0, y: 18 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.35, delay: index * 0.05 }}
                  className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="relative h-40 overflow-hidden bg-gradient-to-br from-[#E6FFFB] to-[#F8FAFC]">
                    {offer.image ? (
                      <img src={offer.image} alt={offer.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[#0F766E]">
                        <Search className="h-12 w-12 opacity-80" />
                      </div>
                    )}
                    <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                      <Badge variant="warning" className="rounded-full px-2.5 py-1 text-xs font-semibold">{badgeText}</Badge>
                      <Badge variant="info" className="rounded-full px-2.5 py-1 text-xs">{offer.category}</Badge>
                    </div>
                  </div>

                  <div className="space-y-4 p-4 sm:p-5">
                    <div className="space-y-2">
                      <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#F59E0B]">
                        <BadgePercent className="h-3.5 w-3.5" />
                        {offer.offerLabel || 'Limited Offer'}
                      </p>
                      <h3 className="line-clamp-2 text-xl font-semibold text-gray-900">{offer.name}</h3>
                      <p className="line-clamp-2 text-sm leading-6 text-gray-600">
                        {offer.description || 'Save more on essential diagnostics with accurate testing and patient-friendly support.'}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-emerald-100 bg-[#F0FDFA] p-4">
                      <div className="flex items-end gap-3">
                        <span className="text-sm text-gray-400 line-through">{formatPrice(offer.originalPrice)}</span>
                        <span className="text-2xl font-bold text-[#0F766E]">{formatPrice(offer.offerPrice)}</span>
                      </div>
                      <p className="mt-2 text-sm font-medium text-[#0F766E]">Savings {formatPrice(savings)}</p>
                    </div>

                    <Button
                      className="h-11 w-full rounded-full bg-[#14B8A6] text-white shadow-sm transition-all hover:bg-[#0F766E]"
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
