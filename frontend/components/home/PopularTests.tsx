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
    <section className="bg-white px-4 py-10 sm:px-6 sm:py-[60px] lg:px-8 lg:py-20" id="popular-tests">
      <div ref={sectionRef} className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.45 }}
          className="mb-8 text-center sm:mb-10"
        >
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#CFFAFE] bg-[#F0FDFA] px-3 py-1.5 text-sm font-medium text-[#0F766E]">
            <Sparkles className="h-4 w-4" />
            Most Popular
          </div>
          <h2 className="text-xl font-bold text-gray-900 sm:text-2xl lg:text-3xl">Popular Tests</h2>
          <p className="mt-2 text-base text-gray-600">Frequently booked diagnostic services</p>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                <Skeleton className="h-36 rounded-none" />
                <div className="space-y-3 p-4">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-10 w-full rounded-full" />
                </div>
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
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {tests.map((test, index) => {
              const displayOfferPrice = test.offerPrice ?? test.originalPrice
              const hasDiscount = displayOfferPrice < test.originalPrice

              return (
                <motion.div
                  key={test._id}
                  initial={{ opacity: 0, y: 18 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.35, delay: index * 0.05 }}
                  className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="p-4 pb-0">
                    <Badge variant="info" className="rounded-full px-2.5 py-1 text-xs">{test.category}</Badge>
                  </div>

                  <div className="relative h-36 overflow-hidden bg-gradient-to-br from-[#F0FDFA] to-[#F8FAFC]">
                    {test.image ? (
                      <img
                        src={test.image}
                        alt={test.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[#0F766E]">
                        <Search className="h-12 w-12 opacity-80" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-3 p-4 sm:p-5">
                    <div className="space-y-2">
                      <h3 className="line-clamp-2 text-lg font-semibold text-gray-900">{test.name}</h3>
                      <p className="line-clamp-2 text-sm leading-6 text-gray-600">
                        {test.description || 'Reliable diagnostic testing with patient-friendly service and timely reporting.'}
                      </p>
                    </div>

                    <div className="flex items-end gap-2">
                      {hasDiscount ? (
                        <span className="text-sm text-gray-400 line-through">{formatPrice(test.originalPrice)}</span>
                      ) : null}
                      <span className="text-2xl font-bold text-[#0F766E]">{formatPrice(displayOfferPrice)}</span>
                    </div>

                    <Button
                      variant="gradient"
                      className="h-11 w-full rounded-full bg-[#14B8A6] text-white shadow-sm hover:bg-[#0F766E]"
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
