'use client'

import { useState, useEffect, useRef } from 'react'
import { MapPin, Phone, Mail, Clock } from 'lucide-react'
import api from '@/lib/api'

export default function TopHeader() {
  const [settings, setSettings] = useState<Record<string, string>>({})
  const fetchedRef = useRef(false)

  useEffect(() => {
    if (fetchedRef.current) return
    fetchedRef.current = true
    api.get('/settings').then((res) => {
      if (res.data) setSettings(res.data)
    }).catch(() => {})
  }, [])

  return (
    <div className="hidden border-b border-[#CFE9E3] bg-[linear-gradient(90deg,#E8F8F5_0%,#D6F5EF_55%,#EDF8FF_100%)] text-sm text-gray-700 lg:block">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-9 items-center justify-between gap-4">
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-[#0F766E]" />
              <span className="max-w-[280px] truncate text-gray-700">
                {settings.address || 'Plot No. 347 HMT Hills Kukatpally Hyderabad - 500085'}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 text-[#14846F]" />
              <a href={`tel:${settings.phone || '9989220938'}`} className="text-gray-700 transition-colors hover:text-[#0F9A88]">
                {settings.phone || '9989220938'}
              </a>
            </div>
            <div className="flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-[#0F766E]" />
              <a href={`mailto:${settings.email || 'anjalidiagnostics1602@gmail.com'}`} className="text-gray-700 transition-colors hover:text-[#0F9A88]">
                {settings.email || 'anjalidiagnostics1602@gmail.com'}
              </a>
            </div>
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-white/70 bg-white/50 px-3 py-1 shadow-sm backdrop-blur-sm">
            <Clock className="h-3.5 w-3.5 text-[#14846F]" />
            <span className="text-gray-700">
              {settings.workingHours || 'Mon - Sat: 7:00 AM - 8:00 PM'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
