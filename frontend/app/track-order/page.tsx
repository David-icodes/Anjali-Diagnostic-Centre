'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Package, CheckCircle2, Clock, Calendar,
  User, Phone, Mail, MapPin, Activity, Sparkles,
  ChevronLeft, ChevronRight, ArrowRight, Home,
  ClipboardList, Droplets, Beaker, FileText, Truck,
} from 'lucide-react'
import { cn, formatDate, formatPrice, getStatusColor } from '@/lib/utils'
import api from '@/lib/api'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import PageTransition from '@/components/layout/PageTransition'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import toast from 'react-hot-toast'

interface BookingDetails {
  _id: string
  bookingId: string
  patientName: string
  age: number
  gender: string
  mobileNumber: string
  email: string
  address: string
  testName?: string
  testId?: any
  preferredDate: string
  preferredTime: string
  status: string
  createdAt: string
  additionalNotes?: string
  amount?: number
  statusHistory?: { status: string; timestamp: string; note?: string }[]
}

const statusFlow = [
  { key: 'Pending', label: 'Pending', icon: Clock },
  { key: 'Confirmed', label: 'Confirmed', icon: CheckCircle2 },
  { key: 'Sample Collection Scheduled', label: 'Collection Scheduled', icon: Calendar },
  { key: 'Sample Collected', label: 'Sample Collected', icon: Droplets },
  { key: 'Processing', label: 'Processing', icon: Beaker },
  { key: 'Report Ready', label: 'Report Ready', icon: FileText },
  { key: 'Completed', label: 'Completed', icon: CheckCircle2 },
  { key: 'Cancelled', label: 'Cancelled', icon: Package },
]

export default function TrackOrderPage() {
  const [bookingId, setBookingId] = useState('')
  const [mobileNumber, setMobileNumber] = useState('')
  const [tracking, setTracking] = useState(false)
  const [loading, setLoading] = useState(false)
  const [booking, setBooking] = useState<BookingDetails | null>(null)
  const [error, setError] = useState('')

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!bookingId.trim() || !mobileNumber.trim()) {
      toast.error('Please enter Booking ID and Mobile Number')
      return
    }

    setLoading(true)
    setError('')
    setBooking(null)

    try {
      const res = await api.get('/bookings/track', {
        params: { bookingId: bookingId.trim(), mobileNumber: mobileNumber.trim() },
      })
      const data = res.data?.booking || res.data
      if (data) {
        setBooking(data)
        setTracking(true)
      } else {
        setError('No booking found with these details')
      }
    } catch {
      setError('No booking found with these details. Please check your Booking ID and Mobile Number.')
    } finally {
      setLoading(false)
    }
  }

  const currentStatusIndex = booking
    ? statusFlow.findIndex((s) => s.key === booking.status)
    : -1

  return (
    <>
      <Header />
      <main className="min-h-screen pt-20 bg-gradient-to-b from-brand-50/30 to-white">
        <PageTransition>
          <HeroBanner />

          <section className="py-12">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
              {!tracking ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="border-gray-100 shadow-lg">
                    <CardContent className="p-8">
                      <div className="text-center mb-8">
                        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-brand-50 to-brand-100 flex items-center justify-center mb-4">
                          <Search className="w-8 h-8 text-brand-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-brand-950 mb-2">Track Your Order</h2>
                        <p className="text-gray-500 text-sm">Enter your Booking ID and Mobile Number to check the status</p>
                      </div>

                      <form onSubmit={handleTrack} className="space-y-5">
                        <Input
                          label="Booking ID"
                          placeholder="Enter your booking ID"
                          value={bookingId}
                          onChange={(e) => setBookingId(e.target.value)}
                        />
                        <Input
                          label="Mobile Number"
                          placeholder="Enter registered mobile number"
                          value={mobileNumber}
                          onChange={(e) => setMobileNumber(e.target.value)}
                        />
                        <Button
                          type="submit"
                          variant="gradient"
                          size="lg"
                          className="w-full gap-2"
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              Tracking...
                            </>
                          ) : (
                            <>
                              <Search className="w-4 h-4" />
                              Track Order
                            </>
                          )}
                        </Button>
                      </form>

                      {error && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-4 p-4 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm"
                        >
                          {error}
                        </motion.div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                <AnimatePresence mode="wait">
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    <button
                      onClick={() => { setTracking(false); setBooking(null) }}
                      className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand-600 mb-6 transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" /> Back to Search
                    </button>

                    {booking && (
                      <div className="space-y-6">
                        <Card className="border-gray-100 shadow-lg overflow-hidden">
                          <div className="bg-gradient-to-r from-brand-600 to-brand-400 px-6 py-5">
                            <div className="flex items-center justify-between text-white">
                              <div>
                                <p className="text-white/70 text-xs mb-1">Booking ID</p>
                                <p className="text-xl font-bold font-mono">{booking.bookingId || booking._id}</p>
                              </div>
                              <Badge className={cn('text-xs px-3 py-1', getStatusColor(booking.status))}>
                                {booking.status}
                              </Badge>
                            </div>
                          </div>

                          <CardContent className="p-6 space-y-4">
                            <div className="grid sm:grid-cols-2 gap-4">
                              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                                <User className="w-4 h-4 text-gray-400 shrink-0" />
                                <div>
                                  <p className="text-xs text-gray-500">Patient</p>
                                  <p className="text-sm font-medium text-brand-950">{booking.patientName} ({booking.age}/{booking.gender})</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                                <Activity className="w-4 h-4 text-gray-400 shrink-0" />
                                <div>
                                  <p className="text-xs text-gray-500">Test</p>
                                  <p className="text-sm font-medium text-brand-950">{booking.testName || (typeof booking.testId === 'object' ? booking.testId?.name : 'N/A')}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                                <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                                <div>
                                  <p className="text-xs text-gray-500">Date</p>
                                  <p className="text-sm font-medium text-brand-950">{formatDate(booking.preferredDate)}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                                <Clock className="w-4 h-4 text-gray-400 shrink-0" />
                                <div>
                                  <p className="text-xs text-gray-500">Time</p>
                                  <p className="text-sm font-medium text-brand-950">{booking.preferredTime}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                                <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                                <div>
                                  <p className="text-xs text-gray-500">Mobile</p>
                                  <p className="text-sm font-medium text-brand-950">{booking.mobileNumber}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                                <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                                <div>
                                  <p className="text-xs text-gray-500">Email</p>
                                  <p className="text-sm font-medium text-brand-950">{booking.email}</p>
                                </div>
                              </div>
                            </div>

                            {booking.address && (
                              <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                                <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                                <div>
                                  <p className="text-xs text-gray-500">Address</p>
                                  <p className="text-sm text-brand-950">{booking.address}</p>
                                </div>
                              </div>
                            )}

                            {booking.amount && (
                              <div className="flex items-center justify-between p-3 rounded-lg bg-brand-50">
                                <span className="text-sm font-medium text-brand-950">Total Amount</span>
                                <span className="text-lg font-bold text-brand-600">{formatPrice(booking.amount)}</span>
                              </div>
                            )}
                          </CardContent>
                        </Card>

                        <Card className="border-gray-100 shadow-lg">
                          <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                              <ClipboardList className="w-5 h-5 text-brand-600" />
                              Status Timeline
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="relative">
                              {statusFlow.map((s, i) => {
                                const Icon = s.icon
                                const isPast = currentStatusIndex >= i
                                const isCurrent = currentStatusIndex === i
                                const isCancelled = booking.status === 'Cancelled'
                                const showAsPast = isCancelled ? i <= currentStatusIndex : isPast

                                if (isCancelled && s.key === 'Cancelled' && i !== currentStatusIndex) return null
                                if (!isCancelled && s.key === 'Cancelled') return null

                                return (
                                  <div key={s.key} className="flex gap-4 pb-8 last:pb-0 relative">
                                    <div className="flex flex-col items-center">
                                      <div className={cn(
                                        'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 z-10',
                                        showAsPast && !isCancelled
                                          ? 'bg-green-500 border-green-500 text-white'
                                          : isCurrent
                                            ? 'bg-brand-600 border-brand-600 text-white shadow-lg shadow-brand-500/30 scale-110'
                                            : 'bg-white border-gray-200 text-gray-400'
                                      )}>
                                        <Icon className={cn('w-5 h-5', isCurrent && 'animate-pulse')} />
                                      </div>
                                      {i < statusFlow.length - 1 && (isCancelled ? i < currentStatusIndex : true) && !(isCancelled && i + 1 === statusFlow.findIndex(x => x.key === 'Cancelled')) && (
                                        <div className={cn(
                                          'w-0.5 h-full absolute top-10 transition-colors duration-500',
                                          showAsPast && !isCancelled ? 'bg-green-500' : 'bg-gray-200'
                                        )} />
                                      )}
                                    </div>
                                    <div className={cn(
                                      'pt-1.5 transition-all duration-300',
                                      isCurrent && 'scale-[1.02]'
                                    )}>
                                      <p className={cn(
                                        'text-sm font-semibold transition-colors',
                                        showAsPast && !isCancelled ? 'text-green-700' : isCurrent ? 'text-brand-700' : 'text-gray-400'
                                      )}>
                                        {s.label}
                                      </p>
                                      {booking.statusHistory?.find(h => h.status === s.key) && (
                                        <p className="text-xs text-gray-400 mt-0.5">
                                          {formatDate(booking.statusHistory.find(h => h.status === s.key)!.timestamp)}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                )
                              })}

                              {booking.status === 'Cancelled' && (
                                <motion.div
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  className="flex gap-4"
                                >
                                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-red-100 border-2 border-red-300 text-red-600">
                                    <Package className="w-5 h-5" />
                                  </div>
                                  <div className="pt-1.5">
                                    <p className="text-sm font-semibold text-red-600">Cancelled</p>
                                    <p className="text-xs text-gray-400 mt-0.5">This booking has been cancelled</p>
                                  </div>
                                </motion.div>
                              )}
                            </div>
                          </CardContent>
                        </Card>

                        <div className="flex flex-wrap justify-center gap-3">
                          <Link href="/booking">
                            <Button variant="gradient" className="gap-2">
                              Book Another Test <ArrowRight className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Link href="/contact">
                            <Button variant="outline" className="gap-2">
                              Need Help?
                            </Button>
                          </Link>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
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
    <section className="relative overflow-hidden bg-gradient-to-br from-brand-950 via-brand-900 to-brand-800 min-h-[30vh] flex items-center">
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
            Track Your Order
          </motion.div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4">
            Track Order Status
          </h1>
          <p className="text-lg text-brand-200/80 max-w-xl mx-auto">
            Enter your booking details to check the real-time status of your test
          </p>
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent" />
    </section>
  )
}
