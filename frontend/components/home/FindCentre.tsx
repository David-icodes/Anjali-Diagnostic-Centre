'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { MapPin, Phone, Navigation, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import api from '@/lib/api'
import { BRAND, CENTRE_IMAGES, MAP_LINKS } from '@/lib/site'

export default function FindCentre() {
  const [settings, setSettings] = useState<Record<string, string>>({})
  const fetched = useRef(false)

  useEffect(() => {
    if (fetched.current) return
    fetched.current = true
    api.get('/settings').then((res) => {
      if (res.data) setSettings(res.data)
    }).catch(() => {})
  }, [])

  const address = settings.address || 'Plot No. 347 HMT Hills Kukatpally Hyderabad - 500085'
  const phone = settings.phone || '9440626892'
  const email = settings.email || 'anjalidiagnostics1602@gmail.com'

  return (
    <section className="relative overflow-hidden bg-white py-16 md:py-20">
      <div className="absolute left-0 top-0 h-[380px] w-[380px] rounded-full bg-[#4CAF50]/5 blur-[100px]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto mb-12 max-w-3xl text-center"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#0D47A1]/10 bg-[#0D47A1]/5 px-4 py-2">
            <MapPin className="h-4 w-4 text-[#0D47A1]" />
            <span className="text-sm font-medium text-[#0D47A1]">Find a Centre</span>
          </div>
          <h2 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl lg:text-5xl">
            Visit {BRAND.name}
          </h2>
          <p className="text-lg text-gray-600">
            Location information, contact details, and direct Google Maps directions for our centre.
          </p>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <div className="overflow-hidden rounded-[2rem] border border-gray-100 bg-white shadow-sm">
              <div className="relative aspect-[4/3]">
                <Image src={CENTRE_IMAGES.exterior} alt="Anjali Diagnostics centre" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 40vw" />
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-gray-100 bg-[#F8FBFC] p-6 shadow-sm">
              <h3 className="mb-4 text-xl font-semibold text-gray-900">Location Information</h3>
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#0D47A1]/5">
                  <MapPin className="h-6 w-6 text-[#0D47A1]" />
                </div>
                <p className="text-sm leading-relaxed text-gray-600">{address}</p>
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-gray-100 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-xl font-semibold text-gray-900">Contact Details</h3>
              <div className="space-y-4">
                <a href={`tel:${phone}`} className="flex items-center gap-4 text-sm text-gray-700 transition-colors hover:text-[#0D47A1]">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#4CAF50]/5">
                    <Phone className="h-5 w-5 text-[#4CAF50]" />
                  </div>
                  {phone}
                </a>
                <a href={`mailto:${email}`} className="flex items-center gap-4 text-sm text-gray-700 transition-colors hover:text-[#0D47A1]">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-50">
                    <Mail className="h-5 w-5 text-brand-600" />
                  </div>
                  {email}
                </a>
              </div>
            </div>

            <a href={MAP_LINKS.place} target="_blank" rel="noopener noreferrer" className="block">
              <Button size="lg" className="w-full bg-gradient-to-r from-[#0D47A1] to-[#1976D2] shadow-lg shadow-[#0D47A1]/25">
                <Navigation className="mr-2 h-5 w-5" />
                Google Maps Directions
              </Button>
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <div className="rounded-[1.75rem] border border-gray-100 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-4">
                <div className="relative h-16 w-16 overflow-hidden rounded-2xl border border-emerald-100 bg-white">
                  <Image src={BRAND.logo} alt={BRAND.fullName} fill className="object-cover p-1.5" sizes="64px" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{BRAND.fullName}</h3>
                  <p className="text-sm text-gray-500">Google Maps Directions</p>
                </div>
              </div>

              <div className="overflow-hidden rounded-[1.5rem] border border-gray-100 shadow-sm h-[500px]">
                <iframe
                  src={MAP_LINKS.embed}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Anjali Diagnostics Centre Location"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
