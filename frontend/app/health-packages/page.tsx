'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, ChevronDown, Check, Truck, Building2, ArrowRight, Shield, Activity, Droplets, Thermometer, Heart, FlaskRoundIcon as Flask, Brain } from 'lucide-react'
import Footer from '@/components/layout/Footer'
import PageTransition from '@/components/layout/PageTransition'
import { Button } from '@/components/ui/button'
import api from '@/lib/api'

const iconMap: Record<string, any> = {
  'Shield': Shield,
  'Activity': Activity,
  'Droplets': Droplets,
  'Thermometer': Thermometer,
  'Heart': Heart,
  'Flask': Flask,
  'Brain': Brain,
}

function getIcon(name: string) {
  for (const [key, icon] of Object.entries(iconMap)) {
    if (name.toLowerCase().includes(key.toLowerCase())) return icon
  }
  return Activity
}

export default function HealthPackagesPage() {
  const [packages, setPackages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedPkg, setExpandedPkg] = useState<string | null>(null)

  useEffect(() => {
    api.get('/health-packages?isActive=true')
      .then(res => {
        const data = res.data?.packages || res.data || []
        setPackages(Array.isArray(data) ? data : [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const discountPercent = (original: number, offer: number) => {
    if (!original || !offer) return 0
    return Math.round(((original - offer) / original) * 100)
  }

  return (
    <>
      <main className="min-h-screen">
        <PageTransition>
          <section className="relative flex min-h-[30vh] items-center overflow-hidden bg-gradient-to-br from-[#1BAE9A] to-[#00C2A8]">
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03]" />
            <div className="absolute right-0 top-0 h-[400px] w-[400px] rounded-full bg-white/10 blur-[80px]" />
            <div className="relative mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white/90">
                  <Sparkles className="h-4 w-4" /> Health Packages
                </div>
                <h1 className="mb-4 text-4xl font-bold leading-tight text-white sm:text-5xl">
                  Health Checkup Packages
                </h1>
                <p className="mx-auto max-w-xl text-lg text-white/80">
                  Curated health packages for comprehensive wellness
                </p>
              </motion.div>
            </div>
          </section>

          <section className="bg-[#F8FBFC] py-16">
            <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
              {loading ? (
                <div className="space-y-6">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="animate-pulse overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-xl shadow-gray-100/50">
                      <div className="grid md:grid-cols-3">
                        <div className="h-64 bg-gray-100" />
                        <div className="space-y-4 p-8 md:col-span-2">
                          <div className="h-6 w-1/3 rounded bg-gray-100" />
                          <div className="h-4 w-full rounded bg-gray-100" />
                          <div className="h-4 w-2/3 rounded bg-gray-100" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : packages.length === 0 ? (
                <div className="py-20 text-center">
                  <p className="text-lg text-gray-400">No health packages available at the moment.</p>
                </div>
              ) : (
                packages.map((pkg, i) => {
                  const isExpanded = expandedPkg === pkg._id
                  const Icon = getIcon(pkg.name)
                  const discount = pkg.discountPercentage || discountPercent(pkg.originalPrice, pkg.offerPrice)
                  const tests = pkg.includedTests || []
                  return (
                    <motion.div
                      key={pkg._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="mb-6 overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-xl shadow-gray-100/50"
                    >
                      <div className="grid gap-0 md:grid-cols-3">
                        <div className="flex flex-col justify-between bg-gradient-to-br from-[#1BAE9A] to-[#00C2A8] p-8 text-white md:col-span-1">
                          <div>
                            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20">
                              <Icon className="h-7 w-7" />
                            </div>
                            <h2 className="mb-2 text-2xl font-bold">{pkg.name}</h2>
                            <p className="mb-4 text-sm text-white/80">{pkg.description}</p>
                            <div className="mb-2 flex items-center gap-2">
                              {pkg.benefits?.length > 0 && (
                                <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium">
                                  {pkg.benefits.length} Benefits
                                </span>
                              )}
                              {discount > 0 && (
                                <span className="rounded-full bg-[#4CAF50] px-3 py-1 text-xs font-bold">
                                  {discount}% OFF
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="mt-6">
                            <div className="mb-2 flex items-baseline gap-2">
                              <span className="text-3xl font-bold">?{(pkg.offerPrice || 0).toLocaleString('en-IN')}</span>
                              {pkg.originalPrice > pkg.offerPrice && (
                                <span className="text-sm text-white/60 line-through">?{(pkg.originalPrice || 0).toLocaleString('en-IN')}</span>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-white/80">
                              {pkg.homeCollectionAvailable && (
                                <span className="flex items-center gap-1"><Truck className="h-3.5 w-3.5" /> Home Collection</span>
                              )}
                              <span className="flex items-center gap-1"><Building2 className="h-3.5 w-3.5" /> Lab Visit</span>
                            </div>
                          </div>
                        </div>

                        <div className="p-8 md:col-span-2">
                          {tests.length > 0 && (
                            <>
                              <h3 className="mb-4 text-lg font-semibold text-gray-900">Tests Included ({tests.length})</h3>
                              <div className="mb-6 grid gap-3 sm:grid-cols-2">
                                {tests.map((test: string, j: number) => (
                                  <div key={j} className="flex items-center gap-3 text-sm text-gray-600">
                                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#1BAE9A]/10">
                                      <Check className="h-3.5 w-3.5 text-[#1BAE9A]" />
                                    </div>
                                    <span>{test}</span>
                                  </div>
                                ))}
                              </div>
                            </>
                          )}

                          <div className="flex flex-wrap gap-3">
                            <Link href="/booking">
                              <Button size="lg" className="bg-[#1BAE9A] text-white shadow-lg shadow-[#1BAE9A]/25 hover:bg-[#168E7E]">
                                Book Package
                                <ArrowRight className="ml-2 h-5 w-5" />
                              </Button>
                            </Link>
                            {tests.length > 0 && (
                              <button
                                onClick={() => setExpandedPkg(isExpanded ? null : pkg._id)}
                                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-5 py-3 text-sm font-medium text-gray-600 transition-all hover:border-[#1BAE9A]/30 hover:text-[#1BAE9A]"
                              >
                                <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                {isExpanded ? 'Show Less' : 'View Details'}
                              </button>
                            )}
                          </div>

                          {pkg.benefits?.length > 0 && (
                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.3 }}
                                  className="overflow-hidden"
                                >
                                  <div className="mt-6 border-t border-gray-100 pt-6">
                                    <h4 className="mb-3 font-medium text-gray-900">Benefits</h4>
                                    <div className="space-y-3">
                                      {pkg.benefits.map((benefit: string, j: number) => (
                                        <div key={j} className="flex items-start gap-3">
                                          <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#1BAE9A]/10">
                                            <Check className="h-3.5 w-3.5 text-[#1BAE9A]" />
                                          </div>
                                          <p className="text-sm text-gray-600">{benefit}</p>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )
                })
              )}
            </div>
          </section>
        </PageTransition>
      </main>
      <Footer />
    </>
  )
}
