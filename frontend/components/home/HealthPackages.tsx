'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  Heart, Brain, Bone, Eye, Activity, Stethoscope, 
  Shield, Scan, ArrowRight, Sparkles, ChevronRight 
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import api from '@/lib/api'

const specialties = [
  {
    title: 'CT Scan',
    icon: Scan,
    description: 'High-resolution cross-sectional imaging for accurate diagnosis.',
    color: '#0D47A1',
    bg: 'bg-[#0D47A1]/5',
    items: ['CT Brain', 'CT Chest', 'CT Abdomen', 'CT Spine']
  },
  {
    title: 'Cardiology',
    icon: Heart,
    description: 'Complete cardiac evaluation and diagnostic services.',
    color: '#00B8A9',
    bg: 'bg-[#00B8A9]/5',
    items: ['ECG', 'Echocardiography', 'Stress Test', 'Holter Monitoring']
  },
  {
    title: 'MRI',
    icon: Brain,
    description: 'Advanced magnetic resonance imaging for detailed insights.',
    color: '#4CAF50',
    bg: 'bg-[#4CAF50]/5',
    items: ['MRI Brain', 'MRI Spine', 'MRI Joints', 'MRI Abdomen']
  },
  {
    title: 'Neurology',
    icon: Activity,
    description: 'Comprehensive neurological diagnostic evaluations.',
    color: '#0D47A1',
    bg: 'bg-[#0D47A1]/5',
    items: ['EEG', 'EMG/NCV', 'Brain Mapping', 'VEP/BAER']
  },
  {
    title: 'Orthopaedics',
    icon: Bone,
    description: 'Advanced orthopaedic imaging and bone diagnostics.',
    color: '#00B8A9',
    bg: 'bg-[#00B8A9]/5',
    items: ['X-Ray', 'Bone Density', 'Arthroscopy', 'MRI Joints']
  },
  {
    title: 'Eye Care',
    icon: Eye,
    description: 'Complete vision and eye health diagnostic services.',
    color: '#4CAF50',
    bg: 'bg-[#4CAF50]/5',
    items: ['Vision Test', 'Retinal Scan', 'Glaucoma Test', 'Cataract Eval']
  },
]

export default function HealthPackages() {
  const [packages, setPackages] = useState<any[]>([])
  const fetched = useRef(false)

  useEffect(() => {
    if (fetched.current) return
    fetched.current = true
    api.get('/offers?isActive=true&limit=3')
      .then((res) => {
        if (res.data?.offers) setPackages(res.data.offers)
        else if (Array.isArray(res.data)) setPackages(res.data.slice(0, 3))
      })
      .catch(() => {})
  }, [])

  return (
    <section className="relative py-20 md:py-28 bg-white overflow-hidden">
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#00B8A9]/5 rounded-full blur-[120px] translate-y-1/2 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-14"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#00B8A9]/5 border border-[#00B8A9]/10 mb-4">
            <Sparkles className="w-4 h-4 text-[#00B8A9]" />
            <span className="text-sm font-medium text-[#00B8A9]">Our Specialities</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Specialities & Health Packages
          </h2>
          <p className="text-lg text-gray-600">
            Comprehensive diagnostic services across multiple specialities with expert care.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {specialties.map((spec, i) => (
            <motion.div
              key={spec.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group relative bg-white rounded-2xl border border-gray-100 p-6 card-hover overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-5 -translate-y-1/2 translate-x-1/2" style={{ background: spec.color }} />
              
              <div className="flex items-start gap-4 mb-4">
                <div className={`w-14 h-14 rounded-2xl ${spec.bg} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                  <spec.icon className="w-7 h-7" style={{ color: spec.color }} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{spec.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{spec.description}</p>
                </div>
              </div>

              <ul className="space-y-2 mb-5">
                {spec.items.map((item, j) => (
                  <li key={j} className="flex items-center gap-2 text-sm text-gray-600">
                    <ChevronRight className="w-3.5 h-3.5" style={{ color: spec.color }} />
                    {item}
                  </li>
                ))}
              </ul>

              <Link href="/booking">
                <Button variant="outline" size="sm" className="w-full group/btn">
                  Book Appointment
                  <ArrowRight className="w-4 h-4 ml-1.5 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>

        {packages.length > 0 && (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center max-w-3xl mx-auto mb-12"
            >
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
                Special Health Packages
              </h3>
              <p className="text-gray-600">
                Curated health checkup packages at discounted prices
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6">
              {packages.map((pkg: any, i: number) => (
                <motion.div
                  key={pkg._id || i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="relative bg-gradient-to-br from-[#0D47A1] to-[#1976D2] rounded-2xl p-6 text-white overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#00B8A9]/10 rounded-full translate-y-1/2 -translate-x-1/2" />
                  
                  <div className="relative">
                    <Stethoscope className="w-8 h-8 text-[#00B8A9] mb-3" />
                    <h4 className="text-lg font-bold mb-2">{pkg.name || pkg.title}</h4>
                    <p className="text-sm text-white/70 mb-4 line-clamp-2">
                      {pkg.description || 'Comprehensive health checkup package'}
                    </p>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-2xl font-bold">₹{pkg.discountPrice || pkg.price}</span>
                      {pkg.discountPrice && (
                        <span className="text-sm text-white/50 line-through">₹{pkg.price}</span>
                      )}
                    </div>
                    <Link href="/booking">
                      <Button size="sm" className="w-full bg-white text-[#0D47A1] hover:bg-white/90">
                        Book Now
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  )
}
