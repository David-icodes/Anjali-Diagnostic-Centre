'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Sparkles, Search, X } from 'lucide-react'
import Footer from '@/components/layout/Footer'
import PageTransition from '@/components/layout/PageTransition'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils'
import api from '@/lib/api'

export default function RadiologyPage() {
  const [services, setServices] = useState<any[]>([])
  const [filteredServices, setFilteredServices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    api.get('/radiology', { params: { isActive: true, limit: 200 } })
      .then((res) => {
        const data = res.data?.services || res.data || []
        const normalized = Array.isArray(data) ? data : []
        setServices(normalized)
        setFilteredServices(normalized)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const q = search.trim().toLowerCase()
    setFilteredServices(services.filter((service) => !q || service.name?.toLowerCase().includes(q)))
  }, [search, services])

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
                <p className="mt-4 max-w-2xl text-base text-white/80 sm:text-lg">Search and book radiology services, then combine them with lab tests from the booking page if needed.</p>
              </div>
            </div>
          </section>

          <section className="py-10 sm:py-12 lg:py-14">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-8 max-w-2xl">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search radiology services..." className="h-14 w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-12 text-base text-slate-900 shadow-sm outline-none transition focus:border-[#14B8A6] focus:ring-2 focus:ring-[#14B8A6]/15" />
                  {search ? <button type="button" onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-400 transition hover:bg-slate-100 hover:text-slate-700"><X className="h-4 w-4" /></button> : null}
                </div>
              </div>

              {loading ? (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{Array.from({ length: 8 }).map((_, index) => <div key={index} className="h-44 animate-pulse rounded-[20px] border border-slate-200 bg-white" />)}</div>
              ) : filteredServices.length === 0 ? (
                <div className="rounded-[24px] border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm"><p className="text-lg text-slate-500">No radiology services available at the moment.</p></div>
              ) : (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {filteredServices.map((service, index) => (
                    <motion.article key={service._id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.15, delay: (index % 12) * 0.02 }} className="flex min-h-[180px] flex-col justify-between rounded-[20px] border border-slate-200 bg-white p-6 shadow-[0_12px_28px_rgba(15,23,42,0.05)] transition duration-150 hover:-translate-y-0.5 hover:shadow-[0_16px_30px_rgba(15,118,110,0.10)]">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <h3 className="text-xl font-bold uppercase leading-snug text-slate-900">{service.name}</h3>
                        </div>
                        {/* Removed popularity/offer badges per design: show only name, price, BOOK */}
                      </div>
                      <div className="mt-6 flex items-end justify-between gap-4">
                        <p className="text-3xl font-bold text-[#3730A3]">{formatPrice(service.price || 0)}</p>
                        <Link href={`/booking?radiology=${service._id}`}><Button className="h-10 rounded-xl border border-[#14B8A6] bg-white px-4 text-sm font-bold text-[#14B8A6] shadow-none transition hover:bg-[#14B8A6] hover:text-white">BOOK</Button></Link>
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
