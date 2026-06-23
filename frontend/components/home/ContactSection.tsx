"use client"

import { useState, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  CheckCircle2,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import api from '@/lib/api'

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  mobileNumber: z
    .string()
    .min(10, 'Enter valid mobile number')
    .max(15, 'Enter valid mobile number'),
  email: z.string().email('Enter valid email address'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
})

type ContactFormData = z.infer<typeof contactSchema>

const contactInfo = [
  {
    icon: MapPin,
    label: 'Address',
    value: '123, Health Avenue, Sector 12, New Delhi - 110001',
  },
  { icon: Phone, label: 'Phone', value: '+91 98765 43210' },
  { icon: Mail, label: 'Email', value: 'info@anjalidiagnostics.com' },
  {
    icon: Clock,
    label: 'Working Hours',
    value: 'Mon - Sat: 7:00 AM - 8:00 PM, Sun: 8:00 AM - 2:00 PM',
  },
]

export default function ContactSection() {
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' })

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  })

  const onSubmit = async (data: ContactFormData) => {
    setSubmitting(true)
    try {
      await api.post('/enquiries', data)
      setSubmitted(true)
      reset()
      setTimeout(() => setSubmitted(false), 5000)
    } catch {
      // handle error
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="py-24 px-4 bg-gradient-to-b from-brand-50/30 to-background" id="contact">
      <div ref={sectionRef} className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 rounded-full bg-brand-100 text-brand-700 text-sm font-medium mb-4">
            Contact Us
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Get In{' '}
            <span className="text-gradient">Touch</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Have questions? We are here to help you
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            {contactInfo.map((info) => (
              <div
                key={info.label}
                className="flex items-start gap-4 p-5 rounded-xl bg-card border hover:shadow-md hover:border-brand-200 transition-all duration-300 group"
              >
                <div className="p-3 rounded-lg bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform">
                  <info.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{info.label}</p>
                  <p className="font-medium">{info.value}</p>
                </div>
              </div>
            ))}

            <div className="rounded-xl overflow-hidden border h-64 bg-muted">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3802.123456789!2d78.4!3d17.5!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sANJALI+DIAGNOSTICS+CENTRE!5e0!3m2!1sen!2sin!4v1"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Location"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="p-8 rounded-2xl bg-card border shadow-lg">
              {submitted ? (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex flex-col items-center justify-center py-16 text-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                  >
                    <CheckCircle2 className="w-20 h-20 text-green-500 mb-6" />
                  </motion.div>
                  <h3 className="text-2xl font-bold mb-2">Message Sent!</h3>
                  <p className="text-muted-foreground mb-6">
                    Thank you for reaching out. We will get back to you shortly.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => setSubmitted(false)}
                  >
                    Send Another Message
                  </Button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium mb-2">Full Name *</label>
                    <input
                      {...register('name')}
                      placeholder="Enter your full name"
                      className={cn(
                        'w-full px-4 py-3 rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all',
                        errors.name && 'border-red-500 focus:ring-red-500/50 focus:border-red-500'
                      )}
                    />
                    {errors.name && (
                      <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium mb-2">Mobile Number *</label>
                      <input
                        {...register('mobileNumber')}
                        placeholder="Enter mobile number"
                        className={cn(
                          'w-full px-4 py-3 rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all',
                          errors.mobileNumber &&
                            'border-red-500 focus:ring-red-500/50 focus:border-red-500'
                        )}
                      />
                      {errors.mobileNumber && (
                        <p className="text-sm text-red-500 mt-1">{errors.mobileNumber.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Email *</label>
                      <input
                        {...register('email')}
                        placeholder="Enter your email"
                        className={cn(
                          'w-full px-4 py-3 rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all',
                          errors.email && 'border-red-500 focus:ring-red-500/50 focus:border-red-500'
                        )}
                      />
                      {errors.email && (
                        <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Message *</label>
                    <textarea
                      {...register('message')}
                      rows={4}
                      placeholder="Write your message here..."
                      className={cn(
                        'w-full px-4 py-3 rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all resize-none',
                        errors.message && 'border-red-500 focus:ring-red-500/50 focus:border-red-500'
                      )}
                    />
                    {errors.message && (
                      <p className="text-sm text-red-500 mt-1">{errors.message.message}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    variant="gradient"
                    size="lg"
                    className="w-full"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 w-5 h-5" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
