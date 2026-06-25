'use client'

import { Suspense, useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Search, X, Sparkles } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import api from '@/lib/api'
import Footer from '@/components/layout/Footer'
import PageTransition from '@/components/layout/PageTransition'
import { Button } from '@/components/ui/button'

const hardcodedTests = [
  { name: 'Fasting Plasma Glucose', price: 120 },
  { name: 'Complete Blood Picture (CBP)', price: 390 },
  { name: 'Creatinine', price: 260 },
  { name: 'Post Lunch Glucose', price: 120 },
  { name: 'Glycated Hemoglobin (HbA1c)', price: 600 },
  { name: 'Thyroid Profile', price: 670 },
  { name: 'Lipid Profile', price: 690 },
  { name: 'Complete Urine Examination (CUE)', price: 270 },
  { name: 'Liver Function Test (LFT-A)', price: 690 },
  { name: 'Thyroid Stimulating Hormone (TSH)', price: 340 },
  { name: 'Erythrocyte Sedimentation Rate (ESR)', price: 300 },
  { name: 'Urea', price: 240 },
  { name: 'Uric Acid', price: 240 },
  { name: 'Random Plasma Glucose', price: 120 },
  { name: 'C-Reactive Protein (CRP)', price: 500 },
  { name: 'Vitamin B12', price: 1350 },
  { name: 'Electrolytes', price: 550 },
  { name: 'Calcium', price: 300 },
  { name: 'Vitamin D Total', price: 1900 },
  { name: 'Haemogram', price: 500 },
  { name: 'SGPT/ALT', price: 240 },
]

function TestsPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const search = searchParams.get('search') || ''
  const [searchInput, setSearchInput] = useState(search)
  const [apiTests, setApiTests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    api.get('/tests', { params: { limit: 100 } })
      .then((res) => {
        const data = res.data?.tests || res.data || []
        if (Array.isArray(data) && data.length > 0) setApiTests(data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const displayTests = apiTests.length > 0 ? apiTests : hardcodedTests

  const filtered = displayTests.filter((test: any) => {
    const name = test.name || ''
    return !search || name.toLowerCase().includes(search.toLowerCase())
  })

  const updateParams = (params: Record<string, string>) => {
    const nextParams = new URLSearchParams(searchParams.toString())
    Object.entries(params).forEach(([key, value]) => {
      if (value) nextParams.set(key, value)
      else nextParams.delete(key)
    })
    router.push(`/tests?${nextParams.toString()}`)
  }

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault()
    updateParams({ search: searchInput.trim() })
  }

  const clearSearch = () => {
    setSearchInput('')
    updateParams({ search: '' })
  }

  return (
    <>
      <main className="min-h-screen bg-[#F8FAFC]">
        <PageTransition>
          <section className="relative flex min-h-[28vh] items-center overflow-hidden bg-gradient-to-br from-[#0F766E] via-[#14B8A6] to-[#2DD4BF]">
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.04]" />
            <div className="relative mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
              <div className="max-w-3xl">
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white/90 backdrop-blur-sm">
                  <Sparkles className="h-4 w-4" /> Laboratory Services
                </div>
                <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl">Simple, clearly priced laboratory tests</h1>
                <p className="mt-4 max-w-2xl text-base text-white/80 sm:text-lg">Search for a test and book it directly. No category filters, no clutter, just the essentials.</p>
              </div>
            </div>
          </section>

          <section className="py-10 sm:py-12 lg:py-14">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <motion.form initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleSearch} className="mx-auto mb-10 max-w-2xl">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(event) => setSearchInput(event.target.value)}
                    placeholder="Search Tests..."
                    className="h-14 w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-12 text-base text-slate-900 shadow-sm outline-none transition focus:border-[#14B8A6] focus:ring-2 focus:ring-[#14B8A6]/15"
                  />
                  {searchInput ? (
                    <button type="button" onClick={clearSearch} className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-400 transition hover:bg-slate-100 hover:text-slate-700">
                      <X className="h-4 w-4" />
                    </button>
                  ) : null}
                </div>
              </motion.form>

              {search ? (
                <div className="mb-6 text-center text-sm text-slate-500">
                  Showing results for <span className="font-semibold text-[#0F766E]">&ldquo;{search}&rdquo;</span>
                </div>
              ) : null}

              {loading ? (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {Array.from({ length: 8 }).map((_, index) => (
                    <div key={index} className="h-44 animate-pulse rounded-[20px] border border-slate-200 bg-white" />
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <div className="rounded-[24px] border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
                  <p className="text-lg font-semibold text-slate-700">No tests found</p>
                  <p className="mt-2 text-sm text-slate-500">Try a different search term.</p>
                </div>
              ) : (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {filtered.map((test: any, index: number) => {
                    const price = test.offerPrice && test.offerPrice > 0 && test.offerPrice < (test.originalPrice || test.price)
                      ? test.offerPrice
                      : test.originalPrice || test.price

                    return (
                      <motion.article
                        key={test._id || test.name}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.15, delay: (index % 12) * 0.02 }}
                        className="flex min-h-[180px] flex-col justify-between rounded-[20px] border border-slate-200 bg-white p-6 shadow-[0_12px_28px_rgba(15,23,42,0.05)] transition duration-150 hover:-translate-y-0.5 hover:shadow-[0_16px_30px_rgba(15,118,110,0.10)]"
                      >
                        <h3 className="text-2xl font-bold uppercase leading-snug text-slate-900">{test.name}</h3>
                        <div className="mt-6 flex items-end justify-between gap-4">
                          <p className="text-4xl font-bold text-[#3730A3]">{formatPrice(price)}</p>
                          <Link href={`/booking?test=${test._id || test.name}`}>
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
        </PageTransition>
      </main>
      <Footer />
    </>
  )
}

export default function TestsPage() {
  return <Suspense fallback={null}><TestsPageContent /></Suspense>
}
