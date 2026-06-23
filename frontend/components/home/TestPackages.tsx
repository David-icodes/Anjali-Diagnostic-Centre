"use client"

import { useState, useEffect, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { ArrowRight, Check, Shield, Heart, Activity, User, Users } from 'lucide-react'
import { cn, formatPrice } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import api from '@/lib/api'

const iconMap: Record<string, any> = {
  'Shield': Shield,
  'Activity': Activity,
  'Heart': Heart,
  'User': User,
  'Users': Users,
}

function getIcon(name: string) {
  if (name.toLowerCase().includes('heart') || name.toLowerCase().includes('cardiac')) return Heart
  if (name.toLowerCase().includes('diabetes') || name.toLowerCase().includes('sugar')) return Activity
  if (name.toLowerCase().includes('women') || name.toLowerCase().includes('pregnancy')) return User
  if (name.toLowerCase().includes('senior') || name.toLowerCase().includes('full body')) return Users
  return Shield
}

export default function TestPackages() {
  const [packages, setPackages] = useState<any[]>([])
  const sectionRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' })
  const router = useRouter()

  useEffect(() => {
    api.get('/health-packages?isActive=true&limit=5')
      .then(res => {
        const data = res.data?.packages || res.data || []
        setPackages(Array.isArray(data) ? data.slice(0, 5) : [])
      })
      .catch(() => {})
  }, [])

  const discountPercent = (original: number, offer: number) => {
    if (!original || !offer) return 0
    return Math.round(((original - offer) / original) * 100)
  }

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

  if (packages.length === 0) return null

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
          {packages.map((pkg, idx) => {
            const Icon = getIcon(pkg.name)
            const discount = pkg.discountPercentage || discountPercent(pkg.originalPrice, pkg.offerPrice)
            const tests = pkg.includedTests || []
            const isPopular = idx === 0
            return (
              <motion.div
                key={pkg._id}
                variants={cardVariants}
                className={cn(
                  'relative flex flex-col rounded-2xl border bg-card overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-brand-500/10 transition-all duration-500 group',
                  isPopular && 'lg:scale-105 border-brand-200'
                )}
              >
                {isPopular && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-400 to-brand-600" />
                )}

                <div className="p-6 flex-1">
                  {isPopular && (
                    <Badge variant="warning" className="mb-4">
                      Most Popular
                    </Badge>
                  )}

                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 text-white flex items-center justify-center shadow-lg shadow-brand-500/20 mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-6 h-6" />
                  </div>

                  <h3 className="text-lg font-semibold mb-2">{pkg.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {pkg.description}
                  </p>

                  <div className="mb-4">
                    <span className="text-2xl font-bold text-brand-600">
                      {formatPrice(pkg.offerPrice || pkg.price)}
                    </span>
                    {pkg.originalPrice > pkg.offerPrice && (
                      <>
                        <span className="ml-2 text-sm text-muted-foreground line-through">
                          {formatPrice(pkg.originalPrice)}
                        </span>
                        {discount > 0 && (
                          <Badge variant="success" className="ml-2">
                            {discount}% OFF
                          </Badge>
                        )}
                      </>
                    )}
                  </div>

                  <ul className="space-y-2 mb-6">
                    {tests.slice(0, 6).map((test: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 mt-0.5 shrink-0 text-green-500" />
                        <span className="text-foreground">{test}</span>
                      </li>
                    ))}
                    {tests.length > 6 && (
                      <li className="text-sm text-muted-foreground">+{tests.length - 6} more tests</li>
                    )}
                  </ul>
                </div>

                <div className="px-6 pb-6">
                  <Button
                    variant={isPopular ? 'gradient' : 'outline'}
                    className="w-full group"
                    onClick={() => router.push(`/booking?package=${pkg._id}`)}
                  >
                    View Details
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
