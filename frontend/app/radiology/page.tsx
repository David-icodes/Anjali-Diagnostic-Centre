'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import Footer from '@/components/layout/Footer'
import PageTransition from '@/components/layout/PageTransition'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils'
import api from '@/lib/api'

export default function RadiologyPage() {
  const [services, setServices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/radiology', { params: { isActive: true } })
      .then((res) => {
        const data = res.data?.services || res.data || []
        setServices(Array.isArray(data) ? data : [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      <main className="min-h-screen bg-[#F8FAFC]">
        <PageTransition>
          <section className="relative flex min-h-[28vh] items-center overflow-hidden bg-gradient-to-br from-[#0F766E] via-[#14B8A6] to-[#2DD4BF]">
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.04]" />
            <div className="relative mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
              <div className="max-w-3xl">
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white/90 backdrop-blur-sm">
                  <Sparkles className="h-4 w-4" /> Radiology Services
                </div>
                <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl">Simple, clearly priced radiology services</h1>
                <p className="mt-4 max-w-2xl text-base text-white/80 sm:text-lg">The same clean layout as laboratory services: name, price, and book now.</p>
              </div>
            </div>
          </section>

          <section className="py-10 sm:py-12 lg:py-14">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              {loading ? (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {Array.from({ length: 8 }).map((_, index) => (
                    <div key={index} className="h-44 animate-pulse rounded-[20px] border border-slate-200 bg-white" />
                  ))}
                </div>
              ) : services.length === 0 ? (
                <div className="rounded-[24px] border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
                  <p className="text-lg text-slate-500">No radiology services available at the moment.</p>
                </div>
              ) : (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {services.map((service, index) => (
                    <motion.article
                      key={service._id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.15, delay: (index % 12) * 0.02 }}
                      className="flex min-h-[180px] flex-col justify-between rounded-[20px] border border-slate-200 bg-white p-6 shadow-[0_12px_28px_rgba(15,23,42,0.05)] transition duration-150 hover:-translate-y-0.5 hover:shadow-[0_16px_30px_rgba(15,118,110,0.10)]"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <h3 className="text-xl font-bold uppercase leading-snug text-slate-900">{service.name}</h3>
                        <div className="flex shrink-0 gap-1.5">
                          {service.isPopular ? <span className="rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-semibold text-teal-700">POPULAR</span> : null}
                          {service.hasOffer ? <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700">OFFER</span> : null}
                        </div>
                      </div>
                      <div className="mt-6 flex items-end justify-between gap-4">
                        <p className="text-3xl font-bold text-[#3730A3]">{formatPrice(service.price || 0)}</p>
                        <Link href={`/booking?radiology=${service._id}`}>
                          <Button className="h-10 rounded-xl border border-[#14B8A6] bg-white px-4 text-sm font-bold text-[#14B8A6] shadow-none transition hover:bg-[#14B8A6] hover:text-white">
                            BOOK
                          </Button>
                        </Link>
                      </div>
                    </motion.article>
                  ))}
                </div>
              )}
            </div>
          </section>
        </PageTransition>
      </main>
      <Footer />
    </>
  )
}
