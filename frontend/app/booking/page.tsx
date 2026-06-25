'use client'

import { Suspense, useState, useEffect, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Check, ChevronRight, ChevronLeft,
  Calendar, Clock, User, Phone, Mail, MapPin,
  FileText, Sparkles, Activity, Heart, Brain,
  Droplets, Stethoscope, Syringe, ArrowRight,
  CheckCircle2, Copy, Home, FlaskRoundIcon as Flask, Shield, Thermometer, Baby, Bone, Scan,
} from 'lucide-react'
import { cn, formatPrice } from '@/lib/utils'
import api from '@/lib/api'
import Footer from '@/components/layout/Footer'
import PageTransition from '@/components/layout/PageTransition'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import toast from 'react-hot-toast'

const testIcons = [Activity, Heart, Brain, Droplets, Stethoscope, Syringe, Flask, Shield, Thermometer, Baby, Bone]

interface ServiceOption {
  _id: string
  name: string
  originalPrice?: number
  offerPrice?: number
  price?: number
}

const steps = [
  { num: 1, label: 'Select Service' },
  { num: 2, label: 'Fill Details' },
  { num: 3, label: 'Confirm' },
  { num: 4, label: 'Success' },
]

const defaultTimeSlots = [
  '7:00 AM - 8:00 AM', '8:00 AM - 9:00 AM', '9:00 AM - 10:00 AM',
  '10:00 AM - 11:00 AM', '11:00 AM - 12:00 PM', '12:00 PM - 1:00 PM',
  '1:00 PM - 2:00 PM', '2:00 PM - 3:00 PM', '3:00 PM - 4:00 PM',
  '4:00 PM - 5:00 PM', '5:00 PM - 6:00 PM', '6:00 PM - 7:00 PM',
]

type ServiceTab = 'lab' | 'radiology' | 'package'

const serviceTabs: { key: ServiceTab; label: string; icon: any }[] = [
  { key: 'lab', label: 'Lab Tests', icon: Flask },
  { key: 'radiology', label: 'Radiology', icon: Scan },
  { key: 'package', label: 'Health Packages', icon: Heart },
]

function BookingPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectedTestId = searchParams.get('testId') || searchParams.get('test')
  const preselectedPackage = searchParams.get('package')

  const [step, setStep] = useState<BookingStep>(1)
  const [serviceTab, setServiceTab] = useState<ServiceTab>('lab')
  const [allTests, setAllTests] = useState<ServiceOption[]>([])
  const [allRadiology, setAllRadiology] = useState<ServiceOption[]>([])
  const [allPackages, setAllPackages] = useState<ServiceOption[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedService, setSelectedService] = useState<ServiceOption | null>(null)
  const [bookingId, setBookingId] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [formData, setFormData] = useState({
    patientName: '', mobileNumber: '', email: '', gender: '',
    dob: '', age: '', address: '', preferredDate: '', preferredTime: '',
    homeCollection: 'Yes', additionalNotes: '',
  })

  useEffect(() => {
    setLoadingData(true)
    Promise.all([
      api.get('/tests', { params: { limit: 50 } }),
      api.get('/radiology', { params: { limit: 50 } }),
      api.get('/health-packages', { params: { limit: 50 } }),
    ])
      .then(([testsRes, radRes, pkgRes]) => {
        const tests = testsRes.data?.tests || testsRes.data || []
        setAllTests(Array.isArray(tests) ? tests.map((t: any) => ({
          _id: t._id, name: t.name,
          originalPrice: t.originalPrice || t.price || 0,
          offerPrice: t.offerPrice || t.discountPrice,
        })) : [])

        const rad = radRes.data?.services || radRes.data || []
        setAllRadiology(Array.isArray(rad) ? rad.map((r: any) => ({
          _id: r._id, name: r.name,
          originalPrice: r.price || 0, offerPrice: r.price || 0,
        })) : [])

        const pkgs = pkgRes.data?.packages || pkgRes.data || []
        setAllPackages(Array.isArray(pkgs) ? pkgs.map((p: any) => ({
          _id: p._id, name: p.name, description: p.description,
          originalPrice: p.originalPrice || 0,
          offerPrice: p.offerPrice || p.originalPrice || 0,
        })) : [])

        const preselected = preselectedPackage || preselectedTestId
        if (preselected) {
          const found = [...tests, ...rad, ...pkgs].find((s: any) => s._id === preselected || s.name?.toLowerCase() === preselected?.toLowerCase())
          if (found) {
            const isPackage = 'benefits' in found || pkgs.some((p: any) => p._id === found._id)
            const isRadiology = rad.some((r: any) => r._id === found._id)
            setServiceTab(isPackage ? 'package' : isRadiology ? 'radiology' : 'lab')
            setSelectedService({
              _id: found._id, name: found.name,
              originalPrice: found.originalPrice || found.price || 0,
              offerPrice: found.offerPrice || found.discountPrice || found.price,
            })
            setStep(2)
          }
        }
      })
      .catch(() => {
        toast.error('Failed to load services')
      })
      .finally(() => setLoadingData(false))
  }, [preselectedTestId, preselectedPackage])

  const currentList = useMemo(() => {
    const list = serviceTab === 'radiology' ? allRadiology : serviceTab === 'package' ? allPackages : allTests
    if (!searchQuery.trim()) return list
    const q = searchQuery.toLowerCase()
    return list.filter(s => s.name.toLowerCase().includes(q))
  }, [serviceTab, allTests, allRadiology, allPackages, searchQuery])

  const selectService = (svc: ServiceOption) => setSelectedService(svc)

  const updateField = (field: string, value: string) => setFormData(prev => ({ ...prev, [field]: value }))

  const submitBooking = async () => {
    if (!selectedService) return
    setSubmitting(true)
    try {
      const serviceTypeMap: Record<ServiceTab, string> = { lab: 'Laboratory', radiology: 'Radiology', package: 'Health Package' }
      const idFieldMap: Record<ServiceTab, string> = { lab: 'testId', radiology: 'radiologyId', package: 'packageId' }
      const payload: any = {
        [idFieldMap[serviceTab]]: selectedService._id,
        serviceType: serviceTypeMap[serviceTab],
        serviceName: selectedService.name,
        patientName: formData.patientName,
        dob: formData.dob,
        age: parseInt(formData.age) || 0,
        gender: formData.gender,
        mobileNumber: formData.mobileNumber,
        email: formData.email,
        address: formData.address,
        preferredDate: formData.preferredDate,
        preferredTime: formData.preferredTime,
        homeCollection: formData.homeCollection === 'Yes',
        additionalNotes: formData.additionalNotes,
      }
      const res = await api.post('/bookings', payload)
      setBookingId(res.data?.booking?.bookingId || res.data?.bookingId || '')
      setStep(4)
      toast.success('Booking confirmed successfully!')
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to create booking.')
    }
    setSubmitting(false)
  }

  const goNext = () => {
    if (!selectedService) { toast.error('Please select a service'); return }
    setStep(2)
  }

  const serviceName = selectedService?.name || ''
  const servicePrice = selectedService?.offerPrice || selectedService?.originalPrice || 0

  return (
    <>
      <main className="min-h-screen bg-[#F8FBFC]">
        <PageTransition>
          <section className="py-10">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-8">
                <span className="inline-block px-4 py-1.5 rounded-full bg-[#1BAE9A]/5 text-[#1BAE9A] text-sm font-medium mb-4 border border-[#1BAE9A]/10">
                  <Sparkles className="w-4 h-4 inline mr-1" /> Book a Test
                </span>
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Schedule Your Test</h1>
                <p className="text-gray-500 mt-2">Complete the steps below to book your diagnostic test</p>
              </div>

              <div className="mb-8 px-4">
                <div className="flex items-center justify-between">
                  {steps.map((s, i) => (
                    <div key={s.num} className="flex items-center flex-1">
                      <div className="flex flex-col items-center">
                        <div className={cn(
                          'w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all border-2',
                          step > s.num
                            ? 'bg-[#4CAF50] border-[#4CAF50] text-white'
                            : step === s.num
                              ? 'bg-[#1BAE9A] border-[#1BAE9A] text-white shadow-lg shadow-[#1BAE9A]/30'
                              : 'bg-white border-gray-200 text-gray-400'
                        )}>
                          {step > s.num ? <Check className="w-4 h-4" /> : s.num}
                        </div>
                        <span className={cn('text-[10px] mt-1 font-medium hidden sm:block', step >= s.num ? 'text-[#1BAE9A]' : 'text-gray-400')}>
                          {s.label}
                        </span>
                      </div>
                      {i < steps.length - 1 && (
                        <div className={cn('flex-1 h-0.5 mx-2 mt-[-1.25rem]', step > s.num ? 'bg-[#4CAF50]' : 'bg-gray-200')} />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-6 sm:p-8">
                <AnimatePresence mode="wait">
                  {step === 1 && (
                    <motion.div key="step1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                      <h2 className="text-xl font-bold text-gray-900 mb-4">Select a Service</h2>

                      <div className="flex gap-2 mb-5 p-1 bg-gray-100 rounded-xl">
                        {serviceTabs.map(tab => {
                          const TabIcon = tab.icon
                          return (
                            <button
                              key={tab.key}
                              onClick={() => { setServiceTab(tab.key); setSelectedService(null); setSearchQuery('') }}
                              className={cn(
                                'flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                                serviceTab === tab.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                              )}
                            >
                              <TabIcon className="w-4 h-4" />
                              <span className="hidden sm:inline">{tab.label}</span>
                            </button>
                          )
                        })}
                      </div>

                      <div className="relative mb-5">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder={`Search ${serviceTab === 'radiology' ? 'radiology services' : serviceTab === 'package' ? 'health packages' : 'tests'}...`}
                          className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#1BAE9A] focus:ring-4 focus:ring-[#1BAE9A]/10 outline-none transition-all text-sm"
                          autoFocus
                        />
                      </div>

                      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                        {loadingData ? (
                          <div className="text-center py-10">
                            <div className="w-8 h-8 border-2 border-[#1BAE9A] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                            <p className="text-sm text-gray-400">Loading services...</p>
                          </div>
                        ) : currentList.length === 0 ? (
                          <div className="text-center py-10 text-gray-400">
                            <Search className="w-10 h-10 mx-auto mb-3 opacity-50" />
                            <p className="text-sm">No services found</p>
                          </div>
                        ) : (
                          currentList.map((svc, i) => {
                            const Icon = testIcons[i % testIcons.length]
                            const isSelected = selectedService?._id === svc._id
                            const displayPrice = svc.offerPrice || svc.originalPrice || svc.price || 0
                            const originalPrice = svc.originalPrice || svc.price || 0
                            return (
                              <motion.div key={svc._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.03 }}
                                onClick={() => selectService(svc)}
                                className={cn(
                                  'flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all',
                                  isSelected ? 'border-[#1BAE9A] bg-[#1BAE9A]/5 shadow-md shadow-[#1BAE9A]/10' : 'border-gray-100 hover:border-[#1BAE9A]/20 hover:bg-gray-50'
                                )}
                              >
                                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all', isSelected ? 'bg-[#1BAE9A] text-white' : 'bg-[#1BAE9A]/5 text-[#1BAE9A]')}>
                                  <Icon className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-gray-800 truncate">{svc.name}</p>
                                </div>
                                <div className="text-right shrink-0">
                                  {originalPrice > displayPrice ? (
                                    <><p className="text-sm font-bold text-[#1BAE9A]">{formatPrice(displayPrice)}</p><p className="text-xs text-gray-400 line-through">{formatPrice(originalPrice)}</p></>
                                  ) : (
                                    <p className="text-sm font-bold text-gray-800">{formatPrice(displayPrice)}</p>
                                  )}
                                </div>
                                <div className={cn('w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0', isSelected ? 'border-[#1BAE9A] bg-[#1BAE9A]' : 'border-gray-300')}>
                                  {isSelected && <Check className="w-3 h-3 text-white" />}
                                </div>
                              </motion.div>
                            )
                          })
                        )}
                      </div>

                      <div className="flex justify-end mt-6 pt-4 border-t border-gray-100">
                        <Button onClick={goNext} disabled={!selectedService} className="bg-[#1BAE9A] hover:bg-[#168E7E] text-white gap-2">
                          Continue <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </motion.div>
                  )}

                  {step === 2 && (
                    <motion.div key="step2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                        <div className="w-10 h-10 rounded-xl bg-[#1BAE9A]/5 flex items-center justify-center">
                          <Activity className="w-5 h-5 text-[#1BAE9A]" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{serviceName}</p>
                        </div>
                        <div className="ml-auto text-right">
                          <p className="text-sm font-bold text-[#1BAE9A]">{formatPrice(servicePrice)}</p>
                        </div>
                      </div>

                      <h2 className="text-xl font-bold text-gray-900 mb-5">Patient Details</h2>

                      <div className="space-y-4">
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Patient Name *</label>
                            <input type="text" value={formData.patientName} onChange={(e) => updateField('patientName', e.target.value)}
                              placeholder="Enter patient name"
                              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#1BAE9A] focus:ring-4 focus:ring-[#1BAE9A]/10 outline-none transition-all text-sm" />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Date of Birth *</label>
                            <input type="date" value={formData.dob} onChange={(e) => updateField('dob', e.target.value)}
                              max={new Date().toISOString().split('T')[0]}
                              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#1BAE9A] focus:ring-4 focus:ring-[#1BAE9A]/10 outline-none transition-all text-sm" />
                          </div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Age *</label>
                            <input type="number" value={formData.age} onChange={(e) => updateField('age', e.target.value)}
                              placeholder="Enter age"
                              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#1BAE9A] focus:ring-4 focus:ring-[#1BAE9A]/10 outline-none transition-all text-sm" />
                          </div>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-1.5 block">Gender *</label>
                          <div className="flex gap-3">
                            {['Male', 'Female', 'Other'].map((g) => (
                              <label key={g} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 cursor-pointer hover:border-[#1BAE9A]/30 transition-all has-[:checked]:border-[#1BAE9A] has-[:checked]:bg-[#1BAE9A]/5">
                                <input type="radio" checked={formData.gender === g} onChange={() => updateField('gender', g)} className="accent-[#1BAE9A]" />
                                <span className="text-sm font-medium text-gray-700">{g}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Mobile Number *</label>
                            <input type="tel" value={formData.mobileNumber} onChange={(e) => updateField('mobileNumber', e.target.value)}
                              placeholder="Enter mobile number"
                              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#1BAE9A] focus:ring-4 focus:ring-[#1BAE9A]/10 outline-none transition-all text-sm" />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Email</label>
                            <input type="email" value={formData.email} onChange={(e) => updateField('email', e.target.value)}
                              placeholder="Enter email address"
                              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#1BAE9A] focus:ring-4 focus:ring-[#1BAE9A]/10 outline-none transition-all text-sm" />
                          </div>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-1.5 block">Address *</label>
                          <input type="text" value={formData.address} onChange={(e) => updateField('address', e.target.value)}
                            placeholder="Enter full address"
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#1BAE9A] focus:ring-4 focus:ring-[#1BAE9A]/10 outline-none transition-all text-sm" />
                        </div>

                        <div className="border-t border-gray-100 pt-4">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">Preferred Schedule</h3>
                          <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Preferred Date *</label>
                              <input type="date" value={formData.preferredDate} onChange={(e) => updateField('preferredDate', e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#1BAE9A] focus:ring-4 focus:ring-[#1BAE9A]/10 outline-none transition-all text-sm" />
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Preferred Time *</label>
                              <select value={formData.preferredTime} onChange={(e) => updateField('preferredTime', e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#1BAE9A] focus:ring-4 focus:ring-[#1BAE9A]/10 outline-none transition-all text-sm">
                                <option value="">Select time slot</option>
                                {defaultTimeSlots.map((slot) => <option key={slot} value={slot}>{slot}</option>)}
                              </select>
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-1.5 block">Home Collection</label>
                          <div className="flex gap-3">
                            {['Yes', 'No'].map((opt) => (
                              <label key={opt} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 cursor-pointer hover:border-[#1BAE9A]/30 transition-all has-[:checked]:border-[#1BAE9A] has-[:checked]:bg-[#1BAE9A]/5">
                                <input type="radio" checked={formData.homeCollection === opt} onChange={() => updateField('homeCollection', opt)} className="accent-[#1BAE9A]" />
                                <span className="text-sm font-medium text-gray-700">{opt}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-1.5 block">Additional Notes</label>
                          <textarea value={formData.additionalNotes} onChange={(e) => updateField('additionalNotes', e.target.value)}
                            placeholder="Any specific instructions..."
                            rows={2}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#1BAE9A] focus:ring-4 focus:ring-[#1BAE9A]/10 outline-none transition-all text-sm resize-none" />
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                        <Button variant="outline" onClick={() => setStep(1)} className="gap-2 border-gray-200">
                          <ChevronLeft className="w-4 h-4" /> Back
                        </Button>
                        <Button onClick={() => {
                          const required = ['patientName', 'dob', 'mobileNumber', 'gender', 'age', 'address', 'preferredDate', 'preferredTime']
                          const missing = required.find(f => !formData[f as keyof typeof formData])
                          if (missing) { toast.error(`Please fill in ${missing.replace(/([A-Z])/g, ' $1').toLowerCase()}`); return }
                          setStep(3)
                        }} className="bg-[#1BAE9A] hover:bg-[#168E7E] text-white gap-2">
                          Continue <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </motion.div>
                  )}

                  {step === 3 && (
                    <motion.div key="step3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                      <h2 className="text-xl font-bold text-gray-900 mb-6">Review & Confirm</h2>

                      <div className="bg-gradient-to-br from-[#1BAE9A]/5 to-white rounded-xl border border-[#1BAE9A]/10 p-5 mb-6">
                        <div className="flex items-center gap-3">
                          <Activity className="w-5 h-5 text-[#1BAE9A]" />
                          <div>
                            <p className="font-semibold text-gray-900">{serviceName}</p>
                          </div>
                          <div className="ml-auto">
                            <p className="text-lg font-bold text-[#1BAE9A]">{formatPrice(servicePrice)}</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 mb-6">
                        {[ 
                          { icon: User, label: 'Patient Name', value: formData.patientName },
                          { icon: Calendar, label: 'Date of Birth', value: formData.dob },
                          { icon: User, label: 'Age / Gender', value: `${formData.age} / ${formData.gender}` },
                          { icon: Phone, label: 'Mobile', value: formData.mobileNumber },
                          { icon: Mail, label: 'Email', value: formData.email },
                          { icon: MapPin, label: 'Address', value: formData.address },
                          { icon: Calendar, label: 'Preferred Date', value: formData.preferredDate },
                          { icon: Clock, label: 'Preferred Time', value: formData.preferredTime },
                          { icon: Home, label: 'Home Collection', value: formData.homeCollection },
                        ].map((d) => (
                          <div key={d.label} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                            <d.icon className="w-4 h-4 text-gray-400 shrink-0" />
                            <span className="text-xs text-gray-500 w-28 shrink-0">{d.label}</span>
                            <span className="text-sm font-medium text-gray-800">{d.value}</span>
                          </div>
                        ))}
                        {formData.additionalNotes && (
                          <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                            <FileText className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                            <span className="text-xs text-gray-500 w-28 shrink-0">Notes</span>
                            <span className="text-sm text-gray-600">{formData.additionalNotes}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <Button variant="outline" onClick={() => setStep(2)} disabled={submitting} className="gap-2 border-gray-200">
                          <ChevronLeft className="w-4 h-4" /> Edit
                        </Button>
                        <Button onClick={submitBooking} disabled={submitting}
                          className="bg-[#1BAE9A] hover:bg-[#168E7E] text-white gap-2 min-w-[160px]">
                          {submitting ? (
                            <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Booking...</>
                          ) : (
                            <>Confirm Booking <Check className="w-4 h-4" /></>
                          )}
                        </Button>
                      </div>
                    </motion.div>
                  )}

                  {step === 4 && (
                    <motion.div key="step4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="text-center py-4">
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                        className="w-20 h-20 mx-auto rounded-2xl bg-green-100 flex items-center justify-center mb-6">
                        <CheckCircle2 className="w-10 h-10 text-green-600" />
                      </motion.div>

                      <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h2>
                      <p className="text-gray-500 mb-6">Your booking has been confirmed successfully.</p>

                      <div className="inline-block bg-gradient-to-br from-[#1BAE9A]/5 to-white rounded-xl border border-[#1BAE9A]/10 p-6 mb-8">
                        <p className="text-xs text-gray-500 mb-1">Booking ID</p>
                        <p className="text-2xl font-bold text-[#1BAE9A] font-mono">{bookingId}</p>
                      </div>

                      <div className="space-y-2 mb-8 text-sm text-gray-500">
                        <p>We have sent the booking details to your email and mobile.</p>
                        <p>Please save this Booking ID for future reference.</p>
                      </div>

                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8 text-left">
                        <p className="font-semibold text-amber-800 text-sm mb-1">IMPORTANT</p>
                        <p className="text-amber-700 text-sm leading-relaxed">
                          Please keep your doctor's prescription ready during sample collection or diagnostic visit. This helps our team provide faster and more accurate service.
                        </p>
                      </div>

                      <div className="flex flex-wrap justify-center gap-3">
                        <a href="/track-order">
                          <Button className="bg-[#1BAE9A] hover:bg-[#168E7E] text-white gap-2">
                            Track Order <ArrowRight className="w-4 h-4" />
                          </Button>
                        </a>
                        <a href="/tests">
                          <Button variant="outline" className="border-gray-200 gap-2">
                            Book Another Test
                          </Button>
                        </a>
                        <a href="/">
                          <Button variant="ghost" className="gap-2">
                            <Home className="w-4 h-4" /> Home
                          </Button>
                        </a>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </section>
        </PageTransition>
      </main>
      <Footer />
    </>
  )
}

type BookingStep = 1 | 2 | 3 | 4

export default function BookingPage() {
  return <Suspense fallback={null}><BookingPageContent /></Suspense>
}
