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
    <section className="bg-white px-4 py-[30px] sm:px-6 sm:py-10 lg:px-8 lg:py-[60px]" id="popular-tests">
      <div ref={sectionRef} className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.2 }}
          className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#CFFAFE] bg-[#F0FDFA] px-3 py-1.5 text-sm font-medium text-[#0F766E]">
              <Sparkles className="h-4 w-4" />
              Most Popular
            </div>
            <h2 className="text-xl font-bold text-gray-900 sm:text-2xl lg:text-3xl">Popular Tests</h2>
            <p className="mt-2 text-base text-gray-600">Most Booked Tests</p>
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
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                <Skeleton className="h-[290px] rounded-none" />
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
                  <div className="flex h-full flex-col p-5">
                    <div className="mb-3">
                      <Badge variant="info" className="rounded-full px-2.5 py-1 text-xs">
                        {test.category}
                      </Badge>
                    </div>

                    <h3 className="mb-1 line-clamp-2 text-lg font-semibold text-gray-900">
                      {test.name}
                    </h3>

                    <p className="mb-3 line-clamp-2 text-sm leading-5 text-gray-500">
                      {test.description || 'Reliable diagnostic testing with patient-friendly service and timely reporting.'}
                    </p>

                    <div className="flex-1" />

                    <div className="mb-3 flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-[#0F766E]">
                        {formatPrice(displayOfferPrice)}
                      </span>
                      {hasDiscount && (
                        <span className="text-sm text-gray-400 line-through">
                          {formatPrice(test.originalPrice)}
                        </span>
                      )}
                    </div>

                    <Button
                      className="h-10 w-full rounded-full bg-[#14B8A6] text-white shadow-sm transition-all duration-150 hover:bg-[#0F766E]"
                      onClick={() => router.push(`/booking?test=${test._id}`)}
                    >
                      Book Test
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
