'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { FlaskRoundIcon as Flask, Scan, ArrowRight, Droplets, Heart, Activity, Thermometer, Baby } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function BookTestSection() {
  return (
    <section className="relative bg-white py-10 sm:py-[60px] lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.25 }}
          className="mx-auto mb-12 max-w-3xl text-center"
        >
          <h2 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl lg:text-5xl">
            Book a Test
          </h2>
          <p className="text-lg text-gray-500">
            Choose from our comprehensive range of diagnostic services
          </p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.25 }}
            className="card-hover group relative rounded-3xl border border-[#1BAE9A]/10 bg-gradient-to-br from-[#1BAE9A]/5 to-[#00C2A8]/5 p-8 md:p-10"
          >
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1BAE9A] to-[#00C2A8] shadow-xl shadow-[#1BAE9A]/20">
              <Flask className="h-8 w-8 text-white" />
            </div>
            <h3 className="mb-4 text-2xl font-bold text-gray-900">Laboratory Services</h3>
            <p className="mb-6 text-gray-500">Comprehensive blood tests, urine analysis, hormone testing and more</p>
            <ul className="mb-8 space-y-3">
              {[
                { icon: Droplets, label: 'Blood Tests' },
                { icon: Activity, label: 'Urine Tests' },
                { icon: Thermometer, label: 'Biochemistry' },
                { icon: Heart, label: 'Hormone Testing' },
                { icon: Baby, label: 'Diabetes Testing' },
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-gray-600">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1BAE9A]/5">
                    <item.icon className="h-4 w-4 text-[#1BAE9A]" />
                  </div>
                  <span>{item.label}</span>
                </li>
              ))}
            </ul>
            <Link href="/tests">
              <Button size="lg" className="group/btn bg-[#1BAE9A] text-white shadow-lg shadow-[#1BAE9A]/25 hover:bg-[#168E7E]">
                Explore Laboratory Tests
                <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-150 group-hover/btn:translate-x-1" />
              </Button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.25, delay: 0.05 }}
            className="card-hover group relative rounded-3xl border border-[#4CAF50]/10 bg-gradient-to-br from-[#4CAF50]/5 to-[#388E3C]/5 p-8 md:p-10"
          >
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#4CAF50] to-[#388E3C] shadow-xl shadow-[#4CAF50]/20">
              <Scan className="h-8 w-8 text-white" />
            </div>
            <h3 className="mb-4 text-2xl font-bold text-gray-900">Radiology Services</h3>
            <p className="mb-6 text-gray-500">Advanced imaging and scanning services with expert radiologists</p>
            <ul className="mb-8 space-y-3">
              {[
                { icon: Scan, label: 'MRI' },
                { icon: Scan, label: 'CT Scan' },
                { icon: Scan, label: 'Ultrasound' },
                { icon: Scan, label: 'Digital X-Ray' },
                { icon: Scan, label: 'Mammography' },
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-gray-600">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#4CAF50]/5">
                    <item.icon className="h-4 w-4 text-[#4CAF50]" />
                  </div>
                  <span>{item.label}</span>
                </li>
              ))}
            </ul>
            <Link href="/radiology">
              <Button size="lg" className="group/btn bg-[#4CAF50] text-white shadow-lg shadow-[#4CAF50]/25 hover:bg-[#388E3C]">
                Explore Radiology Services
                <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-150 group-hover/btn:translate-x-1" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
