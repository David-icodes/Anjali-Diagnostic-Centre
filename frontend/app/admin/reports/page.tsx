'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Search, Upload, Download, RotateCcw, FileText, Clock3, FolderArchive, CheckCircle2, Phone, Calendar, Activity, User } from 'lucide-react'
import toast from 'react-hot-toast'
import { formatDate } from '@/lib/utils'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import StatusBadge from '@/components/admin/StatusBadge'

interface PendingBooking {
  _id: string
  bookingId: string
  patientName: string
  dob?: string
  mobileNumber: string
  serviceType?: string
  serviceName?: string
  testName?: string
  sampleCollectedAt?: string | null
  preferredDate?: string
  status: string
}

interface ReportRecord {
  _id: string
  booking: {
    _id: string
    bookingId: string
    dob?: string
    serviceName?: string
    serviceType?: string
    preferredDate?: string
    sampleCollectedAt?: string | null
    status?: string
  }
  bookingId?: string
  patientName: string
  mobileNumber: string
  pdfUrl: string
  cloudinaryUrl?: string
  status: string
  uploadedBy?: {
    username?: string
  }
  uploadedAt?: string | null
  isDeleted?: boolean
  createdAt: string
}

export default function ReportsPage() {
  const [pendingBookings, setPendingBookings] = useState<PendingBooking[]>([])
  const [reports, setReports] = useState<ReportRecord[]>([])
  const [pendingLoading, setPendingLoading] = useState(true)
  const [reportsLoading, setReportsLoading] = useState(true)
  const [pendingSearch, setPendingSearch] = useState('')
  const [uploadedSearch, setUploadedSearch] = useState('')
  const [showArchivedReports, setShowArchivedReports] = useState(false)
  const [currentUserRole, setCurrentUserRole] = useState('')
  const [selectedBooking, setSelectedBooking] = useState<PendingBooking | null>(null)
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [confirmUploadOpen, setConfirmUploadOpen] = useState(false)
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [restoreTarget, setRestoreTarget] = useState<ReportRecord | null>(null)
  const [downloadingReportId, setDownloadingReportId] = useState('')

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

  useEffect(() => {
    try {
      const rawUser = localStorage.getItem('user')
      if (!rawUser) return
      const parsed = JSON.parse(rawUser)
      setCurrentUserRole(parsed.role || '')
    } catch {}
  }, [])

  const isSuperAdmin = currentUserRole === 'superadmin'

  const fetchPendingBookings = useCallback(async () => {
    try {
      setPendingLoading(true)
      const [sampleCollectedRes, processingRes] = await Promise.all([
        api.get('/bookings', { params: { status: 'Sample Collected', page: 1, limit: 100 } }),
        api.get('/bookings', { params: { status: 'Processing', page: 1, limit: 100 } }),
      ])
      const combined = [
        ...(sampleCollectedRes.data.bookings || []),
        ...(processingRes.data.bookings || []),
      ]
      setPendingBookings(combined)
    } catch {
      toast.error('Failed to load pending report uploads')
    } finally {
      setPendingLoading(false)
    }
  }, [])

  const fetchReports = useCallback(async () => {
    try {
      setReportsLoading(true)
      const res = await api.get('/reports', {
        params: { page: 1, limit: 100, includeDeleted: showArchivedReports ? 'true' : undefined },
      })
      setReports(res.data.reports || [])
    } catch {
      toast.error('Failed to load uploaded reports')
    } finally {
      setReportsLoading(false)
    }
  }, [showArchivedReports])

  useEffect(() => {
    fetchPendingBookings()
    fetchReports()
  }, [fetchPendingBookings, fetchReports])

  const filteredPending = useMemo(() => {
    if (!pendingSearch.trim()) return pendingBookings
    const query = pendingSearch.toLowerCase()
    return pendingBookings.filter((booking) =>
      [booking.bookingId, booking.patientName, booking.mobileNumber, booking.dob || '']
        .some((value) => String(value).toLowerCase().includes(query))
    )
  }, [pendingBookings, pendingSearch])

  const filteredReports = useMemo(() => {
    const visible = reports.filter((report) => showArchivedReports ? report.isDeleted : !report.isDeleted)
    if (!uploadedSearch.trim()) return visible
    const query = uploadedSearch.toLowerCase()
    return visible.filter((report) =>
      [
        report.booking?.bookingId || report.bookingId || '',
        report.patientName,
        report.mobileNumber,
        report.booking?.dob || '',
      ].some((value) => String(value).toLowerCase().includes(query))
    )
  }, [reports, uploadedSearch, showArchivedReports])

  const pendingCount = pendingBookings.length
  const uploadedCount = reports.filter((report) => !report.isDeleted).length
  const archivedCount = reports.filter((report) => report.isDeleted).length
  const todayUploads = reports.filter((report) => {
    if (!report.uploadedAt) return false
    const uploaded = new Date(report.uploadedAt)
    const today = new Date()
    return uploaded.toDateString() === today.toDateString()
  }).length

  const openUploadDialog = (booking: PendingBooking) => {
    if (!['Sample Collected', 'Processing'].includes(booking.status)) {
      toast.error('Report upload is only allowed after sample collection.')
      return
    }
    setSelectedBooking(booking)
    setPdfFile(null)
    setUploadDialogOpen(true)
  }

  const handlePdfSelection = (file: File | null) => {
    if (!file) {
      setPdfFile(null)
      return
    }

    const isPdfMime = file.type === 'application/pdf'
    const isPdfName = file.name.toLowerCase().endsWith('.pdf')

    if (!isPdfMime || !isPdfName) {
      toast.error('Only PDF files are allowed for report uploads')
      setPdfFile(null)
      return
    }

    setPdfFile(file)
  }

  const submitUpload = async () => {
    if (!selectedBooking || !pdfFile) return

    try {
      setUploading(true)
      const formData = new FormData()
      formData.append('bookingId', selectedBooking.bookingId)
      formData.append('pdf', pdfFile)
      await api.post('/reports/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      toast.success('Report uploaded successfully')
      setConfirmUploadOpen(false)
      setUploadDialogOpen(false)
      setSelectedBooking(null)
      setPdfFile(null)
      fetchPendingBookings()
      fetchReports()
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const restoreReport = async () => {
    if (!restoreTarget) return
    try {
      await api.put(`/reports/${restoreTarget._id}/restore`)
      toast.success('Report restored successfully')
      setRestoreTarget(null)
      fetchReports()
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to restore report')
    }
  }

  const archiveReport = async (report: ReportRecord) => {
    try {
      await api.delete(`/reports/${report._id}`)
      toast.success('Report archived successfully')
      fetchReports()
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to archive report')
    }
  }

  const downloadReport = async (report: ReportRecord) => {
    try {
      setDownloadingReportId(report._id)
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
      setDownloadingReportId('')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Manage pending uploads, uploaded reports, and archived report records.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatsCard icon={Clock3} label="Pending Uploads" value={pendingCount} tone="amber" />
        <StatsCard icon={CheckCircle2} label="Uploaded Reports" value={uploadedCount} tone="green" />
        <StatsCard icon={Upload} label="Today's Uploads" value={todayUploads} tone="brand" />
        <StatsCard icon={FolderArchive} label="Archived Reports" value={archivedCount} tone="slate" />
      </div>

      <Card>
        <CardContent className="space-y-4 p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Pending Report Uploads</h2>
              <p className="text-sm text-gray-500">Only bookings with status `Sample Collected` or `Processing` are eligible for upload.</p>
            </div>
            <div className="relative w-full lg:max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <input type="text" value={pendingSearch} onChange={(e) => setPendingSearch(e.target.value)} placeholder="Search by booking ID, patient, phone, DOB..." className="h-10 w-full rounded-lg border border-input bg-background pl-10 pr-4 text-sm" />
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full min-w-[980px]">
              <thead className="bg-gray-50">
                <tr>
                  {['Booking ID', 'Patient Name', 'DOB', 'Phone Number', 'Service Type', 'Test Name', 'Collection Date', 'Status', 'Action'].map((header) => (
                    <th key={header} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {pendingLoading ? (
                  <tr><td colSpan={9} className="px-4 py-8 text-center text-sm text-gray-500">Loading pending uploads...</td></tr>
                ) : filteredPending.length === 0 ? (
                  <tr><td colSpan={9} className="px-4 py-8 text-center text-sm text-gray-500">No pending report uploads found.</td></tr>
                ) : (
                  filteredPending.map((booking) => (
                    <tr key={booking._id} className="hover:bg-gray-50/70">
                      <td className="px-4 py-3 text-sm font-semibold text-brand-700">{booking.bookingId}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{booking.patientName}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{booking.dob ? formatDate(booking.dob) : 'N/A'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{booking.mobileNumber}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{booking.serviceType || 'N/A'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{booking.testName || booking.serviceName || 'N/A'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{booking.sampleCollectedAt ? formatDate(booking.sampleCollectedAt) : (booking.preferredDate ? formatDate(booking.preferredDate) : 'N/A')}</td>
                      <td className="px-4 py-3"><StatusBadge status={booking.status} /></td>
                      <td className="px-4 py-3">
                        <Button size="sm" className="gap-2" onClick={() => openUploadDialog(booking)}>
                          <Upload className="h-4 w-4" /> Upload Report
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Uploaded Reports</h2>
              <p className="text-sm text-gray-500">Cloudinary PDFs are retained permanently. Archive hides a report without deleting the file or record.</p>
            </div>
            <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
              <div className="relative w-full sm:min-w-[320px]">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <input type="text" value={uploadedSearch} onChange={(e) => setUploadedSearch(e.target.value)} placeholder="Search uploaded reports..." className="h-10 w-full rounded-lg border border-input bg-background pl-10 pr-4 text-sm" />
              </div>
              {isSuperAdmin && (
                <Button variant="outline" onClick={() => setShowArchivedReports((current) => !current)}>
                  {showArchivedReports ? 'Show Active Reports' : 'Show Archived Reports'}
                </Button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full min-w-[1080px]">
              <thead className="bg-gray-50">
                <tr>
                  {['Booking ID', 'Patient Name', 'DOB', 'Phone Number', 'Test Name', 'Uploaded By', 'Uploaded At', 'Download PDF', 'Status', 'Actions'].map((header) => (
                    <th key={header} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {reportsLoading ? (
                  <tr><td colSpan={10} className="px-4 py-8 text-center text-sm text-gray-500">Loading uploaded reports...</td></tr>
                ) : filteredReports.length === 0 ? (
                  <tr><td colSpan={10} className="px-4 py-8 text-center text-sm text-gray-500">No uploaded reports found.</td></tr>
                ) : (
                  filteredReports.map((report) => (
                    <tr key={report._id} className="hover:bg-gray-50/70">
                      <td className="px-4 py-3 text-sm font-semibold text-brand-700">{report.booking?.bookingId || report.bookingId || 'N/A'}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{report.patientName}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{report.booking?.dob ? formatDate(report.booking.dob) : 'N/A'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{report.mobileNumber}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{report.booking?.serviceName || 'N/A'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{report.uploadedBy?.username || 'N/A'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{report.uploadedAt ? formatDate(report.uploadedAt) : 'N/A'}</td>
                      <td className="px-4 py-3">
                        {(report.cloudinaryUrl || report.pdfUrl) ? (
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              className="gap-2"
                              onClick={() => downloadReport(report)}
                              disabled={downloadingReportId === report._id}
                            >
                              <Download className="h-4 w-4" />
                              {downloadingReportId === report._id ? 'Downloading...' : 'Download Report'}
                            </Button>
                          </div>
                        ) : 'N/A'}
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={report.booking?.status || report.status} /></td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          {!report.isDeleted && (
                            <>
                              <Button size="sm" variant="outline" className="gap-2" onClick={() => openUploadDialog({
                                _id: report.booking?._id,
                                bookingId: report.booking?.bookingId,
                                patientName: report.patientName,
                                dob: report.booking?.dob,
                                mobileNumber: report.mobileNumber,
                                serviceType: report.booking?.serviceType,
                                serviceName: report.booking?.serviceName,
                                testName: report.booking?.serviceName,
                                sampleCollectedAt: report.booking?.sampleCollectedAt,
                                preferredDate: report.booking?.preferredDate,
                                status: report.booking?.status || 'Processing',
                              })}>
                                <Upload className="h-4 w-4" /> Replace PDF
                              </Button>
                              <Button size="sm" variant="outline" className="gap-2" onClick={() => archiveReport(report)}>
                                <FolderArchive className="h-4 w-4" /> Archive
                              </Button>
                            </>
                          )}
                          {report.isDeleted && isSuperAdmin && (
                            <Button size="sm" variant="outline" className="gap-2" onClick={() => setRestoreTarget(report)}>
                              <RotateCcw className="h-4 w-4" /> Restore
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Report Verification Panel</DialogTitle>
            <DialogDescription>Upload is only allowed after sample collection.</DialogDescription>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-5">
              <div className="grid gap-3 sm:grid-cols-2">
                <ReadOnlyField icon={Activity} label="Booking ID" value={selectedBooking.bookingId} />
                <ReadOnlyField icon={User} label="Patient Name" value={selectedBooking.patientName} />
                <ReadOnlyField icon={Calendar} label="DOB" value={selectedBooking.dob ? formatDate(selectedBooking.dob) : 'N/A'} />
                <ReadOnlyField icon={Phone} label="Phone Number" value={selectedBooking.mobileNumber} />
                <ReadOnlyField icon={Activity} label="Test Name" value={selectedBooking.testName || selectedBooking.serviceName || 'N/A'} />
                <ReadOnlyField icon={Activity} label="Service Type" value={selectedBooking.serviceType || 'N/A'} />
                <ReadOnlyField icon={Calendar} label="Collection Date" value={selectedBooking.sampleCollectedAt ? formatDate(selectedBooking.sampleCollectedAt) : (selectedBooking.preferredDate ? formatDate(selectedBooking.preferredDate) : 'N/A')} />
                <ReadOnlyField icon={FileText} label="Current Status" value={selectedBooking.status} />
              </div>

              <div>
                <Label className="mb-1.5 block">PDF File</Label>
                <input type="file" accept=".pdf,application/pdf" onChange={(e) => handlePdfSelection(e.target.files?.[0] || null)} className="w-full text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-brand-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-brand-700 hover:file:bg-brand-100" />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={() => {
                if (!selectedBooking || !['Sample Collected', 'Processing'].includes(selectedBooking.status)) {
                  toast.error('Report upload is only allowed after sample collection.')
                  return
                }
                if (!pdfFile) {
                  toast.error('Choose a PDF file before uploading')
                  return
                }
                setConfirmUploadOpen(true)
              }}
            >
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmUploadOpen} onOpenChange={setConfirmUploadOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Report Upload</DialogTitle>
            <DialogDescription>You are uploading report for:</DialogDescription>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-3 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm">
              <p><span className="font-semibold">Booking ID:</span> {selectedBooking.bookingId}</p>
              <p><span className="font-semibold">Patient Name:</span> {selectedBooking.patientName}</p>
              <p><span className="font-semibold">DOB:</span> {selectedBooking.dob ? formatDate(selectedBooking.dob) : 'N/A'}</p>
              <p><span className="font-semibold">Phone Number:</span> {selectedBooking.mobileNumber}</p>
              <p><span className="font-semibold">Test Name:</span> {selectedBooking.testName || selectedBooking.serviceName || 'N/A'}</p>
              <p><span className="font-semibold">Service Type:</span> {selectedBooking.serviceType || 'N/A'}</p>
              <p><span className="font-semibold">Collection Date:</span> {selectedBooking.sampleCollectedAt ? formatDate(selectedBooking.sampleCollectedAt) : (selectedBooking.preferredDate ? formatDate(selectedBooking.preferredDate) : 'N/A')}</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmUploadOpen(false)}>Cancel</Button>
            <Button onClick={submitUpload} disabled={uploading}>{uploading ? 'Uploading...' : 'Confirm Upload'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!restoreTarget} onOpenChange={() => setRestoreTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Restore Report</DialogTitle>
            <DialogDescription>This will restore the archived report record without re-uploading the Cloudinary file.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRestoreTarget(null)}>Cancel</Button>
            <Button onClick={restoreReport}>Restore</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function StatsCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Upload
  label: string
  value: number
  tone: 'amber' | 'green' | 'brand' | 'slate'
}) {
  const toneMap = {
    amber: 'bg-amber-50 text-amber-700',
    green: 'bg-emerald-50 text-emerald-700',
    brand: 'bg-brand-50 text-brand-700',
    slate: 'bg-slate-100 text-slate-700',
  }

  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${toneMap[tone]}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function ReadOnlyField({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Activity
  label: string
  value: string
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3">
      <div className="mb-1 flex items-center gap-2 text-xs font-medium text-gray-500">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p className="text-sm font-semibold text-gray-900">{value}</p>
    </div>
  )
}
