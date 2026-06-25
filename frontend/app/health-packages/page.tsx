'use client'

import { useMemo, useEffect, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, ChevronDown, Check, Truck, Building2, ArrowRight, Shield, Activity, HeartPulse, ScanLine, Star, BadgePercent } from 'lucide-react'
import Footer from '@/components/layout/Footer'
import PageTransition from '@/components/layout/PageTransition'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils'
import api from '@/lib/api'

const iconMap: Record<string, any> = {
  heart: HeartPulse,
  cardiac: HeartPulse,
  sugar: Activity,
  diabetes: Activity,
  scan: ScanLine,
  xray: ScanLine,
  'x-ray': ScanLine,
}

function getPackageIcon(name: string) {
  const normalized = name.toLowerCase()
  const entry = Object.entries(iconMap).find(([key]) => normalized.includes(key))
  return entry ? entry[1] : Shield
}

function getArrayFromResponse(payload: any, keys: string[]) {
  for (const key of keys) {
    if (Array.isArray(payload?.[key])) return payload[key]
  }
  return Array.isArray(payload) ? payload : []
}

function hasValidOffer(pkg: any) {
  return !!pkg.hasOffer && pkg.offerPrice > 0 && pkg.offerPrice < pkg.originalPrice
}

function getDiscount(pkg: any) {
  if (pkg.discountPercentage) return pkg.discountPercentage
  if (!hasValidOffer(pkg)) return 0
  return Math.round(((pkg.originalPrice - pkg.offerPrice) / pkg.originalPrice) * 100)
}

export default function HealthPackagesPage() {
  const [packages, setPackages] = useState<any[]>([])
  const [labTests, setLabTests] = useState<string[]>([])
  const [radiologyServices, setRadiologyServices] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedPkg, setExpandedPkg] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      api.get('/health-packages', { params: { isActive: true } }),
      api.get('/tests', { params: { limit: 250 } }),
      api.get('/radiology', { params: { limit: 250 } }),
    ])
      .then(([packagesRes, testsRes, radiologyRes]) => {
        const packageData = getArrayFromResponse(packagesRes.data, ['packages'])
        const testsData = getArrayFromResponse(testsRes.data, ['tests'])
        const radiologyData = getArrayFromResponse(radiologyRes.data, ['services', 'radiologyServices'])

        setPackages(packageData)
        setLabTests(testsData.map((test: any) => test.name.toLowerCase()))
        setRadiologyServices(radiologyData.map((service: any) => service.name.toLowerCase()))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const classifyIncludedItems = useMemo(() => {
    return packages.reduce((acc, pkg) => {
      const items = Array.isArray(pkg.includedTests) ? pkg.includedTests : []
      const grouped = items.reduce(
        (result: { laboratory: string[]; radiology: string[] }, item: string) => {
          const normalized = item.toLowerCase()
          if (radiologyServices.includes(normalized)) result.radiology.push(item)
          else result.laboratory.push(item)
          return result
        },
        { laboratory: [], radiology: [] }
      )
      acc[pkg._id] = grouped
      return acc
    }, {} as Record<string, { laboratory: string[]; radiology: string[] }>)
  }, [packages, radiologyServices])

  return (
    <>
      <main className="min-h-screen bg-[#F8FAFC]">
        <PageTransition>
          <section className="relative overflow-hidden bg-gradient-to-br from-[#0F766E] via-[#14B8A6] to-[#2DD4BF]">
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.04]" />
            <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
              <div className="max-w-3xl">
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white/90 backdrop-blur-sm">
                  <Sparkles className="h-4 w-4" /> Health Packages
                </div>
                <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl">Preventive health packages designed for accurate, convenient care</h1>
                <p className="mt-4 max-w-2xl text-base text-white/80 sm:text-lg">Explore clean, clearly priced health checkup packages with home collection and lab visit options based on your needs.</p>
              </div>
            </div>
          </section>

          <section className="py-10 sm:py-12 lg:py-14">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              {loading ? (
                <div className="grid gap-6 lg:grid-cols-2">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="h-80 animate-pulse rounded-[24px] border border-slate-200 bg-white" />
                  ))}
                </div>
              ) : packages.length === 0 ? (
                <div className="rounded-[24px] border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
                  <p className="text-lg text-slate-500">No health packages available at the moment.</p>
                </div>
              ) : (
                <div className="grid gap-6 lg:grid-cols-2">
                  {packages.map((pkg, index) => {
                    const Icon = getPackageIcon(pkg.name)
                    const grouped = classifyIncludedItems[pkg._id] || { laboratory: [], radiology: [] }
                    const includedCount = (pkg.includedTests || []).length
                    const expanded = expandedPkg === pkg._id
                    const hasOffer = hasValidOffer(pkg)
                    const discount = getDiscount(pkg)
                    const priceToShow = hasOffer ? pkg.offerPrice : pkg.originalPrice
                    const offerText = pkg.offerText || (discount > 0 ? `${discount}% OFF` : '')

                    return (
                      <motion.article
                        key={pkg._id}
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.03 }}
                        className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_14px_34px_rgba(15,118,110,0.08)]"
                      >
                        <div className="flex h-full flex-col p-6 sm:p-7">
                          <div className="flex flex-wrap items-start justify-between gap-4">
                            <div className="flex min-w-0 items-start gap-4">
                              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#E8F8F5] text-[#0F766E]">
                                <Icon className="h-7 w-7" />
                              </div>
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <h2 className="text-2xl font-bold leading-tight text-slate-900">{pkg.name}</h2>
                                  {pkg.isPopular ? (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-[#DCFCE7] px-3 py-1 text-xs font-semibold text-[#15803D]">
                                      <Star className="h-3.5 w-3.5" /> POPULAR
                                    </span>
                                  ) : null}
                                  {hasOffer && offerText ? (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-[#FEF3C7] px-3 py-1 text-xs font-semibold text-[#B45309]">
                                      <BadgePercent className="h-3.5 w-3.5" /> {offerText}
                                    </span>
                                  ) : null}
                                </div>
                                <p className="mt-2 text-sm leading-6 text-slate-600">{pkg.description}</p>
                                <p className="mt-3 text-sm font-medium text-[#0F766E]">Parameters Covered {includedCount}</p>
                              </div>
                            </div>

                            <div className="rounded-2xl bg-[#F8FAFC] px-4 py-3 text-right">
                              {hasOffer ? <p className="text-sm text-slate-400 line-through">{formatPrice(pkg.originalPrice)}</p> : null}
                              <p className="text-3xl font-bold text-slate-900">{formatPrice(priceToShow)}</p>
                            </div>
                          </div>

                          <div className="mt-5 flex flex-wrap gap-2">
                            {pkg.homeCollectionAvailable ? <span className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700"><Truck className="h-3.5 w-3.5" /> Home Collection</span> : null}
                            {pkg.labVisitAvailable ? <span className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-sky-50 px-3 py-1.5 text-xs font-medium text-sky-700"><Building2 className="h-3.5 w-3.5" /> Lab Visit</span> : null}
                          </div>

                          <div className="mt-6 flex flex-wrap gap-3">
                            <Link href={`/booking?package=${pkg._id}`}>
                              <Button className="h-11 rounded-full bg-[#14B8A6] px-6 text-white hover:bg-[#0F9E90]">
                                Book Now
                                <ArrowRight className="ml-2 h-4 w-4" />
                              </Button>
                            </Link>
                            {includedCount > 0 ? (
                              <button
                                type="button"
                                onClick={() => setExpandedPkg(expanded ? null : pkg._id)}
                                className="inline-flex h-11 items-center gap-2 rounded-full border border-slate-200 px-5 text-sm font-semibold text-slate-700 transition hover:border-[#14B8A6] hover:text-[#0F766E]"
                              >
                                View Details
                                <ChevronDown className={`h-4 w-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
                              </button>
                            ) : null}
                          </div>

                          <AnimatePresence initial={false}>
                            {expanded ? (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                              >
                                <div className="mt-6 rounded-[20px] border border-slate-200 bg-[#FCFDFD] p-5">
                                  <h3 className="text-2xl font-bold text-slate-900">Tests / Parameters</h3>
                                  <div className="mt-5 grid gap-6 lg:grid-cols-2">
                                    <div>
                                      <h4 className="mb-3 text-lg font-semibold text-slate-900">Laboratory Tests</h4>
                                      {grouped.laboratory.length > 0 ? (
                                        <div className="space-y-3">
                                          {grouped.laboratory.map((item: string) => (
                                            <div key={item} className="flex items-start gap-3 text-sm text-slate-700">
                                              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#E8F8F5] text-[#0F766E]">
                                                <Check className="h-3.5 w-3.5" />
                                              </span>
                                              <span>{item}</span>
                                            </div>
                                          ))}
                                        </div>
                                      ) : <p className="text-sm text-slate-500">No laboratory tests listed in this package.</p>}
                                    </div>
                                    <div>
                                      <h4 className="mb-3 text-lg font-semibold text-slate-900">Radiology Tests</h4>
                                      {grouped.radiology.length > 0 ? (
                                        <div className="space-y-3">
                                          {grouped.radiology.map((item: string) => (
                                            <div key={item} className="flex items-start gap-3 text-sm text-slate-700">
                                              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-50 text-sky-700">
                                                <Check className="h-3.5 w-3.5" />
                                              </span>
                                              <span>{item}</span>
                                            </div>
                                          ))}
                                        </div>
                                      ) : <p className="text-sm text-slate-500">No radiology tests listed in this package.</p>}
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            ) : null}
                          </AnimatePresence>
                        </div>
                      </motion.article>
                    )
                  })}
                </div>
              )}
            </div>
          </section>
        </PageTransition>
      </main>
      <Footer />
    </>
  )
}


