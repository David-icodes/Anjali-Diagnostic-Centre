'use client'

import { useState, useEffect, useCallback } from 'react'
import { Users, CalendarCheck, Clock, DollarSign, TrendingUp, Radio, Package, FileText, Syringe, Phone, ArrowRight, Activity } from 'lucide-react'
import api from '@/lib/api'
import { formatDate } from '@/lib/utils'
import StatusBadge from '@/components/admin/StatusBadge'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'

interface DashboardData {
  totalUsers: number
  totalBookings: number
  pending: number
  completed: number
  totalRevenue: number
  dailyRevenue: number
  labBookings: number
  radiologyBookings: number
  healthPackageBookings: number
  sampleCollectionsToday: number
  reportUploaded: number
  assigned: number
  processing: number
  monthlyBookings: { month: string; bookings: number }[]
  monthlyRevenue: { month: string; revenue: number }[]
  recentBookings: any[]
  recentReports: any[]
}

const fallbackData: DashboardData = {
  totalUsers: 0,
  totalBookings: 0,
  pending: 0,
  completed: 0,
  totalRevenue: 0,
  dailyRevenue: 0,
  labBookings: 0,
  radiologyBookings: 0,
  healthPackageBookings: 0,
  sampleCollectionsToday: 0,
  reportUploaded: 0,
  assigned: 0,
  processing: 0,
  monthlyBookings: [],
  monthlyRevenue: [],
  recentBookings: [],
  recentReports: [],
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchDashboard = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true)
      const [statsResponse, recentResponse] = await Promise.all([
        api.get('/bookings/stats'),
        api.get('/bookings', { params: { limit: 8 } }),
      ])

      const stats = statsResponse.data
      setData({
        totalUsers: stats.totalUsers || 0,
        totalBookings: stats.total || 0,
        pending: stats.pending || 0,
        completed: stats.completed || 0,
        totalRevenue: stats.totalRevenue || 0,
        dailyRevenue: stats.dailyRevenue || 0,
        labBookings: stats.labBookings || 0,
        radiologyBookings: stats.radiologyBookings || 0,
        healthPackageBookings: stats.healthPackageBookings || 0,
        sampleCollectionsToday: stats.sampleCollectionsToday || 0,
        reportUploaded: stats.reportUploaded || 0,
        assigned: stats.assigned || 0,
        processing: stats.processing || 0,
        monthlyBookings: (stats.monthlyBookings || []).map((month: any) => ({
          month: `${month._id?.month || ''}/${String(month._id?.year || '').slice(-2)}`,
          bookings: month.count || 0,
        })).reverse(),
        monthlyRevenue: (stats.monthlyRevenue || []).map((month: any) => ({
          month: `${month._id?.month || ''}/${String(month._id?.year || '').slice(-2)}`,
          revenue: month.total || 0,
        })).reverse(),
        recentBookings: recentResponse.data?.bookings || recentResponse.data || [],
        recentReports: stats.recentReports || [],
      })
    } catch {
      setData(fallbackData)
    } finally {
      if (!silent) setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDashboard()

    const handleRefresh = () => fetchDashboard(true)
    const handleStorage = (event: StorageEvent) => {
      if (event.key === 'admin-data-refresh') {
        fetchDashboard(true)
      }
    }

    window.addEventListener('admin-data-refresh', handleRefresh)
    window.addEventListener('storage', handleStorage)

    return () => {
      window.removeEventListener('admin-data-refresh', handleRefresh)
      window.removeEventListener('storage', handleStorage)
    }
  }, [fetchDashboard])

  if (loading && !data) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} className="h-24 rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Skeleton className="h-72 rounded-xl lg:col-span-2" />
          <Skeleton className="h-72 rounded-xl" />
        </div>
      </div>
    )
  }

  const dashboard = data || fallbackData

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <CompactStat label="Today's Revenue" value={`Rs. ${dashboard.dailyRevenue.toLocaleString('en-IN')}`} icon={DollarSign} color="green" />
        <CompactStat label="Pending" value={dashboard.pending} icon={Clock} color="amber" />
        <CompactStat label="Sample Today" value={dashboard.sampleCollectionsToday} icon={Phone} color="purple" />
        <CompactStat label="In Progress" value={dashboard.processing} icon={Syringe} color="blue" />
        <CompactStat label="Reports Done" value={dashboard.reportUploaded} icon={FileText} color="emerald" />
        <CompactStat label="Total Revenue" value={`Rs. ${dashboard.totalRevenue.toLocaleString('en-IN')}`} icon={TrendingUp} color="cyan" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="px-5 pb-2 pt-4">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <CalendarCheck className="h-4 w-4 text-brand-500" /> Monthly Bookings
            </CardTitle>
          </CardHeader>
          <CardContent className="px-2 pb-3">
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dashboard.monthlyBookings} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-100" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ borderRadius: 8, padding: '6px 10px', fontSize: 12 }} />
                  <Bar dataKey="bookings" fill="#6366f1" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="px-5 pb-2 pt-4">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Activity className="h-4 w-4 text-emerald-500" /> Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 px-5 pb-4">
            <ActionRow icon={CalendarCheck} label="New Booking" color="blue" href="/admin/bookings" />
            <ActionRow icon={FileText} label="Upload Report" color="emerald" href="/admin/reports" />
            <ActionRow icon={Users} label="Manage Users" color="purple" href="/admin/users" />
            <ActionRow icon={Package} label="Health Packages" color="teal" href="/admin/health-packages" />
            <ActionRow icon={Radio} label="Radiology" color="cyan" href="/admin/radiology" />
            <ActionRow icon={Syringe} label="Lab Tests" color="rose" href="/admin/tests" />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="px-5 pb-2 pt-4">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Clock className="h-4 w-4 text-amber-500" /> Pending Tasks
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-4">
            <div className="space-y-2">
              <TaskRow label="Pending Bookings" count={dashboard.pending} color="amber" />
              <TaskRow label="Assigned (awaiting contact)" count={dashboard.assigned} color="blue" />
              <TaskRow label="In Processing" count={dashboard.processing} color="violet" />
              <TaskRow label="Reports to Upload" count={dashboard.reportUploaded} color="emerald" showZero />
              <TaskRow label="Ready for Completion" count={dashboard.completed} color="green" showZero />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="px-5 pb-2 pt-4">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <DollarSign className="h-4 w-4 text-emerald-500" /> Revenue Trend
            </CardTitle>
          </CardHeader>
          <CardContent className="px-2 pb-3">
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dashboard.monthlyRevenue} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-100" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={(value: number) => `Rs. ${(value / 1000).toFixed(0)}k`} />
                  <Tooltip contentStyle={{ borderRadius: 8, padding: '6px 10px', fontSize: 12 }} formatter={(value: number) => [`Rs. ${value.toLocaleString('en-IN')}`, 'Revenue']} />
                  <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="px-5 pb-2 pt-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-gray-700">Recent Bookings</CardTitle>
              <span className="text-[10px] font-medium text-gray-500">{dashboard.totalBookings} total</span>
            </div>
          </CardHeader>
          <CardContent className="px-0 pb-1">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-3 py-2 text-left text-[10px] font-medium uppercase tracking-wider text-gray-500">ID</th>
                  <th className="px-3 py-2 text-left text-[10px] font-medium uppercase tracking-wider text-gray-500">Patient</th>
                  <th className="hidden px-3 py-2 text-left text-[10px] font-medium uppercase tracking-wider text-gray-500 sm:table-cell">Service</th>
                  <th className="hidden px-3 py-2 text-left text-[10px] font-medium uppercase tracking-wider text-gray-500 md:table-cell">Type</th>
                  <th className="hidden px-3 py-2 text-left text-[10px] font-medium uppercase tracking-wider text-gray-500 sm:table-cell">Date</th>
                  <th className="px-3 py-2 text-left text-[10px] font-medium uppercase tracking-wider text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {dashboard.recentBookings.length === 0 ? (
                  <tr><td colSpan={6} className="py-6 text-center text-xs text-gray-300">No bookings yet</td></tr>
                ) : (
                  dashboard.recentBookings.slice(0, 6).map((booking: any, index: number) => (
                    <tr key={booking._id || index} className="border-b border-gray-50 transition-colors hover:bg-gray-50/50">
                      <td className="px-3 py-2 font-medium text-gray-800">#{booking.bookingId || booking._id?.slice(-5)}</td>
                      <td className="px-3 py-2 text-gray-600">{booking.patientName}</td>
                      <td className="hidden max-w-[120px] truncate px-3 py-2 text-gray-600 sm:table-cell">{booking.serviceName || booking.testName}</td>
                      <td className="hidden px-3 py-2 md:table-cell">
                        <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500">{booking.serviceType || 'Lab'}</span>
                      </td>
                      <td className="hidden px-3 py-2 text-[10px] text-gray-500 sm:table-cell">{formatDate(booking.preferredDate || booking.createdAt)}</td>
                      <td className="px-3 py-2"><StatusBadge status={booking.status} /></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="px-5 pb-2 pt-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-gray-700">Uploaded Reports</CardTitle>
              <span className="text-[10px] font-medium text-gray-500">{dashboard.recentReports.length} recent</span>
            </div>
          </CardHeader>
          <CardContent className="px-0 pb-1">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-3 py-2 text-left text-[10px] font-medium uppercase tracking-wider text-gray-500">Patient</th>
                  <th className="px-3 py-2 text-left text-[10px] font-medium uppercase tracking-wider text-gray-500">Mobile</th>
                  <th className="hidden px-3 py-2 text-left text-[10px] font-medium uppercase tracking-wider text-gray-500 sm:table-cell">Booking</th>
                  <th className="hidden px-3 py-2 text-left text-[10px] font-medium uppercase tracking-wider text-gray-500 sm:table-cell">Date</th>
                  <th className="px-3 py-2 text-left text-[10px] font-medium uppercase tracking-wider text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {dashboard.recentReports.length === 0 ? (
                  <tr><td colSpan={5} className="py-6 text-center text-xs text-gray-300">No reports uploaded</td></tr>
                ) : (
                  dashboard.recentReports.map((report: any, index: number) => (
                    <tr key={report._id || index} className="border-b border-gray-50 transition-colors hover:bg-gray-50/50">
                      <td className="px-3 py-2 font-medium text-gray-800">{report.patientName}</td>
                      <td className="px-3 py-2 text-[10px] text-gray-500">{report.mobileNumber}</td>
                      <td className="hidden px-3 py-2 text-[10px] text-gray-500 sm:table-cell">#{report.booking?.bookingId || 'N/A'}</td>
                      <td className="hidden px-3 py-2 text-[10px] text-gray-500 sm:table-cell">{formatDate(report.createdAt)}</td>
                      <td className="px-3 py-2"><StatusBadge status={report.status} /></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MiniStat label="Total Users" value={dashboard.totalUsers} icon={Users} />
        <MiniStat label="Lab Tests" value={dashboard.labBookings} icon={Syringe} />
        <MiniStat label="Radiology" value={dashboard.radiologyBookings} icon={Radio} />
        <MiniStat label="Health Packages" value={dashboard.healthPackageBookings} icon={Package} />
      </div>
    </div>
  )
}

function CompactStat({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: any; color: string }) {
  const colors: Record<string, string> = {
    green: 'from-emerald-500 to-emerald-600',
    amber: 'from-amber-500 to-amber-600',
    purple: 'from-purple-500 to-purple-600',
    blue: 'from-blue-500 to-blue-600',
    emerald: 'from-emerald-500 to-emerald-600',
    cyan: 'from-cyan-500 to-cyan-600',
  }

  return (
    <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${colors[color]} shadow-sm`}>
        <Icon className="h-4 w-4 text-white" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-[10px] font-medium uppercase tracking-wider text-gray-500">{label}</p>
        <p className="mt-0.5 text-sm font-bold text-gray-900">{typeof value === 'number' ? value.toLocaleString('en-IN') : value}</p>
      </div>
    </div>
  )
}

function MiniStat({ label, value, icon: Icon }: { label: string; value: number; icon: any }) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-gray-100 bg-white p-3 shadow-sm">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-50">
        <Icon className="h-3.5 w-3.5 text-gray-500" />
      </div>
      <div>
        <p className="text-[9px] font-medium uppercase tracking-wider text-gray-500">{label}</p>
        <p className="text-xs font-bold text-gray-900">{value.toLocaleString('en-IN')}</p>
      </div>
    </div>
  )
}

function ActionRow({ icon: Icon, label, color, href }: { icon: any; label: string; color: string; href: string }) {
  const dotColors: Record<string, string> = { blue: 'bg-blue-400', emerald: 'bg-emerald-400', purple: 'bg-purple-400', teal: 'bg-teal-400', cyan: 'bg-cyan-400', rose: 'bg-rose-400' }
  return (
    <a href={href} className="group flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 transition-colors hover:bg-gray-50">
      <div className="flex items-center gap-2.5">
        <span className={`h-2 w-2 rounded-full ${dotColors[color]}`} />
        <span className="text-xs font-medium text-gray-600 group-hover:text-gray-900">{label}</span>
      </div>
      <ArrowRight className="h-3 w-3 text-gray-300 transition-colors group-hover:text-brand-500" />
    </a>
  )
}

function TaskRow({ label, count, color, showZero }: { label: string; count: number; color: string; showZero?: boolean }) {
  if (count === 0 && !showZero) return null
  const colors: Record<string, string> = { amber: 'text-amber-600 bg-amber-50', blue: 'text-blue-600 bg-blue-50', violet: 'text-violet-600 bg-violet-50', emerald: 'text-emerald-600 bg-emerald-50', green: 'text-green-600 bg-green-50' }
  return (
    <div className="flex items-center justify-between rounded-lg bg-gray-50/50 px-3 py-2">
      <span className="text-xs text-gray-600">{label}</span>
      <span className={`rounded-md px-2 py-0.5 text-xs font-bold ${colors[color]}`}>{count}</span>
    </div>
  )
}
