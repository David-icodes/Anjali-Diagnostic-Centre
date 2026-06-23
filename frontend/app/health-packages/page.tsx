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
          <section className="relative overflow-hidden bg-gradient-to-br from-[#1BAE9A] to-[#00C2A8] min-h-[30vh] flex items-center">
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03]" />
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/10 rounded-full blur-[80px]" />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full relative">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white/90 text-sm font-medium mb-6 border border-white/20">
                  <Sparkles className="w-4 h-4" /> Health Packages
                </div>
                <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight mb-4">
                  Health Checkup Packages
                </h1>
                <p className="text-lg text-white/80 max-w-xl mx-auto">
                  Curated health packages for comprehensive wellness
                </p>
              </motion.div>
            </div>
          </section>

          <section className="py-16 bg-[#F8FBFC]">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
              {loading ? (
                <div className="space-y-6">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-xl shadow-gray-100/50 animate-pulse">
                      <div className="grid md:grid-cols-3">
                        <div className="h-64 bg-gray-100" />
                        <div className="md:col-span-2 p-8 space-y-4">
                          <div className="h-6 bg-gray-100 rounded w-1/3" />
                          <div className="h-4 bg-gray-100 rounded w-full" />
                          <div className="h-4 bg-gray-100 rounded w-2/3" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : packages.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-gray-400 text-lg">No health packages available at the moment.</p>
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
                      className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-xl shadow-gray-100/50 mb-6"
                    >
                      <div className="grid md:grid-cols-3 gap-0">
                        <div className="md:col-span-1 bg-gradient-to-br from-[#1BAE9A] to-[#00C2A8] p-8 text-white flex flex-col justify-between">
                          <div>
                            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mb-5">
                              <Icon className="w-7 h-7" />
                            </div>
                            <h2 className="text-2xl font-bold mb-2">{pkg.name}</h2>
                            <p className="text-white/80 text-sm mb-4">{pkg.description}</p>
                            <div className="flex items-center gap-2 mb-2">
                              {pkg.benefits?.length > 0 && (
                                <span className="bg-white/20 text-xs font-medium px-3 py-1 rounded-full">
                                  {pkg.benefits.length} Benefits
                                </span>
                              )}
                              {discount > 0 && (
                                <span className="bg-[#4CAF50] text-xs font-bold px-3 py-1 rounded-full">
                                  {discount}% OFF
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="mt-6">
                            <div className="flex items-baseline gap-2 mb-2">
                              <span className="text-3xl font-bold">₹{(pkg.offerPrice || 0).toLocaleString('en-IN')}</span>
                              {pkg.originalPrice > pkg.offerPrice && (
                                <span className="text-white/60 line-through text-sm">₹{(pkg.originalPrice || 0).toLocaleString('en-IN')}</span>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-white/80 text-sm">
                              {pkg.homeCollectionAvailable && (
                                <span className="flex items-center gap-1"><Truck className="w-3.5 h-3.5" /> Home Collection</span>
                              )}
                              <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5" /> Lab Visit</span>
                            </div>
                          </div>
                        </div>

                        <div className="md:col-span-2 p-8">
                          {tests.length > 0 && (
                            <>
                              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tests Included ({tests.length})</h3>
                              <div className="grid sm:grid-cols-2 gap-3 mb-6">
                                {tests.map((test: string, j: number) => (
                                  <div key={j} className="flex items-center gap-3 text-sm text-gray-600">
                                    <div className="w-6 h-6 rounded-full bg-[#1BAE9A]/10 flex items-center justify-center shrink-0">
                                      <Check className="w-3.5 h-3.5 text-[#1BAE9A]" />
                                    </div>
                                    <span>{test}</span>
                                  </div>
                                ))}
                              </div>
                            </>
                          )}

                          <div className="flex flex-wrap gap-3">
                            <Link href="/booking">
                              <Button size="lg" className="bg-[#1BAE9A] hover:bg-[#168E7E] text-white shadow-lg shadow-[#1BAE9A]/25">
                                Book Package
                                <ArrowRight className="w-5 h-5 ml-2" />
                              </Button>
                            </Link>
                            {tests.length > 0 && (
                              <button
                                onClick={() => setExpandedPkg(isExpanded ? null : pkg._id)}
                                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:border-[#1BAE9A]/30 hover:text-[#1BAE9A] transition-all"
                              >
                                <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
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
                                  <div className="mt-6 pt-6 border-t border-gray-100">
                                    <h4 className="font-medium text-gray-900 mb-3">Benefits</h4>
                                    <div className="space-y-3">
                                      {pkg.benefits.map((benefit: string, j: number) => (
                                        <div key={j} className="flex items-start gap-3">
                                          <div className="w-6 h-6 rounded-full bg-[#1BAE9A]/10 flex items-center justify-center shrink-0 mt-0.5">
                                            <Check className="w-3.5 h-3.5 text-[#1BAE9A]" />
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
