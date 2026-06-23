'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Users, CalendarCheck, Clock, CheckCircle, DollarSign, TrendingUp, Radio, Package, FileText, Syringe, Phone, MapPin, ArrowRight, Activity } from 'lucide-react'
import api from '@/lib/api'
import { formatDate, formatPrice } from '@/lib/utils'
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

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true)
      const [bRes, recentRes] = await Promise.all([
        api.get('/bookings/stats'),
        api.get('/bookings', { params: { limit: 8 } }),
      ])
      const s = bRes.data
      setData({
        totalUsers: s.totalUsers || 0,
        totalBookings: s.total || 0,
        pending: s.pending || 0,
        completed: s.completed || 0,
        totalRevenue: s.totalRevenue || 0,
        dailyRevenue: s.dailyRevenue || 0,
        labBookings: s.labBookings || 0,
        radiologyBookings: s.radiologyBookings || 0,
        healthPackageBookings: s.healthPackageBookings || 0,
        sampleCollectionsToday: s.sampleCollectionsToday || 0,
        reportUploaded: s.reportUploaded || 0,
        assigned: s.assigned || 0,
        processing: s.processing || 0,
        monthlyBookings: (s.monthlyBookings || []).map((m: any) => ({
          month: `${m._id?.month || ''}/${String(m._id?.year || '').slice(-2)}`,
          bookings: m.count || 0,
        })).reverse(),
        monthlyRevenue: (s.monthlyRevenue || []).map((m: any) => ({
          month: `${m._id?.month || ''}/${String(m._id?.year || '').slice(-2)}`,
          revenue: m.total || 0,
        })).reverse(),
        recentBookings: recentRes.data?.bookings || recentRes.data || [],
        recentReports: s.recentReports || [],
      })
    } catch {
      setData({
        totalUsers: 0, totalBookings: 0, pending: 0, completed: 0,
        totalRevenue: 0, dailyRevenue: 0, labBookings: 0,
        radiologyBookings: 0, healthPackageBookings: 0,
        sampleCollectionsToday: 0, reportUploaded: 0, assigned: 0, processing: 0,
        monthlyBookings: [], monthlyRevenue: [], recentBookings: [], recentReports: [],
      })
    } finally { setLoading(false) }
  }, [])

  useEffect(() => {
    fetchDashboard()

    const handleRefresh = () => { fetchDashboard() }
    const handleStorage = (event: StorageEvent) => {
      if (event.key === 'admin-data-refresh') fetchDashboard()
    }

    window.addEventListener('admin-data-refresh', handleRefresh)
    window.addEventListener('storage', handleStorage)

    const interval = window.setInterval(fetchDashboard, 15000)

    return () => {
      window.removeEventListener('admin-data-refresh', handleRefresh)
      window.removeEventListener('storage', handleStorage)
      window.clearInterval(interval)
    }
  }, [fetchDashboard])

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Skeleton className="h-72 rounded-xl lg:col-span-2" />
          <Skeleton className="h-72 rounded-xl" />
        </div>
      </div>
    )
  }

  const d = data!

  return (
    <div className="space-y-4">

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <CompactStat label="Today's Revenue" value={`₹${(d.dailyRevenue || 0).toLocaleString('en-IN')}`} icon={DollarSign} color="green" />
        <CompactStat label="Pending" value={d.pending} icon={Clock} color="amber" />
        <CompactStat label="Sample Today" value={d.sampleCollectionsToday} icon={Phone} color="purple" />
        <CompactStat label="In Progress" value={d.processing} icon={Syringe} color="blue" />
        <CompactStat label="Reports Done" value={d.reportUploaded} icon={FileText} color="emerald" />
        <CompactStat label="Total Revenue" value={`₹${(d.totalRevenue || 0).toLocaleString('en-IN')}`} icon={TrendingUp} color="cyan" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2 pt-4 px-5">
            <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-brand-500" /> Monthly Bookings & Revenue
            </CardTitle>
          </CardHeader>
          <CardContent className="px-2 pb-3">
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={d.monthlyBookings} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
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
          <CardHeader className="pb-2 pt-4 px-5">
            <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-500" /> Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-4 space-y-2">
            <ActionRow icon={CalendarCheck} label="New Booking" color="blue" href="/admin/bookings" />
            <ActionRow icon={FileText} label="Upload Report" color="emerald" href="/admin/reports" />
            <ActionRow icon={Users} label="Manage Users" color="purple" href="/admin/users" />
            <ActionRow icon={Package} label="Health Packages" color="teal" href="/admin/health-packages" />
            <ActionRow icon={Radio} label="Radiology" color="cyan" href="/admin/radiology" />
            <ActionRow icon={Syringe} label="Lab Tests" color="rose" href="/admin/tests" />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2 pt-4 px-5">
            <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" /> Pending Tasks
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-4">
            <div className="space-y-2">
              <TaskRow label="Pending Bookings" count={d.pending} color="amber" />
              <TaskRow label="Assigned (awaiting contact)" count={d.assigned} color="blue" />
              <TaskRow label="In Processing" count={d.processing} color="violet" />
              <TaskRow label="Reports to Upload" count={d.reportUploaded} color="emerald" showZero />
              <TaskRow label="Ready for Completion" count={d.completed} color="green" showZero />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 pt-4 px-5">
            <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-500" /> Revenue Trend
            </CardTitle>
          </CardHeader>
          <CardContent className="px-2 pb-3">
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={d.monthlyRevenue} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-100" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={(v: number) => `₹${(v / 1000).toFixed(0)}k`} />
                  <Tooltip contentStyle={{ borderRadius: 8, padding: '6px 10px', fontSize: 12 }} formatter={(v: number) => [`₹${v.toLocaleString('en-IN')}`, 'Revenue']} />
                  <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2 pt-4 px-5">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-gray-700">Recent Bookings</CardTitle>
              <span className="text-[10px] text-gray-400 font-medium">{d.totalBookings} total</span>
            </div>
          </CardHeader>
          <CardContent className="px-0 pb-1">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 px-3 font-medium text-gray-400 uppercase tracking-wider">ID</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-400 uppercase tracking-wider">Patient</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-400 uppercase tracking-wider hidden sm:table-cell">Service</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-400 uppercase tracking-wider hidden md:table-cell">Type</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-400 uppercase tracking-wider hidden sm:table-cell">Date</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-400 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {d.recentBookings.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-6 text-gray-300 text-xs">No bookings yet</td></tr>
                ) : (
                  d.recentBookings.slice(0, 6).map((b: any, i: number) => (
                    <tr key={b._id || i} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="py-2 px-3 font-medium text-gray-800">#{b.bookingId || b._id?.slice(-5)}</td>
                      <td className="py-2 px-3 text-gray-600">{b.patientName}</td>
                      <td className="py-2 px-3 text-gray-600 hidden sm:table-cell truncate max-w-[120px]">{b.serviceName || b.testName}</td>
                      <td className="py-2 px-3 hidden md:table-cell">
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500">{b.serviceType || 'Lab'}</span>
                      </td>
                      <td className="py-2 px-3 text-gray-500 hidden sm:table-cell text-[10px]">{formatDate(b.preferredDate || b.createdAt)}</td>
                      <td className="py-2 px-3"><StatusBadge status={b.status} /></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 pt-4 px-5">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-gray-700">Uploaded Reports</CardTitle>
              <span className="text-[10px] text-gray-400 font-medium">{d.recentReports.length} recent</span>
            </div>
          </CardHeader>
          <CardContent className="px-0 pb-1">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 px-3 font-medium text-gray-400 uppercase tracking-wider">Patient</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-400 uppercase tracking-wider">Mobile</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-400 uppercase tracking-wider hidden sm:table-cell">Booking</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-400 uppercase tracking-wider hidden sm:table-cell">Date</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-400 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {d.recentReports.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-6 text-gray-300 text-xs">No reports uploaded</td></tr>
                ) : (
                  d.recentReports.map((r: any, i: number) => (
                    <tr key={r._id || i} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="py-2 px-3 font-medium text-gray-800">{r.patientName}</td>
                      <td className="py-2 px-3 text-gray-500 text-[10px]">{r.mobileNumber}</td>
                      <td className="py-2 px-3 text-gray-500 text-[10px] hidden sm:table-cell">#{r.booking?.bookingId || 'N/A'}</td>
                      <td className="py-2 px-3 text-gray-500 text-[10px] hidden sm:table-cell">{formatDate(r.createdAt)}</td>
                      <td className="py-2 px-3"><StatusBadge status={r.status} /></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MiniStat label="Total Users" value={d.totalUsers} icon={Users} />
        <MiniStat label="Lab Tests" value={d.labBookings} icon={Syringe} />
        <MiniStat label="Radiology" value={d.radiologyBookings} icon={Radio} />
        <MiniStat label="Health Packages" value={d.healthPackageBookings} icon={Package} />
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
    <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3 shadow-sm">
      <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${colors[color]} flex items-center justify-center shrink-0 shadow-sm`}>
        <Icon className="w-4 h-4 text-white" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider truncate">{label}</p>
        <p className="text-sm font-bold text-gray-900 mt-0.5">{typeof value === 'number' ? value.toLocaleString('en-IN') : value}</p>
      </div>
    </div>
  )
}

function MiniStat({ label, value, icon: Icon }: { label: string; value: number; icon: any }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-3 flex items-center gap-2.5 shadow-sm">
      <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
        <Icon className="w-3.5 h-3.5 text-gray-500" />
      </div>
      <div>
        <p className="text-[9px] font-medium text-gray-400 uppercase tracking-wider">{label}</p>
        <p className="text-xs font-bold text-gray-900">{value.toLocaleString('en-IN')}</p>
      </div>
    </div>
  )
}

function ActionRow({ icon: Icon, label, color, href }: { icon: any; label: string; color: string; href: string }) {
  const dotColors: Record<string, string> = { blue: 'bg-blue-400', emerald: 'bg-emerald-400', purple: 'bg-purple-400', teal: 'bg-teal-400', cyan: 'bg-cyan-400', rose: 'bg-rose-400' }
  return (
    <a href={href} className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors group cursor-pointer">
      <div className="flex items-center gap-2.5">
        <span className={`w-2 h-2 rounded-full ${dotColors[color]}`} />
        <span className="text-xs font-medium text-gray-600 group-hover:text-gray-900">{label}</span>
      </div>
      <ArrowRight className="w-3 h-3 text-gray-300 group-hover:text-brand-500 transition-colors" />
    </a>
  )
}

function TaskRow({ label, count, color, showZero }: { label: string; count: number; color: string; showZero?: boolean }) {
  if (count === 0 && !showZero) return null
  const colors: Record<string, string> = { amber: 'text-amber-600 bg-amber-50', blue: 'text-blue-600 bg-blue-50', violet: 'text-violet-600 bg-violet-50', emerald: 'text-emerald-600 bg-emerald-50', green: 'text-green-600 bg-green-50' }
  return (
    <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50/50">
      <span className="text-xs text-gray-600">{label}</span>
      <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${colors[color]}`}>{count}</span>
    </div>
  )
}
