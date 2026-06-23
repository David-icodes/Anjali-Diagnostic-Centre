'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { FlaskRoundIcon as Flask, Scan, ArrowRight, Droplets, Heart, Activity, Stethoscope, Thermometer, Baby } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function BookTestSection() {
  return (
    <section className="relative py-20 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-14"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Book a Test
          </h2>
          <p className="text-lg text-gray-500">
            Choose from our comprehensive range of diagnostic services
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="group relative bg-gradient-to-br from-[#1BAE9A]/5 to-[#00C2A8]/5 rounded-3xl border border-[#1BAE9A]/10 p-8 md:p-10 card-hover"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1BAE9A] to-[#00C2A8] flex items-center justify-center mb-6 shadow-xl shadow-[#1BAE9A]/20">
              <Flask className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Laboratory Services</h3>
            <p className="text-gray-500 mb-6">Comprehensive blood tests, urine analysis, hormone testing and more</p>
            <ul className="space-y-3 mb-8">
              {[
                { icon: Droplets, label: 'Blood Tests' },
                { icon: Activity, label: 'Urine Tests' },
                { icon: Thermometer, label: 'Biochemistry' },
                { icon: Heart, label: 'Hormone Testing' },
                { icon: Baby, label: 'Diabetes Testing' },
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-gray-600">
                  <div className="w-8 h-8 rounded-lg bg-[#1BAE9A]/5 flex items-center justify-center">
                    <item.icon className="w-4 h-4 text-[#1BAE9A]" />
                  </div>
                  <span>{item.label}</span>
                </li>
              ))}
            </ul>
            <Link href="/tests">
              <Button size="lg" className="bg-[#1BAE9A] hover:bg-[#168E7E] text-white shadow-lg shadow-[#1BAE9A]/25 group/btn">
                Explore Laboratory Tests
                <ArrowRight className="w-5 h-5 ml-2 group-hover/btn:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="group relative bg-gradient-to-br from-[#4CAF50]/5 to-[#388E3C]/5 rounded-3xl border border-[#4CAF50]/10 p-8 md:p-10 card-hover"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#4CAF50] to-[#388E3C] flex items-center justify-center mb-6 shadow-xl shadow-[#4CAF50]/20">
              <Scan className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Radiology Services</h3>
            <p className="text-gray-500 mb-6">Advanced imaging and scanning services with expert radiologists</p>
            <ul className="space-y-3 mb-8">
              {[
                { icon: Scan, label: 'MRI' },
                { icon: Scan, label: 'CT Scan' },
                { icon: Scan, label: 'Ultrasound' },
                { icon: Scan, label: 'Digital X-Ray' },
                { icon: Scan, label: 'Mammography' },
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-gray-600">
                  <div className="w-8 h-8 rounded-lg bg-[#4CAF50]/5 flex items-center justify-center">
                    <item.icon className="w-4 h-4 text-[#4CAF50]" />
                  </div>
                  <span>{item.label}</span>
                </li>
              ))}
            </ul>
            <Link href="/radiology">
              <Button size="lg" className="bg-[#4CAF50] hover:bg-[#388E3C] text-white shadow-lg shadow-[#4CAF50]/25 group/btn">
                Explore Radiology Services
                <ArrowRight className="w-5 h-5 ml-2 group-hover/btn:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
