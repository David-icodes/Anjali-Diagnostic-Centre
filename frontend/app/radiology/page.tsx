'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Sparkles, Search, X } from 'lucide-react'
import Footer from '@/components/layout/Footer'
import PageTransition from '@/components/layout/PageTransition'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import {
  getBookingCartTotal,
  readBookingCart,
  upsertBookingCartItem,
  type BookingCartItem,
} from '@/lib/bookingCart'

export default function RadiologyPage() {
  const router = useRouter()
  const [services, setServices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [cart, setCart] = useState<BookingCartItem[]>([])

  useEffect(() => {
    const syncCart = () => setCart(readBookingCart())
    syncCart()
    window.addEventListener('booking-cart-updated', syncCart)
    return () => window.removeEventListener('booking-cart-updated', syncCart)
  }, [])

  useEffect(() => {
    api.get('/radiology', { params: { isActive: true, limit: 250 } })
      .then((res) => {
        const data = res.data?.services || res.data || []
        setServices(Array.isArray(data) ? data : [])
      })
      .catch(() => {
        toast.error('Failed to load radiology services')
      })
      .finally(() => setLoading(false))
  }, [])

  const filteredServices = useMemo(() => {
    const q = search.trim().toLowerCase()
    return services.filter((service) => !q || service.name?.toLowerCase().includes(q))
  }, [search, services])

  const totalAmount = getBookingCartTotal(cart)

  const toggleBooking = (service: any) => {
    const nextCart = upsertBookingCartItem({
      serviceId: service._id,
      serviceType: 'Radiology',
      name: service.name,
      price: service.price || 0,
    })
    setCart(nextCart)
    const exists = nextCart.some((entry) => entry.serviceId === service._id && entry.serviceType === 'Radiology')
    toast.success(exists ? 'Added to booking list' : 'Removed from booking list')
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
                  <Sparkles className="h-4 w-4" /> Radiology Services
                </div>
                <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl">Select multiple radiology services in one go</h1>
                <p className="mt-4 max-w-2xl text-base text-white/80 sm:text-lg">Add services to your booking list here, or use the combined page with the Radiology department filter.</p>
              </div>
            </div>
          </section>

          <section className="py-10 sm:py-12 lg:py-14">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-8 max-w-2xl">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search radiology services..." className="h-14 w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-12 text-base text-slate-900 shadow-sm outline-none transition focus:border-[#14B8A6] focus:ring-2 focus:ring-[#14B8A6]/15" />
                  {search ? <button type="button" onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-400 transition hover:bg-slate-100 hover:text-slate-700"><X className="h-4 w-4" /></button> : null}
                </div>
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

              {loading ? (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{Array.from({ length: 8 }).map((_, index) => <div key={index} className="h-44 animate-pulse rounded-[20px] border border-slate-200 bg-white" />)}</div>
              ) : filteredServices.length === 0 ? (
                <div className="rounded-[24px] border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm"><p className="text-lg text-slate-500">No radiology services available at the moment.</p></div>
              ) : (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {filteredServices.map((service, index) => {
                    const isSelected = cart.some((entry) => entry.serviceId === service._id && entry.serviceType === 'Radiology')
                    return (
                      <motion.article key={service._id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.15, delay: (index % 12) * 0.02 }} className={`flex min-h-[176px] flex-col justify-between rounded-[20px] border bg-white p-5 shadow-[0_12px_28px_rgba(15,23,42,0.05)] transition duration-150 hover:-translate-y-0.5 hover:shadow-[0_16px_30px_rgba(15,118,110,0.10)] ${isSelected ? 'border-[#14B8A6]' : 'border-slate-200'}`}>
                        <div>
                          <h3 className="line-clamp-3 min-h-[4.25rem] text-lg font-semibold leading-snug text-slate-900">{service.name}</h3>
                        </div>
                        <div className="mt-6 flex items-end justify-between gap-4">
                          <p className="text-3xl font-bold text-[#3730A3]">{formatPrice(service.price || 0)}</p>
                          <Button className={`h-10 rounded-xl px-4 text-sm font-bold shadow-none transition ${isSelected ? 'bg-[#14B8A6] text-white hover:bg-[#0F766E]' : 'border border-[#14B8A6] bg-white text-[#14B8A6] hover:bg-[#14B8A6] hover:text-white'}`} onClick={() => toggleBooking(service)}>
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
