'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  MapPin, Phone, Mail, Clock, Send,
  Sparkles,
} from 'lucide-react'
import api from '@/lib/api'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import PageTransition from '@/components/layout/PageTransition'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { enquirySchema, type EnquiryFormData } from '@/lib/validations'
import toast from 'react-hot-toast'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: 'easeOut' },
  }),
}

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
}

interface ContactInfo {
  address: string
  phone: string
  email: string
  workingHours: string
}

const defaultInfo: ContactInfo = {
  address: '123, Healthcare Complex, Main Road, City - 000000',
  phone: '+91 99999 99999',
  email: 'info@anjalidiagnostic.com',
  workingHours: 'Mon - Sat: 7:00 AM - 8:00 PM\nSun: 7:00 AM - 2:00 PM',
}

export default function ContactPage() {
  const [info, setInfo] = useState<ContactInfo>(defaultInfo)

  useEffect(() => {
    api.get('/settings/public').then((res) => {
      if (res.data?.settings) {
        const s = res.data.settings
        setInfo((prev) => ({ ...prev, ...s }))
      }
    }).catch(() => {})
    document.title = 'Contact Us | Anjali Diagnostic Centre'
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
      toast.success('Message sent successfully! We will get back to you soon.')
      reset()
    } catch {
      toast.error('Failed to send message. Please try again.')
    }
  }

  const contactItems = [
    { icon: MapPin, title: 'Our Address', content: info.address },
    { icon: Phone, title: 'Phone Number', content: info.phone, href: `tel:${info.phone.replace(/\s/g, '')}` },
    { icon: Mail, title: 'Email Address', content: info.email, href: `mailto:${info.email}` },
    { icon: Clock, title: 'Working Hours', content: info.workingHours },
  ]

  return (
    <>
      <Header />
      <main className="min-h-screen pt-20">
        <PageTransition>
          <HeroBanner />
          <section className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid lg:grid-cols-5 gap-10">
                <motion.div
                  variants={stagger}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="lg:col-span-2 space-y-4"
                >
                  {contactItems.map((item, i) => (
                    <motion.div
                      key={item.title}
                      variants={fadeUp}
                      custom={i}
                      whileHover={{ x: 4 }}
                      className="flex items-start gap-4 p-5 rounded-xl border border-gray-100 bg-white hover:border-brand-200 hover:shadow-md transition-all"
                    >
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-50 to-brand-100 flex items-center justify-center shrink-0">
                        <item.icon className="w-5 h-5 text-brand-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-brand-950 mb-0.5">{item.title}</p>
                        {item.href ? (
                          <a href={item.href} className="text-sm text-gray-500 hover:text-brand-600 transition-colors">
                            {item.content}
                          </a>
                        ) : (
                          <p className="text-sm text-gray-500 whitespace-pre-line">{item.content}</p>
                        )}
                      </div>
                    </motion.div>
                  ))}

                  <motion.div
                    variants={fadeUp}
                    custom={4}
                    className="rounded-xl overflow-hidden h-64 bg-gray-100 border border-gray-100 mt-4"
                  >
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d0!2d0!3d0!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMcKwMjYnMDAuMCJOIDc4wrA0NycwMC4wIkU!5e0!3m2!1sen!2sin!4v1"
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Location Map"
                    />
                  </motion.div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="lg:col-span-3"
                >
                  <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-lg">
                    <div className="mb-6">
                      <h2 className="text-2xl font-bold text-brand-950 mb-2">Send Us a Message</h2>
                      <p className="text-gray-500 text-sm">Fill out the form below and we will get back to you shortly.</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <Input
                          label="Your Name"
                          placeholder="Enter your full name"
                          {...register('name')}
                          error={errors.name?.message}
                        />
                        <Input
                          label="Mobile Number"
                          placeholder="Enter your mobile number"
                          {...register('mobileNumber')}
                          error={errors.mobileNumber?.message}
                        />
                      </div>
                      <Input
                        label="Email Address"
                        type="email"
                        placeholder="Enter your email address"
                        {...register('email')}
                        error={errors.email?.message}
                      />
                      <Textarea
                        label="Your Message"
                        placeholder="Write your message here..."
                        rows={5}
                        {...register('message')}
                        error={errors.message?.message}
                      />
                      <Button
                        type="submit"
                        variant="gradient"
                        size="lg"
                        className="w-full gap-2"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          'Sending...'
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
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

          <MapSection />
        </PageTransition>
      </main>
      <Footer />
    </>
  )
}

function HeroBanner() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-brand-950 via-brand-900 to-brand-800 min-h-[40vh] flex items-center">
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-500/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-brand-400/10 rounded-full blur-[100px]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white/80 text-sm font-medium mb-6 border border-white/10"
          >
            <Sparkles className="w-4 h-4" />
            Get in Touch
          </motion.div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4">
            Contact Us
          </h1>
          <p className="text-lg text-brand-200/80 max-w-xl mx-auto">
            We are here to help. Reach out to us for any queries or appointments.
          </p>
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent" />
    </section>
  )
}

function MapSection() {
  return (
    <section className="py-16 bg-gradient-to-b from-brand-50/30 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-brand-950 mb-3">Visit Our Centre</h2>
          <p className="text-gray-500">We are conveniently located in the heart of the city</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-2xl overflow-hidden shadow-lg border border-gray-100 h-[400px]"
        >
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d0!2d0!3d0!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMcKwMjYnMDAuMCJOIDc4wrA0NycwMC4wIkU!5e0!3m2!1sen!2sin!4v1"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Location Map Full"
          />
        </motion.div>
      </div>
    </section>
  )
}
