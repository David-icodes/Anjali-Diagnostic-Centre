'use client'

import { Suspense, useEffect, useMemo, useState, type InputHTMLAttributes } from 'react'
import { useSearchParams } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Activity,
  ArrowRight,
  Calendar,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileText,
  Home,
  Mail,
  MapPin,
  Phone,
  Search,
  Sparkles,
  User,
  FlaskRoundIcon as Flask,
  Scan,
} from 'lucide-react'
import toast from 'react-hot-toast'
import api from '@/lib/api'
import { clearBookingCart, readBookingCart } from '@/lib/bookingCart'
import Footer from '@/components/layout/Footer'
import PageTransition from '@/components/layout/PageTransition'
import { Button } from '@/components/ui/button'
import { cn, formatPrice } from '@/lib/utils'

interface ServiceOption {
  _id: string
  name: string
  serviceType: 'Laboratory' | 'Radiology' | 'Health Package'
  category: string
  originalPrice: number
  offerPrice?: number
}

interface SelectedService {
  serviceId: string
  serviceType: 'Laboratory' | 'Radiology'
  name: string
  price: number
}

type ServiceTab = 'lab' | 'radiology' | 'package'
type BookingStep = 1 | 2 | 3 | 4

const steps = [
  { num: 1, label: 'Select Services' },
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

const serviceTabs: { key: ServiceTab; label: string; icon: any }[] = [
  { key: 'lab', label: 'Lab Tests', icon: Flask },
  { key: 'radiology', label: 'Radiology', icon: Scan },
  { key: 'package', label: 'Health Packages', icon: Activity },
]

const departmentOptions = ['All Tests', 'Blood Test', 'Diabetes', 'Thyroid', 'Liver', 'Kidney', 'Heart', 'Hormones', 'Vitamin', 'Radiology']

function BookingPageContent() {
  const searchParams = useSearchParams()
  const preselectedTestId = searchParams.get('testId') || searchParams.get('test')
  const preselectedRadiologyId = searchParams.get('radiology')
  const preselectedPackage = searchParams.get('package')
  const preselectedDepartment = searchParams.get('department') || 'All Tests'
  const source = searchParams.get('source')

  const [step, setStep] = useState<BookingStep>(1)
  const [serviceTab, setServiceTab] = useState<ServiceTab>(preselectedDepartment === 'Radiology' ? 'radiology' : 'lab')
  const [allTests, setAllTests] = useState<ServiceOption[]>([])
  const [allRadiology, setAllRadiology] = useState<ServiceOption[]>([])
  const [allPackages, setAllPackages] = useState<ServiceOption[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [activeDepartment, setActiveDepartment] = useState(preselectedDepartment)
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([])
  const [selectedPackage, setSelectedPackage] = useState<ServiceOption | null>(null)
  const [bookingId, setBookingId] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState({
    patientName: '', mobileNumber: '', email: '', gender: '',
    dob: '', age: '', address: '', preferredDate: '', preferredTime: '',
    homeCollection: 'Yes', additionalNotes: '',
  })

  useEffect(() => {
    setLoadingData(true)
    Promise.all([
      api.get('/tests', { params: { limit: 250, isActive: true } }),
      api.get('/radiology', { params: { limit: 250, isActive: true } }),
      api.get('/health-packages', { params: { limit: 100, isActive: true } }),
    ])
      .then(([testsRes, radRes, pkgRes]) => {
        const mappedTests: ServiceOption[] = (testsRes.data?.tests || testsRes.data || []).map((test: any) => ({
          _id: test._id,
          name: test.name,
          serviceType: 'Laboratory' as const,
          category: test.category || 'Other',
          originalPrice: test.originalPrice || test.price || 0,
          offerPrice: test.hasOffer && test.offerPrice > 0 ? test.offerPrice : 0,
        }))
        const mappedRadiology: ServiceOption[] = (radRes.data?.services || radRes.data || []).map((service: any) => ({
          _id: service._id,
          name: service.name,
          serviceType: 'Radiology' as const,
          category: 'Radiology',
          originalPrice: service.price || 0,
        }))
        const mappedPackages: ServiceOption[] = (pkgRes.data?.packages || pkgRes.data || []).map((pkg: any) => ({
          _id: pkg._id,
          name: pkg.name,
          serviceType: 'Health Package' as const,
          category: 'Health Package',
          originalPrice: pkg.originalPrice || 0,
          offerPrice: pkg.hasOffer && pkg.offerPrice > 0 ? pkg.offerPrice : 0,
        }))

        setAllTests(mappedTests)
        setAllRadiology(mappedRadiology)
        setAllPackages(mappedPackages)

        if (preselectedPackage) {
          const pkg = mappedPackages.find((item) => item._id === preselectedPackage)
          if (pkg) {
            setSelectedPackage(pkg)
            setServiceTab('package')
            setStep(2)
            return
          }
        }

        if (preselectedTestId || preselectedRadiologyId) {
          const directSelections = [
            ...mappedTests.filter((item) => item._id === preselectedTestId),
            ...mappedRadiology.filter((item) => item._id === preselectedRadiologyId),
          ].map((item) => ({
            serviceId: item._id,
            serviceType: item.serviceType as 'Laboratory' | 'Radiology',
            name: item.name,
            price: item.offerPrice || item.originalPrice,
          }))

          if (directSelections.length > 0) {
            setSelectedServices(directSelections)
            setServiceTab(directSelections[0].serviceType === 'Radiology' ? 'radiology' : 'lab')
            setStep(2)
            return
          }
        }

        const cartSelections = source === 'cart' || (!preselectedPackage && !preselectedTestId && !preselectedRadiologyId)
          ? readBookingCart()
          : []

        if (cartSelections.length > 0) {
          setSelectedServices(cartSelections)
          setServiceTab(cartSelections.some((item) => item.serviceType === 'Radiology') ? 'radiology' : 'lab')
          setStep(2)
        }
      })
      .catch(() => toast.error('Failed to load services'))
      .finally(() => setLoadingData(false))
  }, [preselectedPackage, preselectedRadiologyId, preselectedTestId, source])

  const currentList = useMemo(() => {
    const list = serviceTab === 'radiology' ? allRadiology : serviceTab === 'package' ? allPackages : allTests
    const normalizedQuery = searchQuery.trim().toLowerCase()

    return list.filter((service) => {
      const matchesSearch = !normalizedQuery || service.name.toLowerCase().includes(normalizedQuery)
      if (serviceTab === 'package') return matchesSearch
      const matchesDepartment = activeDepartment === 'All Tests' || (activeDepartment === 'Radiology' ? service.serviceType === 'Radiology' : service.category === activeDepartment)
      return matchesSearch && matchesDepartment
    })
  }, [activeDepartment, allPackages, allRadiology, allTests, searchQuery, serviceTab])

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setFieldErrors((prev) => ({ ...prev, [field]: '' }))
  }

  const handleMobileChange = (value: string) => updateField('mobileNumber', value.replace(/\D/g, '').slice(0, 10))
  const setDepartment = (department: string) => {
    setActiveDepartment(department)
    if (department === 'Radiology') setServiceTab('radiology')
    else if (serviceTab === 'radiology') setServiceTab('lab')
  }

  const toggleService = (service: ServiceOption) => {
    if (serviceTab === 'package') {
      setSelectedServices([])
      setSelectedPackage((prev) => prev?._id === service._id ? null : service)
      return
    }

    setSelectedPackage(null)
    const mapped: SelectedService = {
      serviceId: service._id,
      serviceType: service.serviceType as 'Laboratory' | 'Radiology',
      name: service.name,
      price: service.offerPrice || service.originalPrice,
    }

    setSelectedServices((prev) => {
      const exists = prev.some((item) => item.serviceId === mapped.serviceId && item.serviceType === mapped.serviceType)
      return exists ? prev.filter((item) => !(item.serviceId === mapped.serviceId && item.serviceType === mapped.serviceType)) : [...prev, mapped]
    })
  }

  const totalAmount = useMemo(() => selectedPackage ? (selectedPackage.offerPrice || selectedPackage.originalPrice) : selectedServices.reduce((sum, item) => sum + item.price, 0), [selectedPackage, selectedServices])
  const selectionItems = selectedPackage ? [{ key: selectedPackage._id, name: selectedPackage.name, type: 'Health Package', price: selectedPackage.offerPrice || selectedPackage.originalPrice }] : selectedServices.map((item) => ({ key: `${item.serviceType}-${item.serviceId}`, name: item.name, type: item.serviceType, price: item.price }))

  const validateForm = () => {
    const errors: Record<string, string> = {}
    if (!formData.patientName.trim()) errors.patientName = 'Patient name is required'
    if (!formData.dob) errors.dob = 'Date of birth is required'
    if (!formData.age || Number(formData.age) <= 0) errors.age = 'Valid age is required'
    if (!formData.gender) errors.gender = 'Gender is required'
    if (!/^\d{10}$/.test(formData.mobileNumber)) errors.mobileNumber = 'Mobile number must be exactly 10 digits'
    if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) errors.email = 'Enter a valid email address'
    if (!formData.address.trim()) errors.address = 'Address is required'
    if (!formData.preferredDate) errors.preferredDate = 'Preferred date is required'
    if (!formData.preferredTime) errors.preferredTime = 'Preferred time is required'
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const submitBooking = async () => {
    if (!selectedPackage && selectedServices.length === 0) return
    if (!validateForm()) {
      toast.error('Please correct the highlighted fields')
      setStep(2)
      return
    }

    setSubmitting(true)
    try {
      const payload: any = {
        patientName: formData.patientName.trim(),
        dob: formData.dob,
        age: parseInt(formData.age, 10) || 0,
        gender: formData.gender,
        mobileNumber: formData.mobileNumber,
        email: formData.email.trim(),
        address: formData.address.trim(),
        preferredDate: formData.preferredDate,
        preferredTime: formData.preferredTime,
        homeCollection: formData.homeCollection === 'Yes',
        additionalNotes: formData.additionalNotes,
      }

      if (selectedPackage) {
        payload.serviceType = 'Health Package'
        payload.packageId = selectedPackage._id
      } else {
        payload.selectedServices = selectedServices.map((item) => ({ serviceId: item.serviceId, serviceType: item.serviceType }))
      }

      const res = await api.post('/bookings', payload)
      clearBookingCart()
      setBookingId(res.data?.booking?.bookingId || res.data?.bookingId || '')
      setStep(4)
      toast.success('Booking confirmed successfully!')
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to create booking.')
    } finally {
      setSubmitting(false)
    }
  }

  const goNext = () => {
    if (!selectedPackage && selectedServices.length === 0) {
      toast.error('Please select at least one service')
      return
    }
    setStep(2)
  }

  return (
    <>
      <main className="min-h-screen bg-[#F8FBFC]">
        <PageTransition>
          <section className="py-10">
            <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
              <div className="mb-8 text-center">
                <span className="mb-4 inline-block rounded-full border border-[#1BAE9A]/10 bg-[#1BAE9A]/5 px-4 py-1.5 text-sm font-medium text-[#1BAE9A]"><Sparkles className="mr-1 inline h-4 w-4" /> Book a Test</span>
                <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">Schedule Your Test</h1>
                <p className="mt-2 text-gray-500">Select one or more services, review the summary, and complete a single booking.</p>
              </div>

              <div className="mb-8 px-4"><div className="flex items-center justify-between">{steps.map((s, i) => <div key={s.num} className="flex flex-1 items-center"><div className="flex flex-col items-center"><div className={cn('flex h-9 w-9 items-center justify-center rounded-full border-2 text-xs font-bold transition-all', step > s.num ? 'border-[#4CAF50] bg-[#4CAF50] text-white' : step === s.num ? 'border-[#1BAE9A] bg-[#1BAE9A] text-white shadow-lg shadow-[#1BAE9A]/30' : 'border-gray-200 bg-white text-gray-400')}>{step > s.num ? <Check className="h-4 w-4" /> : s.num}</div><span className={cn('mt-1 hidden text-[10px] font-medium sm:block', step >= s.num ? 'text-[#1BAE9A]' : 'text-gray-400')}>{s.label}</span></div>{i < steps.length - 1 ? <div className={cn('mx-2 mt-[-1.25rem] h-0.5 flex-1', step > s.num ? 'bg-[#4CAF50]' : 'bg-gray-200')} /> : null}</div>)}</div></div>

              <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-lg sm:p-8">
                  <AnimatePresence mode="wait">
                    {step === 1 ? <motion.div key="step-1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}><h2 className="mb-4 text-xl font-bold text-gray-900">Select Services</h2><div className="mb-5 flex gap-2 rounded-xl bg-gray-100 p-1">{serviceTabs.map((tab) => { const TabIcon = tab.icon; return <button key={tab.key} onClick={() => { setServiceTab(tab.key); setSearchQuery(''); if (tab.key === 'package') setActiveDepartment('All Tests'); if (tab.key === 'radiology') setActiveDepartment('Radiology') }} className={cn('flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-all', serviceTab === tab.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700')}><TabIcon className="h-4 w-4" /><span className="hidden sm:inline">{tab.label}</span></button> })}</div>{serviceTab !== 'package' ? <div className="mb-5 flex flex-wrap gap-2">{departmentOptions.map((department) => <button key={department} type="button" onClick={() => setDepartment(department)} className={cn('rounded-full border px-3 py-1.5 text-sm font-medium transition-all', activeDepartment === department ? 'border-[#1BAE9A] bg-[#1BAE9A]/10 text-[#0F766E]' : 'border-gray-200 bg-white text-gray-500 hover:border-[#1BAE9A]/30 hover:text-[#0F766E]')}>{department}</button>)}</div> : null}<div className="relative mb-5"><Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" /><input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={`Search ${serviceTab === 'radiology' ? 'radiology services' : serviceTab === 'package' ? 'health packages' : 'tests'}...`} className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3.5 pl-12 pr-4 text-sm outline-none transition-all focus:border-[#1BAE9A] focus:bg-white focus:ring-4 focus:ring-[#1BAE9A]/10" /></div><div className="max-h-[420px] space-y-2 overflow-y-auto pr-1">{loadingData ? <div className="py-10 text-center"><div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-[#1BAE9A] border-t-transparent" /><p className="text-sm text-gray-400">Loading services...</p></div> : currentList.length === 0 ? <div className="py-10 text-center text-gray-400"><Search className="mx-auto mb-3 h-10 w-10 opacity-50" /><p className="text-sm">No services found</p></div> : currentList.map((service, index) => { const isSelected = serviceTab === 'package' ? selectedPackage?._id === service._id : selectedServices.some((item) => item.serviceId === service._id && item.serviceType === service.serviceType); const displayPrice = service.offerPrice || service.originalPrice; return <motion.button key={`${service.serviceType}-${service._id}`} type="button" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.02 }} onClick={() => toggleService(service)} className={cn('flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-all', isSelected ? 'border-[#1BAE9A] bg-[#1BAE9A]/5 shadow-md shadow-[#1BAE9A]/10' : 'border-gray-100 hover:border-[#1BAE9A]/20 hover:bg-gray-50')}><div className={cn('flex h-5 w-5 shrink-0 items-center justify-center rounded border-2', isSelected ? 'border-[#1BAE9A] bg-[#1BAE9A] text-white' : 'border-gray-300 bg-white text-transparent')}><Check className="h-3 w-3" /></div><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-gray-800">{service.name}</p></div><div className="text-right"><p className="text-sm font-bold text-gray-800">{formatPrice(displayPrice)}</p></div></motion.button> })}</div><div className="mt-6 flex justify-end border-t border-gray-100 pt-4"><Button onClick={goNext} disabled={!selectedPackage && selectedServices.length === 0} className="gap-2 bg-[#1BAE9A] text-white hover:bg-[#168E7E]">Continue <ChevronRight className="h-4 w-4" /></Button></div></motion.div> : null}
                    {step === 2 ? <motion.div key="step-2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}><div className="mb-6 rounded-xl border border-[#1BAE9A]/10 bg-[#1BAE9A]/5 p-4"><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-semibold text-gray-900">{selectionItems.length} selected service{selectionItems.length > 1 ? 's' : ''}</p><p className="mt-1 text-xs text-gray-500">Review details before confirming.</p></div><p className="text-sm font-bold text-[#1BAE9A]">{formatPrice(totalAmount)}</p></div></div><h2 className="mb-5 text-xl font-bold text-gray-900">Patient Details</h2><div className="space-y-4"><div className="grid gap-4 sm:grid-cols-2"><Field label="Patient Name *" value={formData.patientName} onValueChange={(value) => updateField('patientName', value)} error={fieldErrors.patientName} placeholder="Enter patient name" /><Field label="Date of Birth *" value={formData.dob} onValueChange={(value) => updateField('dob', value)} error={fieldErrors.dob} type="date" max={new Date().toISOString().split('T')[0]} /></div><div className="grid gap-4 sm:grid-cols-2"><Field label="Age *" value={formData.age} onValueChange={(value) => updateField('age', value)} error={fieldErrors.age} type="number" placeholder="Enter age" /><div><label className="mb-1.5 block text-sm font-medium text-gray-700">Gender *</label><div className="flex gap-3">{['Male', 'Female', 'Other'].map((gender) => <label key={gender} className="flex cursor-pointer items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 transition-all hover:border-[#1BAE9A]/30 has-[:checked]:border-[#1BAE9A] has-[:checked]:bg-[#1BAE9A]/5"><input type="radio" checked={formData.gender === gender} onChange={() => updateField('gender', gender)} className="accent-[#1BAE9A]" /><span className="text-sm font-medium text-gray-700">{gender}</span></label>)}</div>{fieldErrors.gender ? <p className="mt-1 text-xs text-red-500">{fieldErrors.gender}</p> : null}</div></div><div className="grid gap-4 sm:grid-cols-2"><Field label="Mobile Number *" value={formData.mobileNumber} onValueChange={handleMobileChange} error={fieldErrors.mobileNumber} type="tel" placeholder="Enter 10-digit mobile number" maxLength={10} inputMode="numeric" /><Field label="Email" value={formData.email} onValueChange={(value) => updateField('email', value)} error={fieldErrors.email} type="email" placeholder="Enter email address (optional)" /></div><Field label="Address *" value={formData.address} onValueChange={(value) => updateField('address', value)} error={fieldErrors.address} placeholder="Enter full address" /><div className="border-t border-gray-100 pt-4"><h3 className="mb-4 text-lg font-semibold text-gray-900">Preferred Schedule</h3><div className="grid gap-4 sm:grid-cols-2"><Field label="Preferred Date *" value={formData.preferredDate} onValueChange={(value) => updateField('preferredDate', value)} error={fieldErrors.preferredDate} type="date" min={new Date().toISOString().split('T')[0]} /><div><label className="mb-1.5 block text-sm font-medium text-gray-700">Preferred Time *</label><select value={formData.preferredTime} onChange={(e) => updateField('preferredTime', e.target.value)} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none transition-all focus:border-[#1BAE9A] focus:bg-white focus:ring-4 focus:ring-[#1BAE9A]/10"><option value="">Select time slot</option>{defaultTimeSlots.map((slot) => <option key={slot} value={slot}>{slot}</option>)}</select>{fieldErrors.preferredTime ? <p className="mt-1 text-xs text-red-500">{fieldErrors.preferredTime}</p> : null}</div></div></div><div><label className="mb-1.5 block text-sm font-medium text-gray-700">Home Collection</label><div className="flex gap-3">{['Yes', 'No'].map((value) => <label key={value} className="flex cursor-pointer items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 transition-all hover:border-[#1BAE9A]/30 has-[:checked]:border-[#1BAE9A] has-[:checked]:bg-[#1BAE9A]/5"><input type="radio" checked={formData.homeCollection === value} onChange={() => updateField('homeCollection', value)} className="accent-[#1BAE9A]" /><span className="text-sm font-medium text-gray-700">{value}</span></label>)}</div></div><div><label className="mb-1.5 block text-sm font-medium text-gray-700">Additional Notes</label><textarea value={formData.additionalNotes} onChange={(e) => updateField('additionalNotes', e.target.value)} rows={2} placeholder="Any specific instructions..." className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none transition-all focus:border-[#1BAE9A] focus:bg-white focus:ring-4 focus:ring-[#1BAE9A]/10" /></div></div><div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4"><Button variant="outline" onClick={() => setStep(1)} className="gap-2 border-gray-200"><ChevronLeft className="h-4 w-4" /> Back</Button><Button onClick={() => { if (validateForm()) setStep(3); else toast.error('Please correct the highlighted fields') }} className="gap-2 bg-[#1BAE9A] text-white hover:bg-[#168E7E]">Continue <ChevronRight className="h-4 w-4" /></Button></div></motion.div> : null}
                    {step === 3 ? <motion.div key="step-3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}><h2 className="mb-6 text-xl font-bold text-gray-900">Review & Confirm</h2><div className="mb-6 rounded-xl border border-[#1BAE9A]/10 bg-gradient-to-br from-[#1BAE9A]/5 to-white p-5"><div className="space-y-3">{selectionItems.map((item) => <div key={item.key} className="flex items-center justify-between gap-3 rounded-lg bg-white/80 p-3"><div><p className="font-semibold text-gray-900">{item.name}</p><p className="mt-1 text-xs text-gray-500">{item.type}</p></div><p className="text-sm font-bold text-[#1BAE9A]">{formatPrice(item.price)}</p></div>)}<div className="flex items-center justify-between border-t border-[#1BAE9A]/10 pt-3"><p className="text-sm font-semibold text-gray-900">Total Amount</p><p className="text-lg font-bold text-[#1BAE9A]">{formatPrice(totalAmount)}</p></div></div></div><div className="mb-6 space-y-2">{[{ icon: User, label: 'Patient Name', value: formData.patientName },{ icon: Calendar, label: 'Date of Birth', value: formData.dob },{ icon: User, label: 'Age / Gender', value: `${formData.age} / ${formData.gender}` },{ icon: Phone, label: 'Mobile', value: formData.mobileNumber },{ icon: Mail, label: 'Email', value: formData.email || 'Not provided' },{ icon: MapPin, label: 'Address', value: formData.address },{ icon: Calendar, label: 'Preferred Date', value: formData.preferredDate },{ icon: Clock, label: 'Preferred Time', value: formData.preferredTime },{ icon: Home, label: 'Home Collection', value: formData.homeCollection }].map((detail) => <div key={detail.label} className="flex items-center gap-3 rounded-lg bg-gray-50 p-3"><detail.icon className="h-4 w-4 shrink-0 text-gray-400" /><span className="w-28 shrink-0 text-xs text-gray-500">{detail.label}</span><span className="text-sm font-medium text-gray-800">{detail.value}</span></div>)}{formData.additionalNotes ? <div className="flex items-start gap-3 rounded-lg bg-gray-50 p-3"><FileText className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" /><span className="w-28 shrink-0 text-xs text-gray-500">Notes</span><span className="text-sm text-gray-600">{formData.additionalNotes}</span></div> : null}</div><div className="flex items-center justify-between border-t border-gray-100 pt-4"><Button variant="outline" onClick={() => setStep(2)} disabled={submitting} className="gap-2 border-gray-200"><ChevronLeft className="h-4 w-4" /> Edit</Button><Button onClick={submitBooking} disabled={submitting} className="min-w-[160px] gap-2 bg-[#1BAE9A] text-white hover:bg-[#168E7E]">{submitting ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> Booking...</> : <>Confirm Booking <Check className="h-4 w-4" /></>}</Button></div></motion.div> : null}
                    {step === 4 ? <motion.div key="step-4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="py-4 text-center"><motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 15 }} className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-green-100"><CheckCircle2 className="h-10 w-10 text-green-600" /></motion.div><h2 className="mb-2 text-2xl font-bold text-gray-900">Booking Confirmed!</h2><p className="mb-6 text-gray-500">Your booking has been confirmed successfully.</p><div className="mb-8 inline-block rounded-xl border border-[#1BAE9A]/10 bg-gradient-to-br from-[#1BAE9A]/5 to-white p-6"><p className="mb-1 text-xs text-gray-500">Booking ID</p><p className="font-mono text-2xl font-bold text-[#1BAE9A]">{bookingId}</p></div><div className="mb-8 space-y-2 text-sm text-gray-500"><p>Your selected services were added to a single booking.</p><p>Please keep this Booking ID for future reference.</p></div><div className="mb-8 rounded-xl border border-amber-200 bg-amber-50 p-4 text-left"><p className="mb-1 text-sm font-semibold text-amber-800">IMPORTANT</p><p className="text-sm leading-relaxed text-amber-700">Please keep your doctor's prescription ready during sample collection or diagnostic visit. This helps our team provide faster and more accurate service.</p></div><div className="flex flex-wrap justify-center gap-3"><a href="/track-order"><Button className="gap-2 bg-[#1BAE9A] text-white hover:bg-[#168E7E]">Track Order <ArrowRight className="h-4 w-4" /></Button></a><a href="/tests"><Button variant="outline" className="gap-2 border-gray-200">Book Another Test</Button></a><a href="/"><Button variant="ghost" className="gap-2"><Home className="h-4 w-4" /> Home</Button></a></div></motion.div> : null}
                  </AnimatePresence>
                </div>
                <div className="h-fit rounded-2xl border border-gray-100 bg-white p-6 shadow-lg"><h3 className="mb-4 text-lg font-bold text-gray-900">Booking Summary</h3>{selectionItems.length === 0 ? <p className="text-sm text-gray-500">Select tests or radiology services to build your booking.</p> : <div className="space-y-3">{selectionItems.map((item) => <div key={item.key} className="rounded-xl border border-gray-100 bg-gray-50 p-3"><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-semibold text-gray-900">{item.name}</p><p className="mt-1 text-xs text-gray-500">{item.type}</p></div><p className="text-sm font-bold text-[#1BAE9A]">{formatPrice(item.price)}</p></div></div>)}<div className="border-t border-gray-100 pt-3"><div className="flex items-center justify-between"><span className="text-sm font-semibold text-gray-900">Total Amount</span><span className="text-lg font-bold text-[#1BAE9A]">{formatPrice(totalAmount)}</span></div></div></div>}</div>
              </div>
            </div>
          </section>
        </PageTransition>
      </main>
      <Footer />
    </>
  )
}

function Field({ label, value, onValueChange, error, ...props }: { label: string; value: string; onValueChange: (value: string) => void; error?: string } & InputHTMLAttributes<HTMLInputElement>) {
  return <div><label className="mb-1.5 block text-sm font-medium text-gray-700">{label}</label><input {...props} value={value} onChange={(e) => onValueChange(e.target.value)} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none transition-all focus:border-[#1BAE9A] focus:bg-white focus:ring-4 focus:ring-[#1BAE9A]/10" />{error ? <p className="mt-1 text-xs text-red-500">{error}</p> : null}</div>
}

export default function BookingPage() {
  return <Suspense fallback={null}><BookingPageContent /></Suspense>
}
