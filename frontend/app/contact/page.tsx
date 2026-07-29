'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react'
import api from '@/lib/api'
import Footer from '@/components/layout/Footer'
import PageTransition from '@/components/layout/PageTransition'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { enquirySchema, type EnquiryFormData } from '@/lib/validations'
import toast from 'react-hot-toast'
import { BRAND, MAP_LINKS } from '@/lib/site'

interface ContactInfo {
  address: string
  phone: string
  email: string
  workingHours: string
}

const defaultInfo: ContactInfo = {
  address: `Plot No. 347, HMT Hills,
Opp. Community Hall, Beside Park,
Opp. JNTU, Kukatpally,
Hyderabad – 500085,
Telangana, India`,
  phone: `+91 9989220938
+91 9440626892
040-40147350`,
  email: 'anjalidiagnostics1602@gmail.com',
  workingHours: 'Monday - Saturday\n6:00 AM - 10:00 PM',
}

export default function ContactPage() {
  const [info, setInfo] = useState<ContactInfo>(defaultInfo)

  useEffect(() => {
    api.get('/settings').then((res) => {
      if (res.data) setInfo((prev) => ({ ...prev, ...res.data }))
    }).catch(() => {})
    document.title = `Contact Us | ${BRAND.fullName}`
  }, [])

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EnquiryFormData>({
    resolver: zodResolver(enquirySchema),
  })

  const onSubmit = async (data: EnquiryFormData) => {
    try {
      await api.post('/enquiries', data)
      toast.success('Message sent successfully.')
      reset()
    } catch {
      toast.error('Failed to send message. Please try again.')
    }
  }

  const contactItems = [
    { icon: MapPin, title: 'Address', content: info.address },
    { icon: Phone, title: 'Phone Numbers', content: info.phone },
    { icon: Mail, title: 'Email', content: info.email, href: `mailto:${info.email}` },
    { icon: Clock, title: 'Working Hours', content: info.workingHours },
  ]

  return (
    <>
      <main className="min-h-screen">
        <PageTransition>
          <HeroBanner />

          <section className="bg-white py-16 sm:py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="space-y-6"
                >
                  <div className="rounded-[1.75rem] border border-gray-100 bg-[#F8FBFC] p-6 shadow-sm">
                    <div className="mb-6 flex items-center gap-4">
                      <div className="relative h-16 w-16 overflow-hidden rounded-2xl border border-emerald-100 bg-white">
                        <Image src={BRAND.logo} alt={BRAND.fullName} fill className="object-cover p-1.5" sizes="64px" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">Get in Touch</h2>
                        <p className="text-sm text-gray-500">Reach us by phone, email, or visit our centre.</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {contactItems.map((item) => (
                        <div key={item.title} className="flex items-start gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-50">
                            <item.icon className="h-5 w-5 text-brand-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="mb-1 text-sm font-semibold text-gray-900">{item.title}</p>
                            {item.title === 'Phone Numbers' ? (
                              <div className="space-y-1">
                                {item.content.split('\n').map((line, i) => {
                                  const digits = line.replace(/[^\d+]/g, '')
                                  return (
                                    <a
                                      key={i}
                                      href={`tel:${digits}`}
                                      className="block text-sm leading-relaxed text-gray-600 transition-colors hover:text-brand-600"
                                    >
                                      {line}
                                    </a>
                                  )
                                })}
                              </div>
                            ) : item.href ? (
                              <a href={item.href} className="text-sm leading-relaxed text-gray-600 transition-colors hover:text-brand-600">
                                {item.content}
                              </a>
                            ) : (
                              <p className="whitespace-pre-line text-sm leading-relaxed text-gray-600">{item.content}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    <a
                      href={MAP_LINKS.place}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-6 inline-flex text-sm font-semibold text-brand-600 hover:underline"
                    >
                      Open Google Maps Directions →
                    </a>
                  </div>

                  <div className="h-72 overflow-hidden rounded-[1.75rem] border border-gray-100 shadow-sm">
                    <iframe
                      src={MAP_LINKS.embed}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Anjali Diagnostics Centre map"
                    />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  <div className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-lg sm:p-8">
                    <div className="mb-6">
                      <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">Send Us a Message</h2>
                      <p className="mt-2 text-sm leading-relaxed text-gray-500">
                        Share your question and our team will respond as soon as possible.
                      </p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Input
                          label="Your Name"
                          placeholder="Enter your full name"
                          {...register('name')}
                          error={errors.name?.message}
                        />
                        <Input
                          label="Phone Number"
                          placeholder="Enter your phone number"
                          {...register('mobileNumber')}
                          error={errors.mobileNumber?.message}
                        />
                      </div>

                      <Input
                        label="Email"
                        type="email"
                        placeholder="Enter your email"
                        {...register('email')}
                        error={errors.email?.message}
                      />

                      <Textarea
                        label="Message"
                        placeholder="Write your message here..."
                        rows={6}
                        {...register('message')}
                        error={errors.message?.message}
                      />

                      <Button
                        type="submit"
                        size="lg"
                        className="w-full justify-center gap-2 bg-[#1BAE9A] text-white shadow-lg shadow-[#1BAE9A]/25 hover:bg-[#168E7E]"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Sending...' : (
                          <>
                            <Send className="h-4 w-4" />
                            Send Message
                          </>
                        )}
                      </Button>
                    </form>
                  </div>
                </motion.div>
              </div>
            </div>
          </section>
        </PageTransition>
      </main>
      <Footer />
    </>
  )
}

function HeroBanner() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-brand-950 via-brand-900 to-brand-800">
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl text-center"
        >
          <h1 className="mb-4 text-4xl font-bold text-white sm:text-5xl">Contact Us</h1>
          <p className="text-lg leading-relaxed text-brand-100/85">
            Reach {BRAND.fullName} for centre information, contact details, and working hours.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
