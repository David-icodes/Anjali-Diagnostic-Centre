"use client"

import { useState, useEffect, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Search, ArrowRight } from 'lucide-react'
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
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' })
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.12 },
    },
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] },
    },
  }

  return (
    <section className="bg-white px-4 py-16 sm:px-6 lg:px-8" id="popular-tests">
      <div ref={sectionRef} className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="mb-10 flex flex-col gap-3 text-center sm:mb-12"
        >
          <span className="mx-auto inline-flex rounded-full bg-brand-100 px-4 py-2 text-sm font-medium text-brand-700">
            Popular Tests
          </span>
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">Most Booked Tests</h2>
          <p className="mx-auto max-w-2xl text-sm leading-relaxed text-gray-600 sm:text-base">
            Popular diagnostics selected by patients, displayed automatically when the admin enables the Popular toggle.
          </p>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
                <Skeleton className="h-48 rounded-none" />
                <div className="space-y-3 p-5">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-10 w-full rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-dashed border-gray-200 bg-gray-50 px-6 py-12 text-center">
            <Search className="mx-auto mb-4 h-10 w-10 text-gray-400" />
            <p className="text-sm text-gray-600 sm:text-base">{error}</p>
          </div>
        ) : tests.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-gray-200 bg-gray-50 px-6 py-12 text-center">
            <p className="text-sm text-gray-600 sm:text-base">
              No popular tests are enabled right now. Turn on the Popular option in Test Management to show them here.
            </p>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
          >
            {tests.map((test) => {
              const displayOfferPrice = test.offerPrice ?? test.originalPrice
              const hasDiscount = displayOfferPrice < test.originalPrice

              return (
                <motion.div
                  key={test._id}
                  variants={cardVariants}
                  className="overflow-hidden rounded-[1.75rem] border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-500/10"
                >
                  <div className="relative h-48 overflow-hidden bg-gradient-to-br from-brand-100 to-brand-50">
                    {test.image ? (
                      <img
                        src={test.image}
                        alt={test.name}
                        className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Search className="h-10 w-10 text-brand-300" />
                      </div>
                    )}
                    <div className="absolute left-4 top-4">
                      <Badge variant="info">{test.category}</Badge>
                    </div>
                  </div>

                  <div className="space-y-4 p-5">
                    <div className="space-y-2">
                      <h3 className="line-clamp-1 text-lg font-semibold text-gray-900">{test.name}</h3>
                      <p className="line-clamp-2 text-sm leading-relaxed text-gray-600">
                        {test.description || 'Reliable diagnostic testing with patient-friendly service and timely reporting.'}
                      </p>
                    </div>

                    <div className="flex items-end gap-3">
                      <span className="text-2xl font-bold text-brand-600">{formatPrice(displayOfferPrice)}</span>
                      {hasDiscount ? (
                        <span className="pb-1 text-sm text-gray-400 line-through">{formatPrice(test.originalPrice)}</span>
                      ) : null}
                    </div>

                    <Button
                      variant="gradient"
                      className="w-full"
                      onClick={() => router.push(`/booking?test=${test._id}`)}
                    >
                      Book Now
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </div>
    </section>
  )
}
