"use client"

import { useState, useEffect, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Search, ArrowRight } from 'lucide-react'
import { cn, API_URL, formatPrice } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import api from '@/lib/api'

interface Test {
  _id: string
  name: string
  category: string
  description: string
  originalPrice: number
  offerPrice: number
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
        const { data } = await api.get('/tests/popular')
        setTests(data?.tests || data?.data || [])
      } catch {
        setError('Failed to load tests')
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
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
    },
  }

  return (
    <section className="py-24 px-4 bg-gradient-to-b from-background to-brand-50/30" id="popular-tests">
      <div ref={sectionRef} className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 rounded-full bg-brand-100 text-brand-700 text-sm font-medium mb-4">
            Popular Tests
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Most{' '}
            <span className="text-gradient">Booked Tests</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            High-quality diagnostics at affordable prices, trusted by thousands
          </p>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-2xl border overflow-hidden">
                <Skeleton className="h-48 rounded-none" />
                <div className="p-5 space-y-3">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-4 w-24" />
                  <div className="flex gap-3">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <Skeleton className="h-10 w-full rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <Search className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-lg text-muted-foreground">{error}</p>
            <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {tests.map((test) => (
              <motion.div
                key={test._id}
                variants={cardVariants}
                className="group relative rounded-2xl border bg-card overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-brand-500/10 transition-all duration-500 cursor-pointer"
                onClick={() => router.push(`/tests/${test._id}`)}
              >
                <div className="relative h-48 overflow-hidden bg-gradient-to-br from-brand-100 to-brand-50">
                  {test.image ? (
                    <img
                      src={test.image}
                      alt={test.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Search className="w-12 h-12 text-brand-300" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                  <div className="absolute top-3 left-3">
                    <Badge variant="info">{test.category}</Badge>
                  </div>
                  {test.offerPrice < test.originalPrice && (
                    <div className="absolute top-3 right-3">
                      <Badge variant="success">
                        {Math.round(((test.originalPrice - test.offerPrice) / test.originalPrice) * 100)}% OFF
                      </Badge>
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="text-base font-semibold mb-2 line-clamp-1 group-hover:text-brand-600 transition-colors">
                    {test.name}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {test.description}
                  </p>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl font-bold text-brand-600">
                      {formatPrice(test.offerPrice)}
                    </span>
                    {test.originalPrice > test.offerPrice && (
                      <span className="text-sm text-muted-foreground line-through">
                        {formatPrice(test.originalPrice)}
                      </span>
                    )}
                  </div>
                  <Button
                    variant="gradient"
                    className="w-full group"
                    onClick={(e) => {
                      e.stopPropagation()
                      router.push(`/booking?test=${test._id}`)
                    }}
                  >
                    Book Now
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
                <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-brand-500/0 group-hover:ring-brand-500/30 transition-all duration-500 pointer-events-none" />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  )
}
