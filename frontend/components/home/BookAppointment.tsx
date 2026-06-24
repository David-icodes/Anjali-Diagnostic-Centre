'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Calendar, Clock, User, Phone, Mail, MessageSquare, ArrowRight, Shield, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'
import api from '@/lib/api'

export default function BookAppointment() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: '',
  })
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.phone) {
      toast.error('Please fill in required fields')
      return
    }
    setSubmitting(true)
    try {
      await api.post('/enquiries', {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        message: formData.message || 'Appointment request via website',
      })
      toast.success('Appointment request submitted! We will call you back.')
      setFormData({ name: '', phone: '', email: '', message: '' })
    } catch {
      toast.error('Failed to submit. Please try calling us.')
    }
    setSubmitting(false)
  }

  const benefits = [
    'Free home sample collection',
    'Reports in 24-48 hours',
    'NABL accredited lab',
    'Expert consultation available',
  ]

  return (
    <section className="relative py-20 md:py-28 bg-gradient-to-br from-[#0D47A1] via-[#1565C0] to-[#1976D2] overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#00B8A9]/10 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#4CAF50]/10 rounded-full blur-[100px] translate-x-1/2 translate-y-1/2" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
              <Calendar className="w-4 h-4 text-[#00B8A9]" />
              <span className="text-white/80 text-sm font-medium">Book Your Appointment</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 leading-[1.15]">
              Schedule Your Visit{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00B8A9] to-[#4CAF50]">
                Today
              </span>
            </h2>

            <p className="text-lg text-white/70 mb-8">
              Skip the queue. Book your diagnostic test or health checkup online 
              and get priority service. Free home collection available.
            </p>

            <div className="space-y-4 mb-8">
              {benefits.map((benefit, i) => (
                <div key={i} className="flex items-center gap-3 text-white/80">
                  <CheckCircle className="w-5 h-5 text-[#4CAF50] shrink-0" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-4">
              <Link href="/booking">
                <Button size="lg" className="bg-gradient-to-r from-[#00B8A9] to-[#009E91] hover:from-[#009E91] hover:to-[#008479] text-white shadow-xl shadow-[#00B8A9]/30">
                  Book Online Now
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <a href="tel:9989220938">
                <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10">
                  <Phone className="w-5 h-5 mr-2" />
                  Call 94406 26892
                </Button>
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="absolute inset-0 bg-white/5 rounded-3xl blur-xl" />
            <form onSubmit={handleSubmit} className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8">
              <h3 className="text-xl font-bold text-white mb-6">Quick Enquiry</h3>
              
              <div className="space-y-4">
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Your Name *"
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 outline-none focus:border-[#00B8A9] focus:bg-white/15 transition-all"
                    required
                  />
                </div>

                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Phone Number *"
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 outline-none focus:border-[#00B8A9] focus:bg-white/15 transition-all"
                    required
                  />
                </div>

                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Email (optional)"
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 outline-none focus:border-[#00B8A9] focus:bg-white/15 transition-all"
                  />
                </div>

                <div className="relative">
                  <MessageSquare className="absolute left-4 top-3.5 w-5 h-5 text-white/40" />
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Message (optional)"
                    rows={3}
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 outline-none focus:border-[#00B8A9] focus:bg-white/15 transition-all resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-gradient-to-r from-[#4CAF50] to-[#43A047] hover:from-[#388E3C] hover:to-[#2E7D32] text-white shadow-lg"
                  disabled={submitting}
                >
                  {submitting ? 'Submitting...' : 'Submit Enquiry'}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
