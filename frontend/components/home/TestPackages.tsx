"use client"

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { ArrowRight, Check, Shield, Heart, Activity, User, Users } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface PackageFeature {
  label: string
  included: boolean
}

interface Package {
  id: string
  name: string
  description: string
  icon: React.ElementType
  price: number
  originalPrice: number
  features: PackageFeature[]
  badge?: string
  popular?: boolean
}

const packages: Package[] = [
  {
    id: 'full-body',
    name: 'Full Body Checkup',
    description: 'Comprehensive 80+ tests for complete health assessment',
    icon: Shield,
    price: 1999,
    originalPrice: 4999,
    badge: 'Most Popular',
    popular: true,
    features: [
      { label: 'Complete Blood Count', included: true },
      { label: 'Lipid Profile', included: true },
      { label: 'Liver Function Test', included: true },
      { label: 'Kidney Function Test', included: true },
      { label: 'Thyroid Profile', included: true },
      { label: 'Blood Sugar Fasting', included: true },
      { label: 'Vitamin D & B12', included: true },
      { label: 'Urine Analysis', included: true },
    ],
  },
  {
    id: 'diabetes',
    name: 'Diabetes Package',
    description: 'Complete diabetes management and monitoring tests',
    icon: Activity,
    price: 999,
    originalPrice: 2499,
    features: [
      { label: 'Blood Sugar Fasting', included: true },
      { label: 'Blood Sugar PP', included: true },
      { label: 'HbA1c', included: true },
      { label: 'Lipid Profile', included: true },
      { label: 'Kidney Function Test', included: true },
      { label: 'Urine Microalbumin', included: true },
      { label: 'Insulin fasting', included: false },
      { label: 'ECG', included: false },
    ],
  },
  {
    id: 'heart',
    name: 'Heart Checkup',
    description: 'Cardiac risk assessment and heart health monitoring',
    icon: Heart,
    price: 1499,
    originalPrice: 3499,
    popular: true,
    features: [
      { label: 'Lipid Profile', included: true },
      { label: 'ECG', included: true },
      { label: 'Troponin I', included: true },
      { label: 'CRP (Cardiac)', included: true },
      { label: 'Blood Sugar Fasting', included: true },
      { label: 'Kidney Function Test', included: true },
      { label: 'Echocardiography', included: false },
      { label: 'Stress Test', included: false },
    ],
  },
  {
    id: 'womens-health',
    name: 'Women\'s Health',
    description: 'Essential health tests curated for women',
    icon: User,
    price: 1799,
    originalPrice: 3999,
    features: [
      { label: 'Complete Blood Count', included: true },
      { label: 'Thyroid Profile', included: true },
      { label: 'Iron Studies', included: true },
      { label: 'Vitamin D & B12', included: true },
      { label: 'Lipid Profile', included: true },
      { label: 'Blood Sugar Fasting', included: true },
      { label: 'Pap Smear', included: false },
      { label: 'Mammography', included: false },
    ],
  },
  {
    id: 'senior-citizen',
    name: 'Senior Citizen',
    description: 'Comprehensive health package for ages 60+',
    icon: Users,
    price: 2499,
    originalPrice: 5999,
    badge: 'Best Value',
    features: [
      { label: 'Complete Blood Count', included: true },
      { label: 'Lipid Profile', included: true },
      { label: 'Liver Function Test', included: true },
      { label: 'Kidney Function Test', included: true },
      { label: 'Thyroid Profile', included: true },
      { label: 'Blood Sugar Fasting', included: true },
      { label: 'Vitamin D & B12', included: true },
      { label: 'ECG', included: true },
    ],
  },
]

export default function TestPackages() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' })
  const router = useRouter()

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
    },
  }

  return (
    <section className="py-24 px-4 bg-gradient-to-b from-background to-brand-50/30" id="packages">
      <div ref={sectionRef} className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 rounded-full bg-brand-100 text-brand-700 text-sm font-medium mb-4">
            Health Packages
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Our{' '}
            <span className="text-gradient">Health Packages</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Curated health checkup packages designed for every need at the best prices
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6"
        >
          {packages.map((pkg) => (
            <motion.div
              key={pkg.id}
              variants={cardVariants}
              className={cn(
                'relative flex flex-col rounded-2xl border bg-card overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-brand-500/10 transition-all duration-500 group',
                pkg.popular && 'lg:scale-105 border-brand-200'
              )}
            >
              {pkg.popular && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-400 to-brand-600" />
              )}

              <div className="p-6 flex-1">
                {pkg.badge && (
                  <Badge variant="warning" className="mb-4">
                    {pkg.badge}
                  </Badge>
                )}

                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 text-white flex items-center justify-center shadow-lg shadow-brand-500/20 mb-4 group-hover:scale-110 transition-transform duration-300">
                  <pkg.icon className="w-6 h-6" />
                </div>

                <h3 className="text-lg font-semibold mb-2">{pkg.name}</h3>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {pkg.description}
                </p>

                <div className="mb-4">
                  <span className="text-2xl font-bold text-brand-600">
                    {formatPrice(pkg.price)}
                  </span>
                  <span className="ml-2 text-sm text-muted-foreground line-through">
                    {formatPrice(pkg.originalPrice)}
                  </span>
                  <Badge variant="success" className="ml-2">
                    {Math.round(((pkg.originalPrice - pkg.price) / pkg.originalPrice) * 100)}% OFF
                  </Badge>
                </div>

                <ul className="space-y-2 mb-6">
                  {pkg.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Check
                        className={cn(
                          'w-4 h-4 mt-0.5 shrink-0',
                          feature.included ? 'text-green-500' : 'text-muted-foreground/30'
                        )}
                      />
                      <span
                        className={cn(
                          feature.included ? 'text-foreground' : 'text-muted-foreground/40 line-through'
                        )}
                      >
                        {feature.label}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="px-6 pb-6">
                <Button
                  variant={pkg.popular ? 'gradient' : 'outline'}
                  className="w-full group"
                  onClick={() => router.push(`/booking?package=${pkg.id}`)}
                >
                  View Details
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
