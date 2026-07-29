'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { ArrowRight, Check, Shield, Heart, Activity, User, Users, Star, BadgePercent, Truck, Building2 } from 'lucide-react'
import { cn, formatPrice } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import api from '@/lib/api'

function getIcon(name: string) {
  const normalized = name.toLowerCase()
  if (normalized.includes('heart') || normalized.includes('cardiac')) return Heart
  if (normalized.includes('diabetes') || normalized.includes('sugar')) return Activity
  if (normalized.includes('women') || normalized.includes('pregnancy')) return User
  if (normalized.includes('senior') || normalized.includes('full body')) return Users
  return Shield
}

function hasValidOffer(pkg: any) {
  return !!pkg.hasOffer && pkg.offerPrice > 0 && pkg.offerPrice < pkg.originalPrice
}

function getDiscount(pkg: any) {
  if (pkg.discountPercentage) return pkg.discountPercentage
  if (!hasValidOffer(pkg)) return 0
  return Math.round(((pkg.originalPrice - pkg.offerPrice) / pkg.originalPrice) * 100)
}

export default function TestPackages() {
  const [packages, setPackages] = useState<any[]>([])
  const sectionRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(sectionRef, { once: true, margin: '-80px' })
  const router = useRouter()

  useEffect(() => {
    api.get('/health-packages', { params: { isActive: true, limit: 6 } })
      .then((res) => {
        const data = res.data?.packages || res.data || []
        setPackages(Array.isArray(data) ? data.slice(0, 6) : [])
      })
      .catch(() => {})
  }, [])

  if (packages.length === 0) return null

  return (
    <section className="bg-[#F8FAFC] px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-14" id="packages">
      <div ref={sectionRef} className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.2 }}
          className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
        >
          <div className="max-w-2xl">
            <span className="inline-flex rounded-full border border-[#D6F5EF] bg-white px-4 py-2 text-sm font-medium text-[#0F766E] shadow-sm">
              Health Packages
            </span>
            <h2 className="mt-4 text-3xl font-bold text-slate-900 sm:text-4xl">Diagnostic packages with clear pricing</h2>
            <p className="mt-2 text-base text-slate-600">Offer and popular badges come directly from Admin settings with no hardcoded homepage labels.</p>
          </div>
          <Button variant="outline" className="h-11 rounded-full border-[#14B8A6] px-5 text-[#0F766E] hover:bg-[#14B8A6]/5" onClick={() => router.push('/health-packages')}>
            View All Packages
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </motion.div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {packages.map((pkg, index) => {
            const Icon = getIcon(pkg.name)
            const hasOffer = hasValidOffer(pkg)
            const discount = getDiscount(pkg)
            const price = hasOffer ? pkg.offerPrice : pkg.originalPrice
            const offerText = pkg.offerText || (discount > 0 ? `${discount}% OFF` : '')
            const tests = Array.isArray(pkg.includedTests) ? pkg.includedTests : []

            return (
              <motion.article
                key={pkg._id}
                initial={{ opacity: 0, y: 12 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.2, delay: index * 0.03 }}
                className={cn('flex h-full flex-col rounded-[22px] border border-slate-200 bg-white p-6 shadow-[0_12px_28px_rgba(15,23,42,0.05)] transition duration-150 hover:-translate-y-0.5 hover:shadow-[0_16px_30px_rgba(15,118,110,0.10)]')}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E8F8F5] text-[#0F766E]">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex flex-wrap justify-end gap-2">
                    {pkg.isPopular ? <span className="inline-flex items-center gap-1 rounded-full bg-[#DCFCE7] px-3 py-1 text-[11px] font-semibold text-[#15803D]"><Star className="h-3 w-3" />POPULAR</span> : null}
                    {hasOffer && offerText ? <span className="inline-flex items-center gap-1 rounded-full bg-[#FEF3C7] px-3 py-1 text-[11px] font-semibold text-[#B45309]"><BadgePercent className="h-3 w-3" />{offerText}</span> : null}
                  </div>
                </div>

                <h3 className="mt-5 text-2xl font-bold leading-snug text-slate-900">{pkg.name}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{pkg.description}</p>
                <p className="mt-3 text-sm font-medium text-[#0F766E]">Parameters Covered {tests.length}</p>

                <div className="mt-5 flex flex-wrap gap-2">
                  {pkg.homeCollectionAvailable ? <span className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700"><Truck className="h-3.5 w-3.5" />Home Collection</span> : null}
                  {pkg.labVisitAvailable ? <span className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-sky-50 px-3 py-1.5 text-xs font-medium text-sky-700"><Building2 className="h-3.5 w-3.5" />Lab Visit</span> : null}
                </div>

                <div className="mt-6 flex items-end justify-between gap-4">
                  <div>
                    {hasOffer ? <p className="text-sm text-slate-400 line-through">{formatPrice(pkg.originalPrice)}</p> : null}
                    <p className="text-3xl font-bold text-slate-900">{formatPrice(price)}</p>
                  </div>
                  <Button className="rounded-full bg-[#14B8A6] px-5 text-white hover:bg-[#0F9E90]" onClick={() => router.push(`/booking?package=${pkg._id}`)}>
                    Book Now
                  </Button>
                </div>

                {tests.length > 0 ? (
                  <div className="mt-5 space-y-2 border-t border-slate-100 pt-4">
                    {tests.slice(0, 3).map((test: string) => (
                      <div key={test} className="flex items-start gap-2 text-sm text-slate-600">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#0F766E]" />
                        <span>{test}</span>
                      </div>
                    ))}
                    {tests.length > 3 ? <p className="text-sm font-medium text-slate-500">+{tests.length - 3} more included</p> : null}
                  </div>
                ) : null}
              </motion.article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
