'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Scan, Brain, Heart, Activity, Sparkles, ChevronRight, ArrowRight } from 'lucide-react'
import Footer from '@/components/layout/Footer'
import PageTransition from '@/components/layout/PageTransition'
import { Button } from '@/components/ui/button'
import api from '@/lib/api'

const iconMap: Record<string, any> = {
  'MRI': Brain,
  'MRI 3T': Brain,
  'CT': Scan,
  'PET': Scan,
  'Ultrasound': Heart,
  'X-Ray': Activity,
  'Mammography': Scan,
  'Nuclear': Heart,
  'General': Scan,
}

function getIcon(name: string) {
  for (const [key, icon] of Object.entries(iconMap)) {
    if (name.toLowerCase().includes(key.toLowerCase())) return icon
  }
  return Scan
}

const colorPalette = ['#1BAE9A', '#4CAF50', '#0D47A1', '#00B8A9', '#6366f1', '#e91e63']

export default function RadiologyPage() {
  const [services, setServices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/radiology?isActive=true')
      .then(res => {
        const data = res.data?.services || res.data || []
        setServices(Array.isArray(data) ? data : [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      <main className="min-h-screen">
        <PageTransition>
          <section className="relative overflow-hidden bg-gradient-to-br from-[#4CAF50] to-[#388E3C] min-h-[30vh] flex items-center">
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03]" />
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/10 rounded-full blur-[80px]" />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full relative">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white/90 text-sm font-medium mb-6 border border-white/20">
                  <Sparkles className="w-4 h-4" /> Radiology Services
                </div>
                <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight mb-4">
                  Radiology & Imaging
                </h1>
                <p className="text-lg text-white/80 max-w-xl mx-auto">
                  Advanced imaging services with expert radiologists
                </p>
              </motion.div>
            </div>
          </section>

          <section className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {loading ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
                      <div className="h-40 bg-gray-100" />
                      <div className="p-5 space-y-3">
                        <div className="h-5 bg-gray-100 rounded w-3/4" />
                        <div className="h-4 bg-gray-100 rounded w-full" />
                        <div className="h-4 bg-gray-100 rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : services.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-gray-400 text-lg">No radiology services available at the moment.</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {services.map((service, i) => {
                    const Icon = getIcon(service.name)
                    const color = colorPalette[i % colorPalette.length]
                    return (
                      <motion.div
                        key={service._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="group bg-white rounded-2xl border border-gray-100 overflow-hidden card-hover"
                      >
                        <div className="h-40 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                          <div className="w-20 h-20 rounded-2xl flex items-center justify-center" style={{ backgroundColor: color + '15' }}>
                            <Icon className="w-10 h-10" style={{ color }} />
                          </div>
                        </div>
                        <div className="p-5">
                          <h3 className="text-lg font-bold text-gray-900 mb-2">{service.name}</h3>
                          <p className="text-sm text-gray-500 mb-3 leading-relaxed line-clamp-3">{service.description}</p>
                          <p className="text-lg font-bold text-gray-900 mb-4">₹{service.price?.toLocaleString('en-IN')}</p>
                          {service.duration && (
                            <p className="text-xs text-gray-400 mb-4">Duration: {service.duration}</p>
                          )}
                          <div className="flex gap-2">
                            <Link href="/booking">
                              <Button size="sm" className="bg-[#1BAE9A] hover:bg-[#168E7E] text-white text-xs">Book Now</Button>
                            </Link>
                            <Link href="/contact">
                              <Button variant="outline" size="sm" className="text-xs border-gray-200">Know More</Button>
                            </Link>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </div>
          </section>
        </PageTransition>
      </main>
      <Footer />
    </>
  )
}
