'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  FlaskRoundIcon as Flask, Droplets, Activity, Heart, Thermometer, Dna, 
  Shield, Siren as Virus, Microscope, Bone as Lung, Baby, 
  TestTube, Stethoscope, Pill, Syringe, Scan,
  ArrowRight, Search, Beaker
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils'
import api from '@/lib/api'

const iconMap: Record<string, any> = {
  'Blood': Droplets,
  'Diabetes': Activity,
  'Cardiac': Heart,
  'Thyroid': Thermometer,
  'Liver': Shield,
  'Kidney': Activity,
  'Vitamin': TestTube,
  'Infection': Virus,
  'Cancer': Scan,
  'Hormone': Thermometer,
  'Allergy': Stethoscope,
  'Urine': Flask,
  'X-Ray': Lung,
  'ECG': Heart,
}

function getIcon(name: string) {
  for (const [key, icon] of Object.entries(iconMap)) {
    if (name.toLowerCase().includes(key.toLowerCase())) return icon
  }
  return Beaker
}

export default function LaboratoryServices() {
  const [tests, setTests] = useState<any[]>([])
  const [categories, setCategories] = useState<string[]>(['All'])
  const [activeCategory, setActiveCategory] = useState('All')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/tests?limit=50'),
      api.get('/tests/categories'),
    ])
      .then(([testsRes, catRes]) => {
        const data = testsRes.data?.tests || testsRes.data || []
        setTests(Array.isArray(data) ? data : [])
        const cats = Array.isArray(catRes.data) ? catRes.data : []
        setCategories(['All', ...cats])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filteredTests = activeCategory === 'All'
    ? tests
    : tests.filter(t => t.category === activeCategory)

  return (
    <section className="relative py-20 md:py-28 bg-gradient-to-b from-gray-50 to-white overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#0D47A1]/5 rounded-full blur-[100px] -translate-y-1/2 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-14"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0D47A1]/5 border border-[#0D47A1]/10 mb-4">
            <Microscope className="w-4 h-4 text-[#0D47A1]" />
            <span className="text-sm font-medium text-[#0D47A1]">Comprehensive Lab Services</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Laboratory Services
          </h2>
          <p className="text-lg text-gray-600">
            Accurate diagnostics with cutting-edge technology and affordable pricing. 
            Free home sample collection included.
          </p>
        </motion.div>

        {!loading && categories.length > 1 && (
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  activeCategory === cat
                    ? 'bg-[#0D47A1] text-white shadow-lg shadow-[#0D47A1]/25'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-[#0D47A1]/30 hover:text-[#0D47A1] hover:shadow-md'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
                <div className="w-12 h-12 rounded-xl bg-gray-100 mb-4" />
                <div className="h-4 bg-gray-100 rounded w-3/4 mb-3" />
                <div className="h-8 bg-gray-100 rounded w-1/2 mb-4" />
              </div>
            ))}
          </div>
        ) : (
          <>
            <motion.div layout className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredTests.map((test, i) => {
                const Icon = getIcon(test.name)
                const price = test.offerPrice || test.originalPrice || test.price
                const originalPrice = test.originalPrice || test.price
                return (
                  <motion.div
                    key={test._id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.03 }}
                    className="group relative bg-white rounded-2xl border border-gray-100 hover:border-[#0D47A1]/20 p-5 card-hover"
                  >
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#0D47A1]/5 to-[#00B8A9]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                    
                    <div className="relative">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0D47A1]/10 to-[#00B8A9]/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                        <Icon className="w-6 h-6 text-[#0D47A1]" />
                      </div>
                      
                      <h3 className="text-sm font-semibold text-gray-800 mb-3 leading-snug min-h-[2.5rem]">
                        {test.name}
                      </h3>
                      
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-xl font-bold text-[#0D47A1]">
                          {formatPrice(price)}
                        </span>
                        {originalPrice > price && (
                          <span className="text-sm text-gray-400 line-through">
                            {formatPrice(originalPrice)}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <Link href={`/booking?test=${test._id}`} className="flex-1">
                          <Button variant="gradient" size="sm" className="w-full bg-gradient-to-r from-[#0D47A1] to-[#1976D2] text-xs">
                            Book Now
                          </Button>
                        </Link>
                        <Link href={`/tests`}>
                          <Button variant="outline" size="sm" className="text-xs">
                            Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </motion.div>

            {filteredTests.length === 0 && (
              <div className="text-center py-12">
                <Search className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-400">No tests found in this category.</p>
              </div>
            )}
          </>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link href="/tests">
            <Button variant="gradient-outline" size="lg" className="border-[#0D47A1] text-[#0D47A1] hover:bg-[#0D47A1]/5">
              View All Tests & Services
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
