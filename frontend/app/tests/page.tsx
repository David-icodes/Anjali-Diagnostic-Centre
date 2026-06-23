'use client'

import { Suspense, useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Search, X, Activity, Heart, Brain, Droplets, Stethoscope,
  Syringe, Sparkles, ChevronRight, FlaskRoundIcon as Flask,
  Thermometer, Shield, Baby, Bone
} from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import api from '@/lib/api'
import Footer from '@/components/layout/Footer'
import PageTransition from '@/components/layout/PageTransition'
import { Button } from '@/components/ui/button'

const hardcodedTests = [
  { name: 'Fasting Plasma Glucose', category: 'Diabetology', price: 120, icon: Activity },
  { name: 'Complete Blood Picture (CBP)', category: 'Haematology', price: 390, icon: Droplets },
  { name: 'Creatinine', category: 'Biochemistry', price: 260, icon: Thermometer },
  { name: 'Post Lunch Glucose', category: 'Diabetology', price: 120, icon: Activity },
  { name: 'Glycated Hemoglobin (HbA1c)', category: 'Diabetology', price: 600, icon: Activity },
  { name: 'Thyroid Profile', category: 'Endocrinology', price: 670, icon: Heart },
  { name: 'Lipid Profile', category: 'Cardiology', price: 690, icon: Heart },
  { name: 'Complete Urine Examination (CUE)', category: 'Biochemistry', price: 270, icon: Flask },
  { name: 'Liver Function Test (LFT-A)', category: 'Biochemistry', price: 690, icon: Shield },
  { name: 'Thyroid Stimulating Hormone (TSH)', category: 'Endocrinology', price: 340, icon: Thermometer },
  { name: 'Erythrocyte Sedimentation Rate (ESR)', category: 'Haematology', price: 300, icon: Droplets },
  { name: 'Urea', category: 'Biochemistry', price: 240, icon: Thermometer },
  { name: 'Uric Acid', category: 'Biochemistry', price: 240, icon: Thermometer },
  { name: 'Random Plasma Glucose', category: 'Diabetology', price: 120, icon: Activity },
  { name: 'C-Reactive Protein (CRP)', category: 'Immunology', price: 500, icon: Shield },
  { name: 'Vitamin B12', category: 'Nutrition', price: 1350, icon: Baby },
  { name: 'Electrolytes', category: 'Biochemistry', price: 550, icon: Thermometer },
  { name: 'Calcium', category: 'Biochemistry', price: 300, icon: Bone },
  { name: 'Vitamin D Total', category: 'Nutrition', price: 1900, icon: Baby },
  { name: 'Haemogram', category: 'Haematology', price: 500, icon: Droplets },
  { name: 'SGPT/ALT', category: 'Biochemistry', price: 240, icon: Shield },
]

const testIcons = [Activity, Heart, Brain, Droplets, Stethoscope, Syringe, Flask, Thermometer, Shield, Bone]

const allCategories = Array.from(new Set(hardcodedTests.map(t => t.category)))

function TestsPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const search = searchParams.get('search') || ''
  const category = searchParams.get('category') || ''
  const [searchInput, setSearchInput] = useState(search)
  const [apiTests, setApiTests] = useState<any[]>([])
  const [apiCategories, setApiCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    api.get('/tests', { params: { limit: 50 } }).then((res) => {
      const data = res.data?.tests || res.data || []
      if (Array.isArray(data) && data.length > 0) setApiTests(data)
    }).catch(() => {}).finally(() => setLoading(false))
    api.get('/tests/categories').then((res) => {
      const cats = Array.isArray(res.data) ? res.data : res.data?.categories
      if (cats?.length) setApiCategories(cats)
    }).catch(() => {})
  }, [])

  const displayTests = apiTests.length > 0 ? apiTests : hardcodedTests
  const categories = apiCategories.length > 0 ? apiCategories : allCategories

  const filtered = displayTests.filter((t: any) => {
    const name = t.name || ''
    const cat = t.category || ''
    const matchesSearch = !search || name.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = !category || cat.toLowerCase() === category.toLowerCase()
    return matchesSearch && matchesCategory
  })

  const updateParams = (params: Record<string, string>) => {
    const sp = new URLSearchParams(searchParams.toString())
    Object.entries(params).forEach(([k, v]) => {
      if (v) sp.set(k, v); else sp.delete(k)
    })
    sp.set('page', '1')
    router.push(`/tests?${sp.toString()}`)
  }

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); updateParams({ search: searchInput }) }
  const clearSearch = () => { setSearchInput(''); updateParams({ search: '' }) }
  const handleCategory = (cat: string) => { updateParams({ category: cat === category ? '' : cat }) }

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
                  <Sparkles className="w-4 h-4" /> Laboratory Services
                </div>
                <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight mb-4">
                  Our Laboratory Tests
                </h1>
                <p className="text-lg text-white/80 max-w-xl mx-auto">
                  Comprehensive range of diagnostic tests with accurate results
                </p>
              </motion.div>
            </div>
          </section>

          <section className="py-12 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.form initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleSearch} className="relative max-w-2xl mx-auto mb-8">
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#1BAE9A] transition-colors" />
                  <input type="text" value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Search tests: CBP, Thyroid, Vitamin, Glucose, LFT..."
                    className="w-full pl-12 pr-12 py-4 rounded-2xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#1BAE9A] focus:ring-4 focus:ring-[#1BAE9A]/10 outline-none transition-all text-base"
                  />
                  {searchInput && (
                    <button type="button" onClick={clearSearch} className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-gray-100 transition-colors">
                      <X className="w-4 h-4 text-gray-400" />
                    </button>
                  )}
                </div>
              </motion.form>

              {categories.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap justify-center gap-2 mb-10">
                  <button onClick={() => updateParams({ category: '' })}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${!category ? 'bg-[#1BAE9A] text-white shadow-md shadow-[#1BAE9A]/20' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                    All
                  </button>
                  {categories.map((cat) => (
                    <button key={cat} onClick={() => handleCategory(cat)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${category === cat ? 'bg-[#1BAE9A] text-white shadow-md shadow-[#1BAE9A]/20' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                      {cat}
                    </button>
                  ))}
                </motion.div>
              )}

              {search && (
                <div className="text-center mb-6">
                  <p className="text-gray-500 text-sm">
                    Showing results for <span className="font-semibold text-[#1BAE9A]">&ldquo;{search}&rdquo;</span>
                    <button onClick={clearSearch} className="text-[#1BAE9A] hover:underline ml-1">Clear</button>
                  </p>
                </div>
              )}

              {loading ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="rounded-2xl border border-gray-100 p-5 animate-pulse">
                      <div className="w-12 h-12 rounded-xl bg-gray-100 mb-4" />
                      <div className="h-5 bg-gray-100 rounded w-3/4 mb-2" />
                      <div className="h-4 bg-gray-100 rounded w-1/2 mb-4" />
                      <div className="h-8 bg-gray-100 rounded w-20" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {filtered.map((test: any, i: number) => {
                    const Icon = testIcons[i % testIcons.length]
                    const price = test.discountPrice || test.offerPrice || test.originalPrice || test.price
                    const originalPrice = test.originalPrice || test.price
                    const hasDiscount = test.discountPrice || test.offerPrice
                    return (
                      <motion.div
                        key={test._id || test.name}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: (i % 12) * 0.03 }}
                        className="group bg-white rounded-2xl border border-gray-100 p-5 card-hover"
                      >
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1BAE9A]/10 to-[#00C2A8]/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                          <Icon className="w-6 h-6 text-[#1BAE9A]" />
                        </div>
                        <h3 className="text-sm font-semibold text-gray-800 mb-1">{test.name}</h3>
                        <p className="text-xs text-gray-400 mb-3 capitalize">{test.category}</p>
                        <div className="flex items-center gap-2 mb-4">
                          <span className="text-xl font-bold text-[#1BAE9A]">{formatPrice(price)}</span>
                          {hasDiscount && <span className="text-sm text-gray-400 line-through">{formatPrice(originalPrice)}</span>}
                        </div>
                        <div className="flex gap-2">
                          <Link href={`/booking?test=${test._id || test.name}`} className="flex-1">
                            <Button size="sm" className="w-full bg-[#1BAE9A] hover:bg-[#168E7E] text-white text-xs">Book Now</Button>
                          </Link>
                          <Link href={`/booking?test=${test._id || test.name}`}>
                            <Button variant="outline" size="sm" className="text-xs border-gray-200">Details</Button>
                          </Link>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )}

              {!loading && filtered.length === 0 && (
                <div className="text-center py-16">
                  <Search className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-1">No tests found</h3>
                  <p className="text-gray-400 text-sm mb-4">Try a different search term</p>
                  <Button variant="outline" onClick={clearSearch} className="border-[#1BAE9A] text-[#1BAE9A]">Clear Search</Button>
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

export default function TestsPage() {
  return <Suspense fallback={null}><TestsPageContent /></Suspense>
}
