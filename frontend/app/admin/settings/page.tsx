'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Save, MapPin, Globe } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface Settings {
  contact: {
    address: string
    phone: string
    email: string
    workingHours: string
  }
  social: {
    facebook: string
    instagram: string
    whatsapp: string
    youtube: string
    linkedin: string
    twitter: string
  }
}

const defaultSettings: Settings = {
  contact: { address: '', phone: '', email: '', workingHours: '' },
  social: { facebook: '', instagram: '', whatsapp: '', youtube: '', linkedin: '', twitter: '' },
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(defaultSettings)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const { data } = await api.get('/settings')
      setSettings({
        contact: {
          address: data.address || '',
          phone: data.phone || '',
          email: data.email || '',
          workingHours: data.workingHours || '',
        },
        social: {
          facebook: data.facebook || '',
          instagram: data.instagram || '',
          whatsapp: data.whatsapp || '',
          youtube: data.youtube || '',
          linkedin: data.linkedin || '',
          twitter: data.twitter || '',
        },
      })
    } catch {
      toast.error('Failed to fetch settings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchSettings() }, [])

  const saveSection = async (section: keyof Settings, payload: Record<string, string>) => {
    setSaving(section)
    try {
      await api.put(section === 'social' ? '/settings/social' : '/settings', payload)
      toast.success(`${section === 'contact' ? 'Contact' : 'Social'} settings saved`)
      fetchSettings()
    } catch {
      toast.error(`Failed to save ${section} settings`)
    } finally {
      setSaving(null)
    }
  }

  const handleContactSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    await saveSection('contact', {
      address: (form.elements.namedItem('address') as HTMLTextAreaElement).value,
      phone: (form.elements.namedItem('phone') as HTMLInputElement).value,
      email: (form.elements.namedItem('email') as HTMLInputElement).value,
      workingHours: (form.elements.namedItem('workingHours') as HTMLTextAreaElement).value,
    })
  }

  const handleSocialSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    await saveSection('social', {
      facebook: (form.elements.namedItem('facebook') as HTMLInputElement).value,
      instagram: (form.elements.namedItem('instagram') as HTMLInputElement).value,
      whatsapp: (form.elements.namedItem('whatsapp') as HTMLInputElement).value,
      youtube: (form.elements.namedItem('youtube') as HTMLInputElement).value,
      linkedin: (form.elements.namedItem('linkedin') as HTMLInputElement).value,
      twitter: (form.elements.namedItem('twitter') as HTMLInputElement).value,
    })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2].map((i) => (
          <Card key={i}>
            <CardHeader><Skeleton className="h-6 w-48" /></CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Website Settings</h1>
        <p className="mt-1 text-gray-500">Manage contact and social information used across the website.</p>
      </div>

      <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleContactSave}>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-blue-600" />
              <div>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>Address, phone, email, and working hours</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              id="address"
              label="Address"
              defaultValue={settings.contact.address}
              placeholder="Enter centre address"
            />
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                id="phone"
                label="Phone"
                defaultValue={settings.contact.phone}
                placeholder="+91 98765 43210"
              />
              <Input
                id="email"
                label="Email"
                type="email"
                defaultValue={settings.contact.email}
                placeholder="info@anjalidiagnostics.com"
              />
            </div>
            <Textarea
              id="workingHours"
              label="Working Hours"
              defaultValue={settings.contact.workingHours}
              placeholder="Mon - Sat: 7:00 AM - 8:00 PM"
              rows={4}
            />
            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={saving === 'contact'} className="gap-2">
                <Save className="h-4 w-4" />
                {saving === 'contact' ? 'Saving...' : 'Save Contact Info'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.form>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onSubmit={handleSocialSave}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Globe className="h-5 w-5 text-blue-600" />
              <div>
                <CardTitle>Social Media Links</CardTitle>
                <CardDescription>Connect your social media profiles</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Input id="facebook" label="Facebook URL" defaultValue={settings.social.facebook} placeholder="https://facebook.com/..." />
              <Input id="instagram" label="Instagram URL" defaultValue={settings.social.instagram} placeholder="https://instagram.com/..." />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Input id="whatsapp" label="WhatsApp Number/Link" defaultValue={settings.social.whatsapp} placeholder="https://wa.me/..." />
              <Input id="youtube" label="YouTube URL" defaultValue={settings.social.youtube} placeholder="https://youtube.com/..." />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Input id="linkedin" label="LinkedIn URL" defaultValue={settings.social.linkedin} placeholder="https://linkedin.com/..." />
              <Input id="twitter" label="Twitter URL" defaultValue={settings.social.twitter} placeholder="https://twitter.com/..." />
            </div>
            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={saving === 'social'} className="gap-2">
                <Save className="h-4 w-4" />
                {saving === 'social' ? 'Saving...' : 'Save Social Links'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.form>
    </div>
  )
}
