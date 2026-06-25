"use client"

import { useState, useEffect, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { ArrowRight, Sparkles, BadgePercent } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import api from '@/lib/api'

interface OfferTest {
  _id: string
  name: string
  originalPrice: number
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
            {[1, 2, 3].map((item) => <Skeleton key={item} className="h-[240px] rounded-2xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {offers.map((offer, index) => {
              return (
                <motion.article
                  key={offer._id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.2, delay: index * 0.04 }}
                  className="group flex h-[240px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-150 hover:-translate-y-[3px] hover:shadow-lg"
                >
                  <div className="mb-3 flex justify-end">
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                      <BadgePercent className="h-3.5 w-3.5" /> OFFER
                    </span>
                  </div>

                  <h3 className="line-clamp-2 text-lg font-semibold text-gray-900">{offer.name}</h3>

                  <div className="mt-auto pt-6">
                    <div className="mb-4 flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-[#0F766E]">{formatPrice(offer.originalPrice)}</span>
                    </div>

                    <Button
                      className="h-10 w-full rounded-full bg-[#14B8A6] text-white shadow-sm transition-all duration-150 hover:bg-[#0F766E]"
                      onClick={() => router.push(`/booking?test=${offer._id}`)}
                    >
                      Book Now
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </motion.article>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
