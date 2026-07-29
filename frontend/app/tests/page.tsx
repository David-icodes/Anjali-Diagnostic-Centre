'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Search, X, Sparkles } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import api from '@/lib/api'
import Footer from '@/components/layout/Footer'
import PageTransition from '@/components/layout/PageTransition'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'
import {
  getBookingCartTotal,
  readBookingCart,
  upsertBookingCartItem,
  type BookingCartItem,
} from '@/lib/bookingCart'

const departments = ['All Tests', 'Blood Test', 'Diabetes', 'Thyroid', 'Liver', 'Kidney', 'Heart', 'Hormones', 'Vitamin', 'Radiology']

type BrowseItem = {
  _id: string
  name: string
  price: number
  serviceType: 'Laboratory' | 'Radiology'
  category: string
}

function TestsPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const search = searchParams.get('search') || ''
  const department = searchParams.get('department') || 'All Tests'
  const [searchInput, setSearchInput] = useState(search)
  const [items, setItems] = useState<BrowseItem[]>([])
  const [loading, setLoading] = useState(true)
  const [cart, setCart] = useState<BookingCartItem[]>([])

  useEffect(() => {
    const syncCart = () => setCart(readBookingCart())
    syncCart()
    window.addEventListener('booking-cart-updated', syncCart)
    return () => window.removeEventListener('booking-cart-updated', syncCart)
  }, [])

  useEffect(() => {
    setLoading(true)
    Promise.all([
      api.get('/tests', { params: { limit: 250, isActive: true } }),
      api.get('/radiology', { params: { limit: 250, isActive: true } }),
    ])
      .then(([testsRes, radiologyRes]) => {
        const tests = (testsRes.data?.tests || testsRes.data || []).map((test: any) => ({
          _id: test._id,
          name: test.name,
          price: test.hasOffer && test.offerPrice > 0 ? test.offerPrice : (test.originalPrice || test.price || 0),
          serviceType: 'Laboratory' as const,
          category: test.category || 'Other',
        }))

        const radiology = (radiologyRes.data?.services || radiologyRes.data || []).map((service: any) => ({
          _id: service._id,
          name: service.name,
          price: service.price || 0,
          serviceType: 'Radiology' as const,
          category: 'Radiology',
        }))

        setItems([...tests, ...radiology])
      })
      .catch(() => {
        toast.error('Failed to load tests and services')
      })
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()
    return items.filter((item) => {
      const matchesDepartment = department === 'All Tests'
        || (department === 'Radiology' ? item.serviceType === 'Radiology' : item.category === department)
      const matchesSearch = !normalizedSearch || item.name.toLowerCase().includes(normalizedSearch)
      return matchesDepartment && matchesSearch
    })
  }, [department, items, search])

  const updateParams = (params: Record<string, string>) => {
    const nextParams = new URLSearchParams(searchParams.toString())
    Object.entries(params).forEach(([key, value]) => {
      if (value && value !== 'All Tests') nextParams.set(key, value)
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

  const toggleBooking = (item: BrowseItem) => {
    const nextCart = upsertBookingCartItem({
      serviceId: item._id,
      serviceType: item.serviceType,
      name: item.name,
      price: item.price,
    })
    setCart(nextCart)
    const exists = nextCart.some((entry) => entry.serviceId === item._id && entry.serviceType === item.serviceType)
    toast.success(exists ? 'Added to booking list' : 'Removed from booking list')
  }

  const totalAmount = getBookingCartTotal(cart)

  return (
    <>
      <main className="min-h-screen bg-[#F8FAFC]">
        <PageTransition>
          <section className="relative flex min-h-[28vh] items-center overflow-hidden bg-gradient-to-br from-[#0F766E] via-[#14B8A6] to-[#2DD4BF]">
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.04]" />
            <div className="relative mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
              <div className="max-w-3xl">
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white/90 backdrop-blur-sm">
                  <Sparkles className="h-4 w-4" /> Tests & Radiology
                </div>
                <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl">Find tests fast and build one booking</h1>
                <p className="mt-4 max-w-2xl text-base text-white/80 sm:text-lg">Use search and departments together, add multiple tests or radiology services, then continue with one booking.</p>
              </div>
            </div>
          </section>

          <section className="py-10 sm:py-12 lg:py-14">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <motion.form initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleSearch} className="mx-auto mb-6 max-w-2xl">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input type="text" value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Search tests or radiology services..." className="h-14 w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-12 text-base text-slate-900 shadow-sm outline-none transition focus:border-[#14B8A6] focus:ring-2 focus:ring-[#14B8A6]/15" />
                  {searchInput ? <button type="button" onClick={clearSearch} className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-400 transition hover:bg-slate-100 hover:text-slate-700"><X className="h-4 w-4" /></button> : null}
                </div>
              </motion.form>

              <div className="mb-6 flex flex-wrap gap-2">
                {departments.map((label) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => updateParams({ department: label })}
                    className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${department === label || (!searchParams.get('department') && label === 'All Tests') ? 'border-[#14B8A6] bg-[#14B8A6]/10 text-[#0F766E]' : 'border-slate-200 bg-white text-slate-500 hover:border-[#14B8A6]/30 hover:text-[#0F766E]'}`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {cart.length > 0 ? (
                <div className="mb-8 flex flex-col gap-3 rounded-[24px] border border-[#14B8A6]/15 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{cart.length} selected for booking</p>
                    <p className="mt-1 text-sm text-slate-500">Total amount: <span className="font-semibold text-[#0F766E]">{formatPrice(totalAmount)}</span></p>
                  </div>
                  <Button className="rounded-xl bg-[#14B8A6] text-white hover:bg-[#0F766E]" onClick={() => router.push('/booking?source=cart')}>
                    Proceed to Booking
                  </Button>
                </div>
              ) : null}

              {search ? <div className="mb-6 text-center text-sm text-slate-500">Showing results for <span className="font-semibold text-[#0F766E]">&ldquo;{search}&rdquo;</span></div> : null}

              {loading ? (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{Array.from({ length: 8 }).map((_, index) => <div key={index} className="h-44 animate-pulse rounded-[20px] border border-slate-200 bg-white" />)}</div>
              ) : filtered.length === 0 ? (
                <div className="rounded-[24px] border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm"><p className="text-lg font-semibold text-slate-700">No items found</p><p className="mt-2 text-sm text-slate-500">Try a different search term or department.</p></div>
              ) : (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {filtered.map((item, index) => {
                    const isSelected = cart.some((entry) => entry.serviceId === item._id && entry.serviceType === item.serviceType)
                    return (
                      <motion.article key={`${item.serviceType}-${item._id}`} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.15, delay: (index % 12) * 0.02 }} className={`flex min-h-[176px] flex-col justify-between rounded-[20px] border bg-white p-5 shadow-[0_12px_28px_rgba(15,23,42,0.05)] transition duration-150 hover:-translate-y-0.5 hover:shadow-[0_16px_30px_rgba(15,118,110,0.10)] ${isSelected ? 'border-[#14B8A6]' : 'border-slate-200'}`}>
                        <div>
                          <h3 className="line-clamp-3 min-h-[4.25rem] text-lg font-semibold leading-snug text-slate-900">{item.name}</h3>
                        </div>
                        <div className="mt-6 flex items-end justify-between gap-4">
                          <p className="text-3xl font-bold text-[#3730A3]">{formatPrice(item.price)}</p>
                          <Button className={`h-10 rounded-xl px-4 text-sm font-bold shadow-none transition ${isSelected ? 'bg-[#14B8A6] text-white hover:bg-[#0F766E]' : 'border border-[#14B8A6] bg-white text-[#14B8A6] hover:bg-[#14B8A6] hover:text-white'}`} onClick={() => toggleBooking(item)}>
                            BOOK
                          </Button>
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
