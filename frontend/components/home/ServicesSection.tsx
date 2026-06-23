'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Scan, Heart, Brain, Activity, Stethoscope, Microscope,
  Shield, ArrowRight, ChevronRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import api from '@/lib/api'

const iconMap: Record<string, any> = {
  'MRI': Brain,
  'CT': Scan,
  'PET': Scan,
  'Ultrasound': Heart,
  'X-Ray': Activity,
  'Mammography': Scan,
  'Nuclear': Microscope,
  'Cardiac': Heart,
  'Cardiology': Heart,
  'Neuro': Activity,
  'Gastro': Stethoscope,
  'General': Shield,
}

function getIcon(name: string) {
  for (const [key, icon] of Object.entries(iconMap)) {
    if (name.toLowerCase().includes(key.toLowerCase())) return icon
  }
  return Shield
}

const colorPalette = ['#1BAE9A', '#4CAF50', '#0D47A1', '#00B8A9']

export default function ServicesSection() {
  const [services, setServices] = useState<any[]>([])

  useEffect(() => {
    api.get('/radiology?isActive=true&limit=8')
      .then(res => {
        const data = res.data?.services || res.data || []
        setServices(Array.isArray(data) ? data.slice(0, 8) : [])
      })
      .catch(() => {})
  }, [])

  if (services.length === 0) return null

  return (
    <section className="relative py-20 md:py-24 bg-[#F8FBFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-14"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1BAE9A]/5 border border-[#1BAE9A]/10 mb-4">
            <Shield className="w-4 h-4 text-[#1BAE9A]" />
            <span className="text-sm font-medium text-[#1BAE9A]">Our Services</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Comprehensive Diagnostic Services
          </h2>
          <p className="text-lg text-gray-500">
            Advanced diagnostic technology across multiple specialities
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, i) => {
            const Icon = getIcon(service.name)
            const color = colorPalette[i % colorPalette.length]
            const bg = `bg-[${color}]/5`
            return (
              <motion.div
                key={service._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="group bg-white rounded-2xl border border-gray-100 p-6 card-hover"
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`} style={{ backgroundColor: color + '15' }}>
                  <Icon className="w-7 h-7" style={{ color }} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{service.name}</h3>
                <p className="text-sm text-gray-500 mb-5 leading-relaxed line-clamp-3">{service.description}</p>
                <Link href="/booking" className="inline-flex items-center gap-1 text-sm font-medium text-[#1BAE9A] hover:text-[#168E7E] transition-colors">
                  Know More
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
