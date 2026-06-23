'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, X, ChevronRight, ChevronLeft,
  Activity, Heart, Brain, Droplets, Stethoscope,
  Syringe, Sparkles, Filter, SlidersHorizontal,
} from 'lucide-react'
import { cn, formatPrice } from '@/lib/utils'
import api from '@/lib/api'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import PageTransition from '@/components/layout/PageTransition'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'

const testIcons = [Activity, Heart, Brain, Droplets, Stethoscope, Syringe]
const ITEMS_PER_PAGE = 12

interface Test {
  _id: string
  name: string
  category: string
  description: string
  originalPrice: number
  offerPrice?: number
  image?: string
  isPopular?: boolean
  preparationInstructions?: string
  testDuration?: string
}

export default function TestsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [tests, setTests] = useState<Test[]>([])
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState<string[]>([])
  const [totalPages, setTotalPages] = useState(1)

  const search = searchParams.get('search') || ''
  const category = searchParams.get('category') || ''
  const page = parseInt(searchParams.get('page') || '1', 10)

  const [searchInput, setSearchInput] = useState(search)

  const fetchTests = useCallback(async () => {
    setLoading(true)
    try {
      const params: Record<string, string | number> = { limit: ITEMS_PER_PAGE, page }
      if (search) params.search = search
      if (category) params.category = category

      const res = await api.get('/tests', { params })
      const data = res.data
      setTests(data?.tests || data?.data || [])
      setTotalPages(data?.totalPages || data?.pagination?.totalPages || 1)

      if (!category && !search) {
        const cats = data?.categories || []
        if (cats.length > 0) setCategories(cats)
      }
    } catch {
      setTests([])
    } finally {
      setLoading(false)
    }
  }, [search, category, page])

  useEffect(() => {
    fetchTests()
  }, [fetchTests])

  useEffect(() => {
    if (!category && !search) {
      api.get('/tests/categories').then((res) => {
        if (res.data?.categories) setCategories(res.data.categories)
      }).catch(() => {})
    }
  }, [category, search])

  const updateParams = (params: Record<string, string>) => {
    const sp = new URLSearchParams(searchParams.toString())
    Object.entries(params).forEach(([k, v]) => {
      if (v) sp.set(k, v)
      else sp.delete(k)
    })
    sp.set('page', '1')
    router.push(`/tests?${sp.toString()}`)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateParams({ search: searchInput })
  }

  const clearSearch = () => {
    setSearchInput('')
    updateParams({ search: '' })
  }

  const handleCategory = (cat: string) => {
    updateParams({ category: cat === category ? '' : cat })
  }

  const changePage = (newPage: number) => {
    const sp = new URLSearchParams(searchParams.toString())
    sp.set('page', String(newPage))
    router.push(`/tests?${sp.toString()}`)
  }

  return (
    <>
      <Header />
      <main className="min-h-screen pt-20">
        <PageTransition>
          <HeroBanner />
          <section className="py-12 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.form
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onSubmit={handleSearch}
                className="relative max-w-2xl mx-auto mb-8"
              >
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-brand-500 transition-colors" />
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Search for diagnostic tests..."
                    className="w-full pl-12 pr-12 py-4 rounded-2xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-brand-400 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all text-base"
                  />
                  {searchInput && (
                    <button
                      type="button"
                      onClick={clearSearch}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <X className="w-4 h-4 text-gray-400" />
                    </button>
                  )}
                </div>
              </motion.form>

              {categories.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="flex flex-wrap justify-center gap-2 mb-10"
                >
                  <button
                    onClick={() => updateParams({ category: '' })}
                    className={cn(
                      'px-4 py-2 rounded-full text-sm font-medium transition-all',
                      !category
                        ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    )}
                  >
                    All
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => handleCategory(cat)}
                      className={cn(
                        'px-4 py-2 rounded-full text-sm font-medium transition-all',
                        category === cat
                          ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      )}
                    >
                      {cat}
                    </button>
                  ))}
                </motion.div>
              )}

              {search && (
                <div className="text-center mb-6">
                  <p className="text-gray-500 text-sm">
                    Showing results for <span className="font-semibold text-brand-700">&ldquo;{search}&rdquo;</span>
                    {' '}
                    <button onClick={clearSearch} className="text-brand-600 hover:underline ml-1">
                      Clear
                    </button>
                  </p>
                </div>
              )}

              {loading ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="rounded-2xl border border-gray-100 p-6">
                      <Skeleton className="w-12 h-12 rounded-xl mb-4" />
                      <Skeleton className="h-5 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-full mb-1" />
                      <Skeleton className="h-4 w-2/3 mb-4" />
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-8 w-20" />
                        <Skeleton className="h-9 w-24 rounded-lg" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : tests.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-20"
                >
                  <div className="w-20 h-20 mx-auto rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                    <Search className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-brand-950 mb-2">No tests found</h3>
                  <p className="text-gray-500 mb-6">Try adjusting your search or filter criteria</p>
                  <Button variant="outline" onClick={clearSearch}>
                    Clear Filters
                  </Button>
                </motion.div>
              ) : (
                <>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    <AnimatePresence mode="popLayout">
                      {tests.map((test, i) => {
                        const Icon = testIcons[i % testIcons.length]
                        return (
                          <motion.div
                            key={test._id}
                            layout
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.3, delay: (i % 8) * 0.05 }}
                            whileHover={{ y: -4 }}
                          >
                            <Card className="h-full overflow-hidden border-gray-100 hover:border-brand-200 hover:shadow-xl hover:shadow-brand-500/5 transition-all duration-300 group">
                              <CardContent className="p-5">
                                <div className="flex items-start justify-between mb-3">
                                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand-50 to-brand-100 flex items-center justify-center group-hover:from-brand-500 group-hover:to-brand-400 transition-all duration-300">
                                    <Icon className="w-5 h-5 text-brand-600 group-hover:text-white transition-colors" />
                                  </div>
                                  <Badge variant="info" className="text-[10px] px-2 py-0.5">
                                    {test.category}
                                  </Badge>
                                </div>
                                <h3 className="text-base font-semibold text-brand-950 mb-1.5 line-clamp-1">
                                  {test.name}
                                </h3>
                                <p className="text-xs text-gray-500 line-clamp-2 mb-3 min-h-[2rem]">
                                  {test.description}
                                </p>
                                {test.preparationInstructions && (
                                  <p className="text-[10px] text-amber-600 mb-2 line-clamp-1">
                                    ⓘ {test.preparationInstructions}
                                  </p>
                                )}
                                <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                                  <div>
                                    {test.offerPrice ? (
                                      <>
                                        <span className="text-lg font-bold text-brand-600">
                                          {formatPrice(test.offerPrice)}
                                        </span>
                                        <span className="text-xs text-gray-400 line-through ml-1.5">
                                          {formatPrice(test.originalPrice)}
                                        </span>
                                      </>
                                    ) : (
                                      <span className="text-lg font-bold text-brand-600">
                                        {formatPrice(test.originalPrice)}
                                      </span>
                                    )}
                                  </div>
                                  <Link href={`/booking?testId=${test._id}`}>
                                    <Button variant="gradient" size="sm" className="text-xs px-3 py-1.5">
                                      Book Now
                                    </Button>
                                  </Link>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        )
                      })}
                    </AnimatePresence>
                  </div>

                  {totalPages > 1 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center justify-center gap-2 mt-12"
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => changePage(page - 1)}
                        disabled={page <= 1}
                        className="gap-1"
                      >
                        <ChevronLeft className="w-4 h-4" /> Previous
                      </Button>

                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                        <Button
                          key={p}
                          variant={p === page ? 'gradient' : 'outline'}
                          size="sm"
                          onClick={() => changePage(p)}
                          className="min-w-[2.5rem]"
                        >
                          {p}
                        </Button>
                      ))}

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => changePage(page + 1)}
                        disabled={page >= totalPages}
                        className="gap-1"
                      >
                        Next <ChevronRight className="w-4 h-4" />
                      </Button>
                    </motion.div>
                  )}
                </>
              )}
            </div>
          </section>
        </PageTransition>
      </main>
      <Footer />
    </>
  )
}

function HeroBanner() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-brand-950 via-brand-900 to-brand-800 min-h-[35vh] flex items-center">
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-500/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-brand-400/10 rounded-full blur-[100px]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white/80 text-sm font-medium mb-6 border border-white/10"
          >
            <Sparkles className="w-4 h-4" />
            Diagnostic Tests
          </motion.div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4">
            Our Diagnostic Tests
          </h1>
          <p className="text-lg text-brand-200/80 max-w-xl mx-auto">
            Comprehensive range of diagnostic tests with accurate results
          </p>
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent" />
    </section>
  )
}
