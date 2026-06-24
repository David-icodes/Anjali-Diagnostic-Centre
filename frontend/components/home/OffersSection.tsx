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
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' })
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
    <section className="relative overflow-hidden bg-[linear-gradient(180deg,#F8FBFC_0%,#FFFFFF_100%)] px-4 py-20 sm:px-6 lg:px-8" id="offers">
      <div ref={sectionRef} className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="mb-10 flex flex-col gap-3 text-center sm:mb-12"
        >
          <span className="mx-auto inline-flex rounded-full bg-amber-100 px-4 py-2 text-sm font-medium text-amber-700">
            Special Offers
          </span>
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">Diagnostic Savings You Can Book Today</h2>
          <p className="mx-auto max-w-2xl text-sm leading-relaxed text-gray-600 sm:text-base">
            Tests with enabled offers automatically appear here with discounted pricing and savings details.
          </p>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((item) => <Skeleton key={item} className="h-96 rounded-[2rem]" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {offers.map((offer, index) => {
              const savings = Math.max(offer.originalPrice - offer.offerPrice, 0)
              const badgeText = offer.offerBadge || offer.offerLabel || `${Math.round((savings / offer.originalPrice) * 100)}% OFF`

              return (
                <motion.div
                  key={offer._id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.45, delay: index * 0.06 }}
                  className="group overflow-hidden rounded-[2rem] border border-white/80 bg-white shadow-[0_22px_48px_rgba(15,118,110,0.09)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_28px_60px_rgba(15,118,110,0.12)]"
                >
                  <div className="relative h-56 overflow-hidden bg-gradient-to-br from-brand-100 to-emerald-50">
                    {offer.image ? (
                      <img src={offer.image} alt={offer.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-brand-300">
                        <Search className="h-16 w-16" />
                      </div>
                    )}
                    <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                      <Badge variant="warning" className="px-3 py-1 text-xs font-semibold">{badgeText}</Badge>
                      <Badge variant="info">{offer.category}</Badge>
                    </div>
                  </div>

                  <div className="space-y-4 p-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-amber-600">
                        <Sparkles className="h-4 w-4" />
                        <span className="text-xs font-semibold uppercase tracking-[0.18em]">{offer.offerLabel || 'Limited offer'}</span>
                      </div>
                      <h3 className="line-clamp-2 min-h-[3.5rem] text-xl font-semibold text-gray-900">{offer.name}</h3>
                      <p className="line-clamp-2 min-h-[2.75rem] text-sm leading-relaxed text-gray-600">
                        {offer.description || 'Save more on essential diagnostics with accurate testing and patient-friendly support.'}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
                      <div className="flex items-end gap-3">
                        <span className="text-sm text-gray-400 line-through">{formatPrice(offer.originalPrice)}</span>
                        <span className="text-3xl font-bold text-emerald-700">{formatPrice(offer.offerPrice)}</span>
                      </div>
                      <div className="mt-2 flex items-center gap-2 text-sm font-medium text-emerald-700">
                        <BadgePercent className="h-4 w-4" />
                        Save {formatPrice(savings)}
                      </div>
                    </div>

                    <Button
                      className="w-full rounded-full bg-gradient-to-r from-brand-600 to-emerald-500 text-white shadow-sm hover:from-brand-700 hover:to-emerald-600"
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

