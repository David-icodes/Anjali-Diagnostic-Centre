'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Microscope, ArrowRight, Sparkles, BadgePercent } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils'
import api from '@/lib/api'

export default function LaboratoryServices() {
  const [tests, setTests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/tests', { params: { limit: 12 } })
      .then((response) => {
        const data = response.data?.tests || response.data || []
        setTests(Array.isArray(data) ? data : [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <section className="bg-[#F8FAFC] px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-14">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
        >
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#D6F5EF] bg-white px-4 py-2 text-sm font-medium text-[#0F766E] shadow-sm">
              <Microscope className="h-4 w-4" /> Laboratory Services
            </div>
            <h2 className="mt-4 text-3xl font-bold text-slate-900 sm:text-4xl">Popular diagnostic tests</h2>
            <p className="mt-2 text-base text-slate-600">Clean, transparent pricing for commonly booked laboratory services.</p>
          </div>
          <Link href="/tests">
            <Button variant="outline" className="h-11 rounded-full border-[#14B8A6] px-5 text-[#0F766E] hover:bg-[#14B8A6]/5">
              View All Tests
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </motion.div>

        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="h-40 animate-pulse rounded-[20px] border border-slate-200 bg-white" />
            ))}
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {tests.map((test, index) => {
              const price = test.originalPrice || test.price

              return (
                <motion.article
                  key={test._id}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.15, delay: (index % 12) * 0.02 }}
                  className="flex min-h-[180px] flex-col justify-between rounded-[20px] border border-slate-200 bg-white p-6 shadow-[0_12px_28px_rgba(15,23,42,0.05)] transition duration-150 hover:-translate-y-0.5 hover:shadow-[0_16px_30px_rgba(15,118,110,0.10)]"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <h3 className="text-xl font-bold uppercase leading-snug text-slate-900">{test.name}</h3>
                    <div className="flex shrink-0 gap-1.5">
                      {test.isPopular ? <span className="rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-semibold text-teal-700">POPULAR</span> : null}
                      {test.hasOffer ? <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700">OFFER</span> : null}
                    </div>
                  </div>
                  <div className="mt-6 flex items-end justify-between gap-4">
                    <p className="text-3xl font-bold text-[#3730A3]">{formatPrice(price)}</p>
                    <Link href={`/booking?test=${test._id}`}>
                      <Button className="h-10 rounded-xl border border-[#14B8A6] bg-white px-4 text-sm font-bold text-[#14B8A6] shadow-none transition hover:bg-[#14B8A6] hover:text-white">
                        BOOK
                      </Button>
                    </Link>
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
