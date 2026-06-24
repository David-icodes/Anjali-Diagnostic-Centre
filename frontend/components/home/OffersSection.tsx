"use client"

import { useState, useEffect, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Tag, Clock } from 'lucide-react'
import { formatDate } from '@/lib/utils'
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
  const sectionRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(sectionRef, { once: true })

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const { data } = await api.get('/offers', { params: { isActive: true, showOnHomePage: true } })
        setOffers(Array.isArray(data) ? data : data?.offers || data?.data || [])
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
    <section className="relative overflow-hidden px-4 py-20" id="offers">
      <div className="absolute inset-0 bg-gradient-to-b from-brand-50/30 to-background pointer-events-none" />

      <div ref={sectionRef} className="relative z-10 mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <span className="mb-4 inline-block rounded-full bg-amber-100 px-4 py-2 text-sm font-medium text-amber-700">
            Special Offers
          </span>
          <h2 className="mb-4 text-4xl font-bold md:text-5xl">
            Exclusive <span className="text-gradient">Discounts</span>
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Save on health checkups with active Anjali Diagnostics offers shown directly from the admin panel.
          </p>
        </motion.div>

        {loading ? (
          <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((item) => <Skeleton key={item} className="h-80 rounded-3xl" />)}
          </div>
        ) : (
          <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2 xl:grid-cols-3">
            {offers.map((offer, index) => (
              <motion.div
                key={offer._id}
                initial={{ opacity: 0, y: 24 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.45, delay: index * 0.06 }}
                className="overflow-hidden rounded-[2rem] border border-white/70 bg-white shadow-[0_22px_48px_rgba(15,118,110,0.09)]"
              >
                <div className="relative h-52 overflow-hidden bg-gradient-to-br from-brand-50 to-emerald-50">
                  {offer.image ? (
                    <img src={offer.image} alt={offer.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-brand-300">
                      <Tag className="h-14 w-14" />
                    </div>
                  )}
                  <div className="absolute left-4 top-4">
                    <Badge variant="warning" className="px-3 py-1 text-sm">
                      {offer.discountPercentage}% OFF
                    </Badge>
                  </div>
                </div>
                <div className="space-y-4 p-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{offer.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-gray-600">{offer.description}</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="h-4 w-4 text-brand-500" />
                    Valid till {formatDate(offer.validUntil)}
                  </div>
                  {offer.couponCode ? (
                    <div className="rounded-2xl border border-brand-100 bg-brand-50/70 px-4 py-3 text-sm text-brand-700">
                      Coupon Code: <span className="font-semibold tracking-wide">{offer.couponCode}</span>
                    </div>
                  ) : null}
                  <Button className="w-full rounded-full bg-gradient-to-r from-brand-600 to-emerald-500 text-white shadow-sm hover:from-brand-700 hover:to-emerald-600">
                    Claim Offer
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
