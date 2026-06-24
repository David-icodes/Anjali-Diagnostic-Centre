"use client"

import { useState, useEffect, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Search, ArrowRight, Sparkles } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import api from '@/lib/api'

interface Test {
  _id: string
  name: string
  category: string
  description?: string
  originalPrice: number
  offerPrice?: number
  image?: string
  isPopular: boolean
}

export default function PopularTests() {
  const [tests, setTests] = useState<Test[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const sectionRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(sectionRef, { once: true, margin: '-80px' })
  const router = useRouter()

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const { data } = await api.get('/tests', {
          params: { popular: true, isActive: true, limit: 8 },
        })
        setTests(data?.tests || [])
      } catch {
        setError('Failed to load popular tests')
      } finally {
        setLoading(false)
      }
    }

    fetchTests()
  }, [])

  return (
    <section className="bg-white px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16" id="popular-tests">
      <div ref={sectionRef} className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.25 }}
          className="mb-6 text-center sm:mb-8"
        >
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#CFFAFE] bg-[#F0FDFA] px-3 py-1.5 text-sm font-medium text-[#0F766E]">
            <Sparkles className="h-4 w-4" />
            Most Popular
          </div>
          <h2 className="text-xl font-bold text-gray-900 sm:text-2xl lg:text-3xl">Popular Tests</h2>
          <p className="mt-2 text-base text-gray-600">Frequently booked diagnostic services</p>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                <Skeleton className="h-[280px] rounded-none" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-6 py-12 text-center">
            <Search className="mx-auto mb-4 h-10 w-10 text-gray-400" />
            <p className="text-sm text-gray-600 sm:text-base">{error}</p>
          </div>
        ) : tests.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-6 py-12 text-center">
            <p className="text-sm text-gray-600 sm:text-base">
              No popular tests are enabled right now. Turn on the Popular option in Test Management to show them here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {tests.map((test, index) => {
              const displayOfferPrice = test.offerPrice ?? test.originalPrice
              const hasDiscount = displayOfferPrice < test.originalPrice

              return (
                <motion.div
                  key={test._id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.2, delay: index * 0.04 }}
                  className="group flex h-[280px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-150 hover:-translate-y-[3px] hover:shadow-lg"
                >
                  <div className="p-3 pb-0">
                    <Badge variant="info" className="rounded-full px-2.5 py-1 text-xs">{test.category}</Badge>
                  </div>

                  <div className="relative h-[130px] overflow-hidden bg-gradient-to-br from-[#F0FDFA] to-[#F8FAFC] px-4 py-2">
                    <div className="flex h-full items-center justify-center">
                      {test.image ? (
                        <img
                          src={test.image}
                          alt={test.name}
                          className="h-full max-h-[90px] w-full object-contain"
                        />
                      ) : (
                        <Search className="h-10 w-10 text-[#0F766E] opacity-70" />
                      )}
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col justify-between p-4 pt-3">
                    <div className="space-y-2">
                      <h3 className="line-clamp-2 text-lg font-semibold text-gray-900">{test.name}</h3>
                      <p className="line-clamp-2 text-sm leading-5 text-gray-600">
                        {test.description || 'Reliable diagnostic testing with patient-friendly service and timely reporting.'}
                      </p>
                    </div>

                    <div className="space-y-3 pt-3">
                      <div className="flex items-end gap-2">
                        {hasDiscount ? (
                          <span className="text-xs text-gray-400 line-through">{formatPrice(test.originalPrice)}</span>
                        ) : null}
                        <span className="text-2xl font-bold text-[#0F766E]">{formatPrice(displayOfferPrice)}</span>
                      </div>

                      <Button
                        variant="gradient"
                        className="h-10 w-full rounded-full bg-[#14B8A6] text-white shadow-sm transition-all duration-150 hover:bg-[#0F766E]"
                        onClick={() => router.push(`/booking?test=${test._id}`)}
                      >
                        Book Test
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
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
