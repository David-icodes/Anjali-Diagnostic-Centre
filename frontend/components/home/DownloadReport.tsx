'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { FileText, Download, Search, ChevronRight, Smartphone, Printer, Mail, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function DownloadReport() {
  return (
    <section className="relative py-20 md:py-28 bg-gradient-to-b from-[#F8FAFC] to-white overflow-hidden">
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#00B8A9]/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="order-2 lg:order-1"
          >
            <div className="relative">
              <div className="w-full aspect-[4/3] rounded-3xl bg-gradient-to-br from-[#0D47A1]/5 to-[#00B8A9]/5 border border-gray-100 p-8 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#0D47A1] to-[#1976D2] flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-[#0D47A1]/30">
                    <FileText className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Download Reports</h3>
                  <p className="text-gray-400 text-sm">Access your reports anywhere, anytime</p>
                  
                  <div className="mt-8 grid grid-cols-3 gap-3">
                    {[
                      { icon: Smartphone, label: 'Mobile' },
                      { icon: Printer, label: 'Print' },
                      { icon: Mail, label: 'Email' },
                    ].map((item, i) => (
                      <div key={i} className="p-3 rounded-xl bg-white border border-gray-100 text-center">
                        <item.icon className="w-5 h-5 text-[#0D47A1] mx-auto mb-1" />
                        <span className="text-xs text-gray-500">{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="order-1 lg:order-2"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0D47A1]/5 border border-[#0D47A1]/10 mb-6">
              <Download className="w-4 h-4 text-[#0D47A1]" />
              <span className="text-sm font-medium text-[#0D47A1]">Online Reports</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-[1.15]">
              Download Your Reports{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0D47A1] to-[#00B8A9]">
                Instantly
              </span>
            </h2>

            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Access your diagnostic reports securely from anywhere. Simply enter your 
              order ID or registered phone number to download your reports instantly.
            </p>

            <div className="space-y-4 mb-8">
              {[
                'Instant access to all your reports',
                'Download as PDF or view online',
                'Share reports with your doctor',
                'Reports available 24/7',
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-gray-600">
                  <CheckCircle className="w-5 h-5 text-[#4CAF50] shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/track-order">
                <Button size="lg" className="bg-gradient-to-r from-[#0D47A1] to-[#1976D2] shadow-lg shadow-[#0D47A1]/25 hover:shadow-[#0D47A1]/40">
                  <Search className="w-5 h-5 mr-2" />
                  Download Report
                </Button>
              </Link>
              <Link href="/booking">
                <Button variant="outline" size="lg" className="border-gray-200 text-gray-700 hover:border-[#0D47A1]/30 hover:text-[#0D47A1]">
                  <ChevronRight className="w-5 h-5 mr-1" />
                  Book a Test
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
