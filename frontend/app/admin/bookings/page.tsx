'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Search, Eye, Trash2, ChevronLeft, ChevronRight, Clock, User, Phone, Mail, MapPin, Calendar, Activity, FileText, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { formatDate } from '@/lib/utils'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  isArchived?: boolean
  status: string
  additionalNotes?: string
  createdAt: string
  statusHistory?: { status: string; updatedAt: string; updatedBy?: string }[]
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [serviceFilter, setServiceFilter] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [viewBooking, setViewBooking] = useState<Booking | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [currentUserRole, setCurrentUserRole] = useState('')

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
      if (statusFilter) params.status = statusFilter
      if (serviceFilter) params.serviceType = serviceFilter
      const res = await api.get('/bookings', { params })
      const nextBookings = (res.data.bookings || res.data || [])
      setBookings(nextBookings)
      setTotalPages(res.data.pages || 1)
    } catch { toast.error('Failed to load bookings') }
    finally { setLoading(false) }
  }, [page, search, statusFilter, serviceFilter])

  useEffect(() => { fetchBookings() }, [fetchBookings])

  const notifyAdminRefresh = useCallback(() => {
    if (typeof window === 'undefined') return
    window.dispatchEvent(new CustomEvent('admin-data-refresh'))
    localStorage.setItem('admin-data-refresh', String(Date.now()))
  }, [])

  const updateStatus = async (bookingId: string, status: string) => {
    try {
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
    }
  }

  const deleteBooking = async () => {
    if (!deleteConfirm) return
    try {
      await api.delete(`/bookings/${deleteConfirm}`)
      toast.success('Booking deleted permanently')
      setDeleteConfirm(null)
      setViewBooking((prev) => prev?._id === deleteConfirm ? null : prev)
      fetchBookings()
      notifyAdminRefresh()
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to delete booking')
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
      key: '_id', header: 'Actions',
      render: (b) => (
        <div className="flex items-center gap-2">
          <button onClick={() => setViewBooking(b)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-brand-600 transition-colors"><Eye size={16} /></button>
          {currentUserRole === 'admin' || currentUserRole === 'superadmin' ? (
            <button onClick={() => setDeleteConfirm(b._id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors"><Trash2 size={16} /></button>
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
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search by booking ID, patient name, or mobile..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} className="w-full pl-10 pr-4 h-10 rounded-lg border border-input bg-background text-sm" />
        </div>
        <Select value={serviceFilter} onValueChange={(v) => { setServiceFilter(v); setPage(1) }}>
          <SelectTrigger className="w-full sm:w-44"><SelectValue placeholder="All Types" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Types</SelectItem>
            <SelectItem value="Laboratory">Laboratory</SelectItem>
            <SelectItem value="Radiology">Radiology</SelectItem>
            <SelectItem value="Health Package">Health Package</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1) }}>
          <SelectTrigger className="w-full sm:w-44"><SelectValue placeholder="All Statuses" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Statuses</SelectItem>
            {BOOKING_STATUSES.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}
          </SelectContent>
        </Select>
        </CardContent>
      </Card>

      <Card><CardContent className="p-0">
        <DataTable columns={columns} data={bookings} loading={loading} searchable={false} />
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t">
            <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}><ChevronLeft className="w-4 h-4 mr-1" /> Prev</Button>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next <ChevronRight className="w-4 h-4 ml-1" /></Button>
            </div>
          </div>
        )}
      </CardContent></Card>

      <Dialog open={!!viewBooking} onOpenChange={() => setViewBooking(null)}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
          {viewBooking && (
            <>
              <DialogHeader className="border-b border-gray-100 pb-4">
                <DialogTitle className="flex flex-wrap items-center gap-2">
                  <span className="text-xl font-bold text-brand-700">{viewBooking.bookingId || 'N/A'}</span>
                  <StatusBadge status={viewBooking.status} />
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-500">
                  {viewBooking.serviceType} - {viewBooking.serviceName}
                  {viewBooking.homeCollection && <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Home Collection</span>}
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4 lg:grid-cols-2">
                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                  <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-gray-500">Patient Information</h3>
                  <div className="grid gap-3">
                    <InfoRow icon={User} label="Patient Name" value={viewBooking.patientName || 'N/A'} />
                    <InfoRow icon={Calendar} label="Date of Birth" value={viewBooking.dob ? formatDate(viewBooking.dob) : 'N/A'} />
                    <InfoRow icon={Phone} label="Phone Number" value={viewBooking.mobileNumber || 'N/A'} />
                    <InfoRow icon={Mail} label="Email Address" value={viewBooking.email || 'N/A'} />
                    <InfoRow icon={MapPin} label="Address" value={viewBooking.address || 'N/A'} multiline />
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

              {viewBooking.additionalNotes && (
                <div className="rounded-2xl border border-amber-100 bg-amber-50/60 p-4 text-sm">
                  <span className="font-medium text-amber-900">Additional Notes</span>
                  <p className="mt-1 text-amber-800">{viewBooking.additionalNotes}</p>
                </div>
              )}

              <div className="space-y-3 rounded-2xl border border-gray-200 bg-gray-50/70 p-5">
                <Label className="text-sm font-semibold text-gray-800">Update Booking Status</Label>
                <p className="text-sm text-gray-500">Select the next workflow stage for this booking. Changes update dashboard analytics automatically.</p>
                <Select value={viewBooking.status} onValueChange={(v) => updateStatus(viewBooking._id, v)}>
                  <SelectTrigger className="h-11 w-full bg-white"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {BOOKING_STATUSES.map((s) => (<SelectItem key={s} value={s} disabled={s === viewBooking.status}>{s}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <h4 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-900"><Clock className="h-4 w-4 text-brand-600" /> Status History</h4>
                <div className="max-h-72 overflow-y-auto pr-1">
                  <div className="space-y-4">
                    {(viewBooking.statusHistory?.length ? [...viewBooking.statusHistory] : []).map((entry, i, arr) => {
                      const isLatest = i === arr.length - 1
                      return (
                        <div key={`${entry.status}-${entry.updatedAt}-${i}`} className="relative flex gap-4 pb-4 last:pb-0">
                          {i < arr.length - 1 && <div className="absolute left-[19px] top-10 bottom-0 w-px bg-gray-200" />}
                          <div className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border ${isLatest ? 'border-emerald-200 bg-emerald-100 text-emerald-600' : 'border-gray-200 bg-gray-100 text-gray-500'}`}>
                            {isLatest ? <CheckCircle2 className="h-5 w-5" /> : <Clock className="h-4 w-4" />}
                          </div>
                          <div className="min-w-0 flex-1 rounded-2xl border border-gray-100 bg-gray-50/70 p-4">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                              <div>
                                <p className={`text-sm font-semibold ${isLatest ? 'text-emerald-700' : 'text-gray-900'}`}>{entry.status}</p>
                                <p className="mt-1 text-xs text-gray-500">Updated by {entry.updatedBy || 'System'}</p>
                              </div>
                              <p className="text-xs font-medium text-gray-400">{new Date(entry.updatedAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' })}</p>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Permanently Delete Booking</DialogTitle>
            <DialogDescription>Are you sure you want to permanently delete this booking? This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button onClick={deleteBooking} className="bg-red-600 text-white hover:bg-red-700">Delete Permanently</Button>
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
  multiline = false,
}: {
  icon: typeof User
  label: string
  value: string
  multiline?: boolean
}) {
  return (
    <div className={`flex gap-3 rounded-xl border border-gray-100 bg-gray-50/80 p-3 ${multiline ? 'items-start' : 'items-center'}`}>
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-brand-600 shadow-sm">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-gray-400">{label}</p>
        <p className="mt-1 text-sm font-semibold text-gray-900 break-words">{value}</p>
      </div>
    </div>
  )
}
