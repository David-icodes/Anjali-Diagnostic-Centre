'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, Eye, Trash2, ChevronLeft, ChevronRight, Clock, User, Phone, Mail, MapPin, Calendar, Activity, FileText, CheckCircle2, Copy, Building2, MapPinned } from 'lucide-react'
import toast from 'react-hot-toast'
import { formatDate } from '@/lib/utils'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog'
import DataTable, { Column } from '@/components/admin/DataTable'
import StatusBadge from '@/components/admin/StatusBadge'

const BOOKING_STATUSES = [
  'Pending',
  'Assigned',
  'Sample Collection Scheduled',
  'Sample Collected',
  'Processing',
  'Report Uploaded',
  'Completed',
  'Cancelled',
]

interface Booking {
  _id: string
  bookingId?: string
  patientName?: string
  dob?: string
  mobileNumber?: string
  email?: string
  address?: string
  serviceType?: string
  serviceName?: string
  servicePrice?: number
  homeCollection?: boolean
  preferredDate?: string
  preferredTime?: string
  sampleCollectedAt?: string | null
  status: string
  additionalNotes?: string
  createdAt: string
  statusHistory?: { status: string; updatedAt: string; updatedBy?: string }[]
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [serviceFilter, setServiceFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [viewBooking, setViewBooking] = useState<Booking | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [currentUserRole, setCurrentUserRole] = useState('')
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [deletingBooking, setDeletingBooking] = useState(false)

  useEffect(() => {
    try {
      const rawUser = localStorage.getItem('user')
      if (!rawUser) return
      const parsed = JSON.parse(rawUser)
      setCurrentUserRole(parsed.role || '')
    } catch {}
  }, [])

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true)
      const params: any = { page, limit: 10 }
      if (search) params.search = search
      if (statusFilter !== 'all') params.status = statusFilter
      if (serviceFilter !== 'all') params.serviceType = serviceFilter
      const res = await api.get('/bookings', { params })
      setBookings(res.data.bookings || res.data || [])
      setTotalPages(res.data.pages || 1)
    } catch {
      toast.error('Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }, [page, search, statusFilter, serviceFilter])

  useEffect(() => {
    const handleRefresh = () => { fetchBookings() }
    const handleStorage = (event: StorageEvent) => {
      if (event.key === 'admin-data-refresh') fetchBookings()
    }

    window.addEventListener('admin-data-refresh', handleRefresh)
    window.addEventListener('storage', handleStorage)

    return () => {
      window.removeEventListener('admin-data-refresh', handleRefresh)
      window.removeEventListener('storage', handleStorage)
    }
  }, [fetchBookings])

  useEffect(() => {
    fetchBookings()
  }, [fetchBookings])

  const notifyAdminRefresh = useCallback(() => {
    if (typeof window === 'undefined') return
    window.dispatchEvent(new CustomEvent('admin-data-refresh'))
    localStorage.setItem('admin-data-refresh', String(Date.now()))
  }, [])

  const updateStatus = async (bookingId: string, status: string) => {
    try {
      setUpdatingStatus(true)
      await api.put(`/bookings/${bookingId}/status`, { status })
      toast.success('Status updated successfully')
      fetchBookings()
      notifyAdminRefresh()
      if (viewBooking?._id === bookingId) {
        setViewBooking((prev) => prev ? {
          ...prev,
          status,
          statusHistory: [
            ...(prev.statusHistory || []),
            { status, updatedAt: new Date().toISOString(), updatedBy: currentUserRole || 'Admin' },
          ],
        } : prev)
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update status')
    } finally {
      setUpdatingStatus(false)
    }
  }

  const deleteBooking = async () => {
    if (!deleteConfirm) return
    try {
      setDeletingBooking(true)
      await api.delete(`/bookings/${deleteConfirm}`)
      toast.success('Booking deleted successfully')
      setDeleteConfirm(null)
      setViewBooking((prev) => prev?._id === deleteConfirm ? null : prev)
      fetchBookings()
      notifyAdminRefresh()
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to delete booking')
    } finally {
      setDeletingBooking(false)
    }
  }

  const columns: Column<Booking>[] = [
    { key: 'bookingId', header: 'Booking ID', render: (b) => <span className="font-mono font-semibold text-brand-700">{b.bookingId || 'N/A'}</span> },
    { key: 'patientName', header: 'Patient Name', render: (b) => b.patientName || 'N/A' },
    { key: 'dob', header: 'DOB', render: (b) => b.dob ? formatDate(b.dob) : 'N/A' },
    { key: 'mobileNumber', header: 'Phone', render: (b) => b.mobileNumber || 'N/A' },
    { key: 'serviceName', header: 'Service', render: (b) => b.serviceName || 'N/A' },
    { key: 'status', header: 'Status', render: (b) => <StatusBadge status={b.status} /> },
    { key: 'sampleCollectedAt', header: 'Collection Date', render: (b) => b.sampleCollectedAt ? formatDate(b.sampleCollectedAt) : 'N/A' },
    { key: 'createdAt', header: 'Created Date', render: (b) => formatDate(b.createdAt) },
    {
      key: '_id',
      header: 'Actions',
      render: (b) => (
        <div className="flex items-center gap-2">
          <button onClick={() => setViewBooking(b)} className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-brand-600"><Eye size={16} /></button>
          {currentUserRole === 'admin' || currentUserRole === 'superadmin' ? (
            <button onClick={() => setDeleteConfirm(b._id)} className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600"><Trash2 size={16} /></button>
          ) : null}
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-emerald-100 bg-gradient-to-r from-white via-emerald-50/70 to-sky-50/70 p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Booking Management</h1>
        <p className="mt-1 text-sm text-gray-600">Manage patient bookings, update workflow status, and review case details in a clean diagnostic-center dashboard.</p>
      </div>

      <Card className="border-gray-200 shadow-sm">
        <CardContent className="flex flex-col gap-4 p-5 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search by booking ID, patient name, or mobile..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className="h-10 w-full rounded-lg border border-gray-200 bg-white pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-500"
            />
          </div>
          <Select value={serviceFilter} onValueChange={(v) => { setServiceFilter(v); setPage(1) }}>
            <SelectTrigger className="w-full sm:w-48"><SelectValue placeholder="All Types" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Laboratory">Laboratory</SelectItem>
              <SelectItem value="Radiology">Radiology</SelectItem>
              <SelectItem value="Health Package">Health Package</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1) }}>
            <SelectTrigger className="w-full sm:w-48"><SelectValue placeholder="All Statuses" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {BOOKING_STATUSES.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <DataTable columns={columns} data={bookings} loading={loading} searchable={false} />
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t px-6 py-4">
              <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}><ChevronLeft className="mr-1 h-4 w-4" /> Prev</Button>
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next <ChevronRight className="ml-1 h-4 w-4" /></Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!viewBooking} onOpenChange={() => setViewBooking(null)}>
        <DialogContent className="max-h-[92vh] max-w-5xl overflow-y-auto border border-gray-200 bg-white shadow-2xl">
          {viewBooking && (
            <>
              <DialogHeader className="border-b border-gray-100 pb-4">
                <DialogTitle className="flex flex-wrap items-center gap-2">
                  <span className="text-xl font-bold text-brand-700">{viewBooking.bookingId || 'N/A'}</span>
                  <StatusBadge status={viewBooking.status} />
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-500">
                  {viewBooking.serviceType} - {viewBooking.serviceName}
                  {viewBooking.homeCollection && <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">Home Collection</span>}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-5 py-5">
                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                    <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-gray-500">Patient Information</h3>
                    <div className="grid gap-3">
                      <InfoRow icon={User} label="Patient Name" value={viewBooking.patientName || 'N/A'} />
                      <InfoRow icon={Calendar} label="Date of Birth" value={viewBooking.dob ? formatDate(viewBooking.dob) : 'N/A'} />
                      <InfoRow icon={Phone} label="Phone Number" value={viewBooking.mobileNumber || 'N/A'} />
                      <InfoRow icon={Mail} label="Email Address" value={viewBooking.email || 'N/A'} />
                    </div>
                  </div>
                  <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                    <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-gray-500">Booking Information</h3>
                    <div className="grid gap-3">
                      <InfoRow icon={Activity} label="Service Type" value={viewBooking.serviceType || 'N/A'} />
                      <InfoRow icon={Activity} label="Service Name" value={viewBooking.serviceName || 'N/A'} />
                      <InfoRow icon={Calendar} label="Preferred Date" value={formatDate(viewBooking.preferredDate || viewBooking.createdAt)} />
                      <InfoRow icon={Clock} label="Preferred Time" value={viewBooking.preferredTime || 'N/A'} />
                      <InfoRow icon={FileText} label="Sample Collected" value={viewBooking.sampleCollectedAt ? formatDate(viewBooking.sampleCollectedAt) : 'N/A'} />
                      <InfoRow icon={FileText} label="Created On" value={formatDate(viewBooking.createdAt)} />
                      <InfoRow icon={CheckCircle2} label="Home Collection" value={viewBooking.homeCollection ? 'Yes' : 'No'} />
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-emerald-100 bg-gradient-to-r from-emerald-50/90 to-sky-50/80 p-5 shadow-sm">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-emerald-800">
                        <MapPinned className="h-4 w-4" />
                        Collection Address
                      </h3>
                      <p className="mt-3 text-base font-semibold text-gray-900">{viewBooking.patientName || 'N/A'}</p>
                      <p className="mt-2 text-sm leading-relaxed text-gray-700">{viewBooking.address || 'Address not provided'}</p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      className="gap-2 rounded-full border-emerald-200 bg-white/90 text-emerald-700"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(viewBooking.address || '')
                          toast.success('Address copied')
                        } catch {
                          toast.error('Failed to copy address')
                        }
                      }}
                    >
                      <Copy className="h-4 w-4" />
                      Copy Address
                    </Button>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <MiniDetail icon={Phone} label="Phone" value={viewBooking.mobileNumber || 'N/A'} />
                    <MiniDetail icon={Mail} label="Email" value={viewBooking.email || 'N/A'} />
                    <MiniDetail icon={Building2} label="City" value={extractAddressPart(viewBooking.address, 'city')} />
                    <MiniDetail icon={MapPin} label="Pincode" value={extractAddressPart(viewBooking.address, 'pincode')} />
                  </div>
                </div>

                <div className="rounded-2xl border border-amber-100 bg-amber-50/60 p-4 text-sm">
                  <span className="font-medium text-amber-900">Additional Notes</span>
                  <p className="mt-1 text-amber-800">{viewBooking.additionalNotes || 'No additional notes provided.'}</p>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                  <h4 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-900"><Clock className="h-4 w-4 text-brand-600" /> Booking Timeline</h4>
                  <div className="max-h-72 overflow-y-auto pr-1">
                    <div className="space-y-4">
                      {(viewBooking.statusHistory?.length ? [...viewBooking.statusHistory] : [{ status: viewBooking.status, updatedAt: viewBooking.createdAt, updatedBy: 'System' }]).map((entry, i, arr) => {
                        const isLatest = i === arr.length - 1
                        return (
                          <div key={`${entry.status}-${entry.updatedAt}-${i}`} className="relative flex gap-4 pb-4 last:pb-0">
                            {i < arr.length - 1 && <div className="absolute bottom-0 left-[19px] top-10 w-px bg-gray-200" />}
                            <div className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border ${isLatest ? 'border-emerald-200 bg-emerald-100 text-emerald-600' : 'border-gray-200 bg-gray-100 text-gray-500'}`}>
                              {isLatest ? <CheckCircle2 className="h-5 w-5" /> : <Clock className="h-4 w-4" />}
                            </div>
                            <div className="min-w-0 flex-1 rounded-2xl border border-gray-100 bg-gray-50/70 p-4">
                              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                  <p className={`text-sm font-semibold ${isLatest ? 'text-emerald-700' : 'text-gray-900'}`}>{entry.status}</p>
                                  <p className="mt-1 text-xs text-gray-500">Updated by {entry.updatedBy || 'System'}</p>
                                </div>
                                <p className="text-xs font-medium text-gray-500">{new Date(entry.updatedAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' })}</p>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>

                <div className="space-y-3 rounded-2xl border border-gray-200 bg-gray-50/70 p-5">
                  <Label className="text-sm font-semibold text-gray-800">Update Booking Status</Label>
                  <p className="text-sm text-gray-500">Select the next workflow stage for this booking. Changes update dashboard analytics automatically.</p>
                  <Select value={viewBooking.status} onValueChange={(v) => updateStatus(viewBooking._id, v)}>
                    <SelectTrigger className="h-11 w-full bg-white" disabled={updatingStatus}><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {BOOKING_STATUSES.map((s) => (<SelectItem key={s} value={s} disabled={s === viewBooking.status}>{s}</SelectItem>))}
                    </SelectContent>
                  </Select>
                  {updatingStatus ? <p className="text-xs font-medium text-brand-600">Updating booking status...</p> : null}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Booking</DialogTitle>
            <DialogDescription>Are you sure you want to delete this booking? It will be removed from active listings but preserved securely in the database.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)} disabled={deletingBooking}>Cancel</Button>
            <Button onClick={deleteBooking} disabled={deletingBooking} className="bg-red-600 text-white hover:bg-red-700">{deletingBooking ? 'Deleting...' : 'Delete Booking'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof User
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50/80 p-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-brand-600 shadow-sm">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-gray-500">{label}</p>
        <p className="mt-1 break-words text-sm font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  )
}

function MiniDetail({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof User
  label: string
  value: string
}) {
  return (
    <div className="rounded-xl border border-white/70 bg-white/80 p-3">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-gray-500">
        <Icon className="h-3.5 w-3.5 text-emerald-600" />
        {label}
      </div>
      <p className="mt-2 break-words text-sm font-semibold text-gray-900">{value}</p>
    </div>
  )
}

function extractAddressPart(address?: string, type?: 'city' | 'pincode') {
  if (!address) return 'Not provided'
  if (type === 'pincode') {
    const pin = address.match(/\b\d{6}\b/)
    return pin?.[0] || 'Not provided'
  }

  const parts = address.split(',').map((part) => part.trim()).filter(Boolean)
  return parts.length >= 2 ? parts[parts.length - 2] : 'Not provided'
}
