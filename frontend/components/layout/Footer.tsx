'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  MapPin, Phone, Mail, ChevronRight, MessageCircle, Globe,
} from 'lucide-react'
import api from '@/lib/api'
import { BRAND, MAP_LINKS } from '@/lib/site'

const quickLinks = [
  { href: '/about', label: 'About Us' },
  { href: '/tests', label: 'Laboratory Services' },
  { href: '/radiology', label: 'Radiology Services' },
  { href: '/health-packages', label: 'Health Packages' },
  { href: '/find-a-centre', label: 'Find a Centre' },
  { href: '/track-order', label: 'Download Report' },
]

const services = ['Blood Tests', 'Health Checkups', 'X-Ray & Imaging', 'ECG & Cardiac', 'Home Collection']

interface FooterSettings {
  address?: string
  phone?: string
  email?: string
  facebook?: string
  instagram?: string
  whatsapp?: string
  youtube?: string
  linkedin?: string
  twitter?: string
}

const defaultSettings: FooterSettings = {
  address: 'Plot No. 347 HMT Hills Kukatpally Hyderabad - 500085',
  phone: '9440626892',
  email: 'anjalidiagnostics1602@gmail.com',
}

const socialIconMap: Record<string, React.ElementType> = {
  facebook: Globe,
  instagram: Globe,
  whatsapp: MessageCircle,
  youtube: Globe,
  linkedin: Globe,
  twitter: Globe,
}

export default function Footer() {
  const [settings, setSettings] = useState<FooterSettings>(defaultSettings)
  const fetchedRef = useRef(false)

  useEffect(() => {
    if (fetchedRef.current) return
    fetchedRef.current = true
    api.get('/settings').then((res) => {
      if (res.data) setSettings((prev) => ({ ...prev, ...res.data }))
    }).catch(() => {})
  }, [])

  return (
    <footer className="border-t border-gray-100 bg-[#F8FBFC]">
      <div className="mx-auto max-w-7xl px-4 pb-5 pt-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <Link href="/" className="mb-4 flex items-center gap-3">
              <div className="relative h-14 w-14 overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm">
                <Image src={BRAND.logo} alt={BRAND.fullName} fill className="object-cover p-1.5" sizes="56px" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-800">{BRAND.name}</p>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#1BAE9A]">Centre</p>
              </div>
            </Link>

            <p className="mb-4 text-sm font-medium leading-relaxed text-gray-600">
              {BRAND.tagline}. Accurate testing, reliable reporting, and patient-focused care.
            </p>

            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#1BAE9A]" />
                <a
                  href={MAP_LINKS.place}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium leading-relaxed text-gray-700 transition-colors hover:text-[#1BAE9A]"
                >
                  {settings.address}
                </a>
              </div>

              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-[#4CAF50]" />
                <a href={`tel:${settings.phone}`} className="text-sm font-medium text-gray-700 hover:text-[#1BAE9A]">
                  {settings.phone}
                </a>
              </div>

              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-[#1BAE9A]" />
                <a href={`mailto:${settings.email}`} className="text-sm font-medium text-gray-700 hover:text-[#1BAE9A]">
                  {settings.email}
                </a>
              </div>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold text-gray-800">Quick Links</h3>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="flex items-center gap-2 text-sm font-medium text-gray-700 transition-colors hover:text-[#1BAE9A]">
                    <ChevronRight className="h-3.5 w-3.5 text-[#1BAE9A]" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold text-gray-800">Services</h3>
            <ul className="space-y-2.5">
              {services.map((service) => (
                <li key={service} className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <ChevronRight className="h-3.5 w-3.5 text-[#4CAF50]" />
                  {service}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold text-gray-800">Connect</h3>
            <div className="mb-4 flex flex-wrap gap-2">
              {['facebook', 'instagram', 'whatsapp', 'youtube', 'linkedin', 'twitter'].map((platform) => {
                const url = (settings as Record<string, string | undefined>)[platform]
                const Icon = socialIconMap[platform]

                return (
                  <a
                    key={platform}
                    href={url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 transition-all hover:border-[#1BAE9A] hover:bg-[#1BAE9A] hover:text-white"
                    aria-label={platform}
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                )
              })}
            </div>

            <Link href="/booking" className="text-sm font-semibold text-[#1BAE9A] hover:underline">
              Book a Test
            </Link>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-200 pt-4">
          <p className="text-center text-sm font-medium text-gray-700">
            &copy; {new Date().getFullYear()} {BRAND.fullName}. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
