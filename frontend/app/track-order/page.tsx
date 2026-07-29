'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Package, CheckCircle2, Clock, Calendar,
  User, Phone, Mail, MapPin, Activity, Sparkles,
  ChevronLeft, ArrowRight, ClipboardList, Droplets,
  Beaker, FileText, Download,
} from 'lucide-react'
import { cn, formatDate, getStatusColor } from '@/lib/utils'
import api from '@/lib/api'
import Footer from '@/components/layout/Footer'
import PageTransition from '@/components/layout/PageTransition'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import toast from 'react-hot-toast'

interface BookingDetails {
  _id: string
  bookingId: string
  patientName: string
  dob?: string
  age: number
  gender: string
  mobileNumber: string
  email: string
  address: string
  serviceName?: string
  serviceType?: string
  preferredDate: string
  preferredTime: string
  status: string
  createdAt: string
  additionalNotes?: string
  statusHistory?: { status: string; updatedAt: string; updatedBy?: string }[]
}

interface ReportResult {
  _id: string
  booking: {
    _id: string
    bookingId: string
    dob?: string
    serviceName?: string
    serviceType?: string
    preferredDate?: string
    status?: string
  }
  patientName: string
  mobileNumber: string
  pdfUrl: string
  status: string
  createdAt: string
}

const statusFlow = [
  { key: 'Pending', label: 'Pending', icon: Clock },
  { key: 'Assigned', label: 'Assigned', icon: CheckCircle2 },
  { key: 'Sample Collection Scheduled', label: 'Collection Scheduled', icon: Calendar },
  { key: 'Sample Collected', label: 'Sample Collected', icon: Droplets },
  { key: 'Processing', label: 'Processing', icon: Beaker },
  { key: 'Report Uploaded', label: 'Report Uploaded', icon: FileText },
  { key: 'Completed', label: 'Completed', icon: CheckCircle2 },
  { key: 'Cancelled', label: 'Cancelled', icon: Package },
]

export default function TrackOrderPage() {
  const [activeTab, setActiveTab] = useState('booking')
  const [trackName, setTrackName] = useState('')
  const [mobileNumber, setMobileNumber] = useState('')
  const [reportName, setReportName] = useState('')
  const [reportMobile, setReportMobile] = useState('')
  const [reportDob, setReportDob] = useState('')
  const [tracking, setTracking] = useState(false)
  const [loading, setLoading] = useState(false)
  const [downloadingId, setDownloadingId] = useState('')
  const [booking, setBooking] = useState<BookingDetails | null>(null)
  const [reports, setReports] = useState<ReportResult[]>([])
  const [error, setError] = useState('')

  const getDownloadErrorMessage = async (error: any) => {
    const blob = error?.response?.data
    if (blob instanceof Blob) {
      try {
        const text = await blob.text()
        const parsed = JSON.parse(text)
        return parsed?.message || parsed?.error || text
      } catch {
        try {
          return await blob.text()
        } catch {}
      }
    }

    return error?.response?.data?.message || error?.message || 'Failed to download report'
  }

  const downloadReport = async (report: ReportResult) => {
    try {
      setDownloadingId(report._id)
      const response = await api.get(`/reports/download/${report._id}`, { responseType: 'blob' })
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      const safeName = (report.patientName || 'Patient').trim().replace(/[^a-zA-Z0-9-_ ]/g, '').replace(/\s+/g, '_') || 'Patient'
      link.href = url
      link.download = `${safeName}_Report.pdf`
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error: any) {
      toast.error(await getDownloadErrorMessage(error))
    } finally {
      setDownloadingId('')
    }
  }

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!trackName.trim() || !mobileNumber.trim()) {
      toast.error('Please enter your name and mobile number')
      return
    }

    setLoading(true)
    setError('')
    setBooking(null)

    try {
      const res = await api.get('/bookings/track', {
        params: { patientName: trackName.trim(), mobileNumber: mobileNumber.trim() },
      })
      const data = res.data?.booking || res.data
      if (data) {
        setBooking(data)
        setTracking(true)
      } else {
        setError('No booking found with these details')
      }
    } catch {
      setError('No booking found with these details.')
    } finally {
      setLoading(false)
    }
  }

  const handleSearchReports = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reportName.trim() || !reportMobile.trim() || !reportDob) {
      toast.error('Please enter your name, mobile number, and date of birth')
      return
    }

    setLoading(true)
    setError('')
    setReports([])

    try {
      const res = await api.get('/reports/search', {
        params: {
          patientName: reportName.trim(),
          mobileNumber: reportMobile.trim(),
          dob: reportDob,
        },
      })
      const data = Array.isArray(res.data) ? res.data : []
      if (data.length > 0) {
        setReports(data)
      } else {
        setError('No reports found with these details')
      }
    } catch {
      setError('No reports found. Please check your details.')
    } finally {
      setLoading(false)
    }
  }

  const currentStatusIndex = booking
    ? statusFlow.findIndex((s) => s.key === booking.status)
    : -1

  return (
    <>
      <main className="min-h-screen bg-gradient-to-b from-gray-50/30 to-white">
        <PageTransition>
          <HeroBanner />

          <section className="py-12">
            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
                <TabsList className="mx-auto grid w-full max-w-md grid-cols-2">
                  <TabsTrigger value="booking">Track Booking</TabsTrigger>
                  <TabsTrigger value="report">Download Report</TabsTrigger>
                </TabsList>

                <TabsContent value="booking">
                  {!tracking ? (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                      <Card className="border-gray-100 shadow-lg">
                        <CardContent className="p-8">
                          <div className="mb-8 text-center">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-50 to-brand-100">
                              <Search className="h-8 w-8 text-brand-600" />
                            </div>
                            <h2 className="mb-2 text-2xl font-bold text-brand-950">Track Your Order</h2>
                            <p className="text-sm text-gray-500">Enter your Name and Mobile Number to check the status</p>
                          </div>

                          <form onSubmit={handleTrack} className="space-y-5">
                            <Input label="Your Name" placeholder="Enter your full name" value={trackName} onChange={(e) => setTrackName(e.target.value)} />
                            <Input label="Mobile Number" placeholder="Enter registered mobile number" value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)} />
                            <Button type="submit" variant="gradient" size="lg" className="w-full gap-2" disabled={loading}>
                              {loading ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> Tracking...</> : <><Search className="h-4 w-4" /> Track Order</>}
                            </Button>
                          </form>

                          {error && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
                              {error}
                            </motion.div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  ) : booking && (
                    <AnimatePresence mode="wait">
                      <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <button onClick={() => { setTracking(false); setBooking(null) }} className="mb-6 flex items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-brand-600">
                          <ChevronLeft className="h-4 w-4" /> Back to Search
                        </button>

                        <div className="space-y-6">
                          <Card className="overflow-hidden border-gray-100 shadow-lg">
                            <div className="bg-gradient-to-r from-brand-600 to-brand-400 px-6 py-5">
                              <div className="flex items-center justify-between text-white">
                                <div>
                                  <p className="mb-1 text-xs text-white/70">Booking ID</p>
                                  <p className="font-mono text-xl font-bold">{booking.bookingId || booking._id}</p>
                                </div>
                                <Badge className={cn('px-3 py-1 text-xs', getStatusColor(booking.status))}>{booking.status}</Badge>
                              </div>
                            </div>
                            <CardContent className="space-y-4 p-6">
                              <div className="grid gap-4 sm:grid-cols-2">
                                {[
                                  { icon: User, label: 'Patient', value: `${booking.patientName} (${booking.age}/${booking.gender})` },
                                  { icon: Calendar, label: 'DOB', value: booking.dob ? formatDate(booking.dob) : 'N/A' },
                                  { icon: Activity, label: 'Service', value: booking.serviceName || 'N/A' },
                                  { icon: Calendar, label: 'Date', value: formatDate(booking.preferredDate) },
                                  { icon: Clock, label: 'Time', value: booking.preferredTime },
                                  { icon: Phone, label: 'Mobile', value: booking.mobileNumber },
                                  { icon: Mail, label: 'Email', value: booking.email },
                                ].map((item, i) => (
                                  <div key={i} className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
                                    <item.icon className="h-4 w-4 shrink-0 text-gray-400" />
                                    <div>
                                      <p className="text-xs text-gray-500">{item.label}</p>
                                      <p className="text-sm font-medium text-brand-950">{item.value}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              {booking.address && (
                                <div className="flex items-start gap-3 rounded-lg bg-gray-50 p-3">
                                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                                  <div>
                                    <p className="text-xs text-gray-500">Address</p>
                                    <p className="text-sm text-brand-950">{booking.address}</p>
                                  </div>
                                </div>
                              )}
                            </CardContent>
                          </Card>

                          <Card className="border-gray-100 shadow-lg">
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2 text-lg">
                                <ClipboardList className="h-5 w-5 text-brand-600" /> Status Timeline
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="relative">
                                {statusFlow.map((s, i) => {
                                  const Icon = s.icon
                                  const isPast = currentStatusIndex >= i
                                  const isCurrent = currentStatusIndex === i
                                  const isCancelled = booking.status === 'Cancelled'

                                  if (isCancelled && s.key === 'Cancelled' && i !== currentStatusIndex) return null
                                  if (!isCancelled && s.key === 'Cancelled') return null

                                  return (
                                    <div key={s.key} className="relative flex gap-4 pb-8 last:pb-0">
                                      <div className="flex flex-col items-center">
                                        <div className={cn(
                                          'z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300',
                                          isPast && !isCancelled ? 'border-green-500 bg-green-500 text-white' : isCurrent ? 'scale-110 border-brand-600 bg-brand-600 text-white shadow-lg shadow-brand-500/30' : 'border-gray-200 bg-white text-gray-400'
                                        )}>
                                          <Icon className={cn('h-5 w-5', isCurrent && 'animate-pulse')} />
                                        </div>
                                        {i < statusFlow.length - 1 && (isCancelled ? i < currentStatusIndex : true) && (
                                          <div className={cn('absolute top-10 h-full w-0.5', isPast && !isCancelled ? 'bg-green-500' : 'bg-gray-200')} />
                                        )}
                                      </div>
                                      <div className={cn('pt-1.5', isCurrent && 'scale-[1.02]')}>
                                        <p className={cn('text-sm font-semibold', isPast && !isCancelled ? 'text-green-700' : isCurrent ? 'text-brand-700' : 'text-gray-400')}>{s.label}</p>
                                        {booking.statusHistory?.find((h) => h.status === s.key) && (
                                          <p className="mt-0.5 text-xs text-gray-400">{formatDate(booking.statusHistory.find((h) => h.status === s.key)!.updatedAt)}</p>
                                        )}
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>
                            </CardContent>
                          </Card>

                          <div className="flex flex-wrap justify-center gap-3">
                            <Link href="/booking"><Button variant="gradient" className="gap-2">Book Another Test <ArrowRight className="h-4 w-4" /></Button></Link>
                            <Link href="/contact"><Button variant="outline" className="gap-2">Need Help?</Button></Link>
                          </div>
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  )}
                </TabsContent>

                <TabsContent value="report">
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <Card className="border-gray-100 shadow-lg">
                      <CardContent className="p-8">
                        <div className="mb-8 text-center">
                          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-green-50 to-green-100">
                            <Download className="h-8 w-8 text-green-600" />
                          </div>
                          <h2 className="mb-2 text-2xl font-bold text-brand-950">Download Report</h2>
                          <p className="text-sm text-gray-500">Search by your name, mobile number, and date of birth to download reports</p>
                        </div>

                        <form onSubmit={handleSearchReports} className="space-y-5">
                          <Input label="Your Name" placeholder="Enter your full name" value={reportName} onChange={(e) => setReportName(e.target.value)} />
                          <Input label="Mobile Number" placeholder="Enter registered mobile number" value={reportMobile} onChange={(e) => setReportMobile(e.target.value)} />
                          <Input label="Date of Birth" type="date" value={reportDob} onChange={(e) => setReportDob(e.target.value)} max={new Date().toISOString().split('T')[0]} />
                          <Button type="submit" variant="default" size="lg" className="w-full gap-2 bg-green-600 hover:bg-green-700" disabled={loading}>
                            {loading ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> Searching...</> : <><Search className="h-4 w-4" /> Search Reports</>}
                          </Button>
                        </form>

                        {error && (
                          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
                            {error}
                          </motion.div>
                        )}

                        {reports.length > 0 && (
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 space-y-3">
                            <h3 className="font-semibold text-gray-900">{reports.length} Report{reports.length > 1 ? 's' : ''} Found</h3>
                            {reports.map((report) => (
                              <div key={report._id} className="flex flex-col gap-4 rounded-xl border border-green-100 bg-green-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                  <p className="font-medium text-gray-900">Booking #{report.booking?.bookingId || 'N/A'}</p>
                                  <p className="text-sm text-gray-500">{report.booking?.serviceName || 'Report'} • {report.booking?.serviceType || 'Service'}</p>
                                  <p className="text-sm text-gray-500">Booking Date: {report.booking?.preferredDate ? formatDate(report.booking.preferredDate) : 'N/A'}</p>
                                  <p className="text-sm text-gray-500">Report Date: {formatDate(report.createdAt)}</p>
                                  <p className="text-sm text-gray-500">Status: {report.booking?.status || report.status}</p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => downloadReport(report)}
                                  disabled={downloadingId === report._id}
                                  className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-70"
                                >
                                  <Download className="h-4 w-4" /> {downloadingId === report._id ? 'Downloading...' : 'Download Report'}
                                </button>
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                </TabsContent>
              </Tabs>
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
    <section className="relative flex min-h-[30vh] items-center overflow-hidden bg-gradient-to-br from-brand-950 via-brand-900 to-brand-800">
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
      <div className="absolute right-0 top-0 h-[500px] w-[500px] rounded-full bg-brand-500/20 blur-[120px]" />
      <div className="absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-brand-400/10 blur-[100px]" />
      <div className="relative mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-medium text-white/80"
          >
            <Sparkles className="h-4 w-4" /> Track Your Order
          </motion.div>
          <h1 className="mb-4 text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">Track Order Status</h1>
          <p className="mx-auto max-w-xl text-lg text-brand-200/80">Enter your booking details to check the real-time status of your test</p>
        </motion.div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent" />
    </section>
  )
}
