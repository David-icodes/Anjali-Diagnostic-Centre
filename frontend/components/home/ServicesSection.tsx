'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Shield, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import api from '@/lib/api'

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
            Radiology Services
          </h2>
          <p className="text-lg text-gray-500">
            Advanced diagnostic imaging and scanning
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, i) => (
            <motion.div
              key={service._id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="group bg-white rounded-2xl border border-gray-100 p-6 card-hover flex flex-col justify-between"
            >
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{service.name}</h3>
                <p className="text-3xl font-bold text-[#3730A3]">???{service.price || 0}</p>
              </div>
              <Link href={`/booking?radiology=${service._id}`}>
                <Button className="mt-4 w-full rounded-full bg-[#14B8A6] text-white hover:bg-[#0F766E]">
                  BOOK <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}