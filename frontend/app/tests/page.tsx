'use client'

import { Suspense, useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Search, X, Sparkles } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import api from '@/lib/api'
import Footer from '@/components/layout/Footer'
import PageTransition from '@/components/layout/PageTransition'
import { Button } from '@/components/ui/button'

const departments = ['All', 'Blood Test', 'Diabetes', 'Thyroid', 'Liver', 'Kidney', 'Heart', 'Hormones', 'Vitamin']

function TestsPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const search = searchParams.get('search') || ''
  const category = searchParams.get('category') || 'All'
  const [searchInput, setSearchInput] = useState(search)
  const [apiTests, setApiTests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const params: any = { limit: 200, isActive: true }
    if (category && category !== 'All') params.category = category
    api.get('/tests', { params })
      .then((res) => {
        const data = res.data?.tests || res.data || []
        setApiTests(Array.isArray(data) ? data : [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [category])

  const filtered = useMemo(() => apiTests.filter((test: any) => {
    const name = test.name || ''
    return !search || name.toLowerCase().includes(search.toLowerCase())
  }), [apiTests, search])

  const updateParams = (params: Record<string, string>) => {
    const nextParams = new URLSearchParams(searchParams.toString())
    Object.entries(params).forEach(([key, value]) => {
      if (value && value !== 'All') nextParams.set(key, value)
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
                <p className="mt-4 max-w-2xl text-base text-white/80 sm:text-lg">Use the department filters to narrow the list and book one or more tests from the booking page.</p>
              </div>
            </div>
          </section>

          <section className="py-10 sm:py-12 lg:py-14">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <motion.form initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleSearch} className="mx-auto mb-6 max-w-2xl">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input type="text" value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Search Tests..." className="h-14 w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-12 text-base text-slate-900 shadow-sm outline-none transition focus:border-[#14B8A6] focus:ring-2 focus:ring-[#14B8A6]/15" />
                  {searchInput ? <button type="button" onClick={clearSearch} className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-400 transition hover:bg-slate-100 hover:text-slate-700"><X className="h-4 w-4" /></button> : null}
                </div>
              </motion.form>

              <div className="mb-8 flex flex-wrap gap-2">
                {departments.map((department) => (
                  <button key={department} type="button" onClick={() => updateParams({ category: department })} className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${category === department || (department === 'All' && !searchParams.get('category')) ? 'border-[#14B8A6] bg-[#14B8A6]/10 text-[#0F766E]' : 'border-slate-200 bg-white text-slate-500 hover:border-[#14B8A6]/30 hover:text-[#0F766E]'}`}>
                    {department}
                  </button>
                ))}
                <Link href="/radiology" className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-500 transition hover:border-[#14B8A6]/30 hover:text-[#0F766E]">Radiology</Link>
              </div>

              {search ? <div className="mb-6 text-center text-sm text-slate-500">Showing results for <span className="font-semibold text-[#0F766E]">&ldquo;{search}&rdquo;</span></div> : null}

              {loading ? (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{Array.from({ length: 8 }).map((_, index) => <div key={index} className="h-44 animate-pulse rounded-[20px] border border-slate-200 bg-white" />)}</div>
              ) : filtered.length === 0 ? (
                <div className="rounded-[24px] border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm"><p className="text-lg font-semibold text-slate-700">No tests found</p><p className="mt-2 text-sm text-slate-500">Try a different search term or department.</p></div>
              ) : (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {filtered.map((test: any, index: number) => {
                    const price = test.hasOffer && test.offerPrice > 0 ? test.offerPrice : (test.originalPrice || test.price)
                    return (
                      <motion.article key={test._id || test.name} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.15, delay: (index % 12) * 0.02 }} className="flex min-h-[180px] flex-col justify-between rounded-[20px] border border-slate-200 bg-white p-6 shadow-[0_12px_28px_rgba(15,23,42,0.05)] transition duration-150 hover:-translate-y-0.5 hover:shadow-[0_16px_30px_rgba(15,118,110,0.10)]">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <h3 className="text-2xl font-bold uppercase leading-snug text-slate-900">{test.name}</h3>
                            <p className="mt-1 text-xs text-slate-400">{test.category || 'Other'}</p>
                          </div>
                          <div className="flex shrink-0 gap-1.5">
                            {test.isPopular ? <span className="rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-semibold text-teal-700">POPULAR</span> : null}
                            {test.hasOffer ? <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700">OFFER</span> : null}
                          </div>
                        </div>
                        <div className="mt-6 flex items-end justify-between gap-4">
                          <p className="text-4xl font-bold text-[#3730A3]">{formatPrice(price)}</p>
                          <Link href={`/booking?test=${test._id || test.name}`}><Button className="h-10 rounded-xl border border-[#14B8A6] bg-white px-4 text-sm font-bold text-[#14B8A6] shadow-none transition hover:bg-[#14B8A6] hover:text-white">BOOK</Button></Link>
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
