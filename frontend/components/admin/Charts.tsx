"use client"

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const COLORS = ['#1470f5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-gray-200 bg-white/95 backdrop-blur-sm px-3 py-2 shadow-lg text-sm">
      <p className="text-gray-500 mb-1">{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} className="font-medium" style={{ color: entry.color }}>
          {entry.name}: {entry.value.toLocaleString('en-IN')}
        </p>
      ))}
    </div>
  )
}

interface MonthlyData {
  month: string
  bookings: number
  revenue?: number
}

interface StatusData {
  name: string
  value: number
}

interface TestData {
  name: string
  bookings: number
  revenue?: number
}

interface MonthlyBookingsChartProps {
  data: MonthlyData[]
  className?: string
}

interface StatusDistributionChartProps {
  data: StatusData[]
  className?: string
}

interface PopularTestsChartProps {
  data: TestData[]
  className?: string
}

export function MonthlyBookingsChart({ data, className }: MonthlyBookingsChartProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}
    >
      <Card className={cn('border-gray-200', className)}>
        <CardHeader>
          <CardTitle className="text-base">Monthly Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} barSize={32} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                <Bar
                  dataKey="bookings"
                  fill="#1470f5"
                  radius={[6, 6, 0, 0]}
                  animationBegin={300}
                  animationDuration={800}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export function StatusDistributionChart({ data, className }: StatusDistributionChartProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: 0.15 }}
    >
      <Card className={cn('border-gray-200', className)}>
        <CardHeader>
          <CardTitle className="text-base">Booking Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                  animationBegin={300}
                  animationDuration={800}
                >
                  {data.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 12, paddingTop: 16 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export function PopularTestsChart({ data, className }: PopularTestsChartProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <Card className={cn('border-gray-200', className)}>
        <CardHeader>
          <CardTitle className="text-base">Popular Tests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} layout="vertical" barSize={24} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  axisLine={false}
                  tickLine={false}
                  width={140}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                <Bar
                  dataKey="bookings"
                  fill="#10b981"
                  radius={[0, 6, 6, 0]}
                  animationBegin={300}
                  animationDuration={800}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
