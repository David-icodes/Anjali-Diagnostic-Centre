'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Microscope,
  MapPin,
  Phone,
  Mail,
  Clock,
  ArrowUpRight,
  Facebook,
  Instagram,
  MessageCircle,
  Youtube,
  Linkedin,
  Twitter,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import axios from 'axios'
import toast from 'react-hot-toast'

interface SocialLink {
  platform: string
  url: string
  icon: string
}

interface FooterSettings {
  name: string
  address: string
  phone: string
  email: string
  workingHours: string
  socialLinks: SocialLink[]
  description: string
}

const defaultSettings: FooterSettings = {
  name: 'Anjali Diagnostic Centre',
  address: '123, Healthcare Complex, Main Road, City - 000000',
  phone: '+91 99999 99999',
  email: 'info@anjalidiagnostic.com',
  workingHours: 'Mon - Sat: 7:00 AM - 8:00 PM\nSun: 7:00 AM - 2:00 PM',
  socialLinks: [],
  description:
    'Providing accurate diagnostic services with cutting-edge technology and experienced professionals. Your health is our priority.',
}

const quickLinks = [
  { href: '/about', label: 'About Us' },
  { href: '/tests', label: 'Our Tests' },
  { href: '/book-test', label: 'Book a Test' },
  { href: '/track-order', label: 'Track Order' },
  { href: '/contact', label: 'Contact Us' },
  { href: '/privacy-policy', label: 'Privacy Policy' },
  { href: '/terms', label: 'Terms & Conditions' },
]

const socialIconMap: Record<string, React.ElementType> = {
  facebook: Facebook,
  instagram: Instagram,
  whatsapp: MessageCircle,
  youtube: Youtube,
  linkedin: Linkedin,
  twitter: Twitter,
}

function SocialIcon({ platform }: { platform: string }) {
  const Icon = socialIconMap[platform.toLowerCase()]
  return Icon ? <Icon className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />
}

export default function Footer() {
  const [settings, setSettings] = useState<FooterSettings>(defaultSettings)

  useEffect(() => {
    axios
      .get('/api/settings/public')
      .then((res) => {
        if (res.data?.settings) {
          setSettings((prev) => ({ ...prev, ...res.data.settings }))
        }
      })
      .catch(() => {
        toast.error('Failed to load footer settings')
      })
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  }

  return (
    <footer className="relative overflow-hidden bg-gradient-to-br from-brand-950 via-brand-900 to-brand-800">
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-brand-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8"
        >
          <motion.div variants={itemVariants} className="lg:col-span-5">
            <Link href="/" className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shadow-lg shadow-brand-500/30">
                <Microscope className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-xl font-bold text-white leading-tight">Anjali Diagnostic</p>
                <p className="text-sm text-brand-300 font-medium leading-tight -mt-0.5">Centre</p>
              </div>
            </Link>
            <p className="text-brand-200/80 text-sm leading-relaxed mb-6 max-w-md">
              {settings.description}
            </p>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-brand-400 mt-0.5 shrink-0" />
                <span className="text-brand-200 text-sm">{settings.address}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-brand-400 shrink-0" />
                <a href={`tel:${settings.phone}`} className="text-brand-200 text-sm hover:text-white transition-colors">
                  {settings.phone}
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-brand-400 shrink-0" />
                <a href={`mailto:${settings.email}`} className="text-brand-200 text-sm hover:text-white transition-colors">
                  {settings.email}
                </a>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-brand-400 mt-0.5 shrink-0" />
                <span className="text-brand-200 text-sm whitespace-pre-line">{settings.workingHours}</span>
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="lg:col-span-3">
            <h3 className="text-white font-semibold text-base mb-5">Quick Links</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-brand-200/80 text-sm hover:text-white transition-colors duration-200 flex items-center gap-1.5 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-brand-400 group-hover:w-2 transition-all" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div variants={itemVariants} className="lg:col-span-4">
            <h3 className="text-white font-semibold text-base mb-5">Connect With Us</h3>
            <p className="text-brand-200/80 text-sm mb-5">
              Follow us on social media for health tips, updates, and more.
            </p>
            <div className="flex flex-wrap gap-3">
              {settings.socialLinks.length > 0 ? (
                settings.socialLinks.map((social) => (
                  <a
                    key={social.platform}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-brand-300 hover:bg-brand-500 hover:text-white hover:border-brand-500 transition-all duration-300 hover:scale-110 hover:-translate-y-1"
                    aria-label={social.platform}
                  >
                    <SocialIcon platform={social.platform} />
                  </a>
                ))
              ) : (
                <>
                  {['facebook', 'instagram', 'whatsapp', 'youtube', 'linkedin', 'twitter'].map((platform) => (
                    <a
                      key={platform}
                      href="#"
                      className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-brand-300 hover:bg-brand-500 hover:text-white hover:border-brand-500 transition-all duration-300 hover:scale-110 hover:-translate-y-1"
                      aria-label={platform}
                    >
                      <SocialIcon platform={platform} />
                    </a>
                  ))}
                </>
              )}
            </div>
            <div className="mt-6">
              <Link href="/book-test">
                <Button variant="gradient" size="sm" className="w-full sm:w-auto">
                  Book Appointment
                </Button>
              </Link>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-12 pt-8 border-t border-white/10"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-brand-300/60 text-xs text-center md:text-left">
              &copy; {new Date().getFullYear()} {settings.name}. All rights reserved.
            </p>
            <p className="text-brand-300/40 text-xs">
              Committed to accurate diagnostics &middot; Caring for your health
            </p>
          </div>
        </motion.div>
      </div>
    </footer>
  )
}
