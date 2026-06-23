'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Check, ChevronRight, ChevronLeft,
  Calendar, Clock, User, Phone, Mail, MapPin,
  FileText, Sparkles, Activity, Heart, Brain,
  Droplets, Stethoscope, Syringe, ArrowRight,
  CheckCircle2, Copy, Home,
} from 'lucide-react'
import { cn, formatPrice } from '@/lib/utils'
import api from '@/lib/api'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import PageTransition from '@/components/layout/PageTransition'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { bookingSchema } from '@/lib/validations'
import toast from 'react-hot-toast'
import { z } from 'zod'

type BookingStep = 1 | 2 | 3 | 4

const formSchema = bookingSchema
type FormData = z.infer<typeof formSchema>

const fadeIn = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: 'easeOut' } },
  exit: { opacity: 0, x: -20, transition: { duration: 0.3 } },
}

const testIcons = [Activity, Heart, Brain, Droplets, Stethoscope, Syringe]

interface TestOption {
  _id: string
  name: string
  category: string
  originalPrice: number
  offerPrice?: number
}

const defaultTimeSlots = [
  '7:00 AM - 8:00 AM', '8:00 AM - 9:00 AM', '9:00 AM - 10:00 AM',
  '10:00 AM - 11:00 AM', '11:00 AM - 12:00 PM', '12:00 PM - 1:00 PM',
  '1:00 PM - 2:00 PM', '2:00 PM - 3:00 PM', '3:00 PM - 4:00 PM',
  '4:00 PM - 5:00 PM', '5:00 PM - 6:00 PM', '6:00 PM - 7:00 PM',
]

export default function BookingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectedTestId = searchParams.get('testId')

  const [step, setStep] = useState<BookingStep>(1)
  const [tests, setTests] = useState<TestOption[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTest, setSelectedTest] = useState<TestOption | null>(null)
  const [bookingId, setBookingId] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      testId: preselectedTestId || '',
      preferredDate: '',
      preferredTime: '',
      gender: undefined,
    },
  })

  const watchedValues = watch()

  useEffect(() => {
    if (preselectedTestId) {
      api.get(`/tests/${preselectedTestId}`).then((res) => {
        const test = res.data?.test || res.data
        if (test) {
          setSelectedTest(test)
          setValue('testId', test._id)
          setStep(2)
        }
      }).catch(() => {})
    }
  }, [preselectedTestId, setValue])

  const searchTests = useCallback(async () => {
    if (!searchQuery.trim()) return
    try {
      const res = await api.get('/tests', { params: { search: searchQuery, limit: 10 } })
      setTests(res.data?.tests || res.data?.data || [])
    } catch {
      setTests([])
    }
  }, [searchQuery])

  useEffect(() => {
    if (searchQuery) {
      const timer = setTimeout(searchTests, 400)
      return () => clearTimeout(timer)
    }
    setTests([])
  }, [searchQuery, searchTests])

  const selectTest = (test: TestOption) => {
    setSelectedTest(test)
    setValue('testId', test._id)
  }

  const goToStep2 = async () => {
    if (!selectedTest) {
      toast.error('Please select a test to proceed')
      return
    }
    setStep(2)
  }

  const goToStep3 = async () => {
    const valid = await trigger(['patientName', 'age', 'gender', 'mobileNumber', 'email', 'address', 'preferredDate', 'preferredTime'])
    if (valid) setStep(3)
  }

  const onSubmit = async () => {
    setSubmitting(true)
    try {
      const data = {
        testId: selectedTest!._id,
        testName: selectedTest!.name,
        patientName: watchedValues.patientName,
        age: watchedValues.age,
        gender: watchedValues.gender,
        mobileNumber: watchedValues.mobileNumber,
        email: watchedValues.email,
        address: watchedValues.address,
        preferredDate: watchedValues.preferredDate,
        preferredTime: watchedValues.preferredTime,
        additionalNotes: watchedValues.additionalNotes || '',
      }
      const res = await api.post('/bookings', data)
      setBookingId(res.data?.booking?._id || res.data?._id || res.data?.bookingId || 'BK-' + Date.now())
      setStep(4)
      toast.success('Booking confirmed successfully!')
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to create booking. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const copyBookingId = () => {
    navigator.clipboard.writeText(bookingId).then(() => {
      toast.success('Booking ID copied!')
    })
  }

  const steps = [
    { num: 1, label: 'Select Test' },
    { num: 2, label: 'Fill Details' },
    { num: 3, label: 'Confirm' },
    { num: 4, label: 'Success' },
  ]

  return (
    <>
      <Header />
      <main className="min-h-screen pt-20 bg-gradient-to-b from-brand-50/30 to-white">
        <PageTransition>
          <section className="py-10">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-10"
              >
                <span className="inline-block px-4 py-1.5 rounded-full bg-brand-100 text-brand-700 text-sm font-medium mb-4">
                  Book a Test
                </span>
                <h1 className="text-3xl sm:text-4xl font-bold text-brand-950">Schedule Your Test</h1>
                <p className="text-gray-500 mt-2">Complete the steps below to book your diagnostic test</p>
              </motion.div>

              <div className="mb-10">
                <div className="flex items-center justify-between">
                  {steps.map((s, i) => (
                    <div key={s.num} className="flex items-center flex-1">
                      <div className="flex flex-col items-center">
                        <div className={cn(
                          'w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 border-2',
                          step > s.num
                            ? 'bg-green-500 border-green-500 text-white'
                            : step === s.num
                              ? 'bg-brand-600 border-brand-600 text-white shadow-lg shadow-brand-500/30'
                              : 'bg-white border-gray-200 text-gray-400'
                        )}>
                          {step > s.num ? <Check className="w-5 h-5" /> : s.num}
                        </div>
                        <span className={cn(
                          'text-xs mt-1.5 font-medium transition-colors hidden sm:block',
                          step >= s.num ? 'text-brand-700' : 'text-gray-400'
                        )}>
                          {s.label}
                        </span>
                      </div>
                      {i < steps.length - 1 && (
                        <div className={cn(
                          'flex-1 h-0.5 mx-2 mt-[-1.5rem] transition-colors',
                          step > s.num ? 'bg-green-500' : 'bg-gray-200'
                        )} />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-6 sm:p-8">
                <AnimatePresence mode="wait">
                  {step === 1 && (
                    <Step1SelectTest
                      key="step1"
                      searchQuery={searchQuery}
                      setSearchQuery={setSearchQuery}
                      tests={tests}
                      selectedTest={selectedTest}
                      selectTest={selectTest}
                      goToStep2={goToStep2}
                    />
                  )}

                  {step === 2 && (
                    <Step2FillDetails
                      key="step2"
                      selectedTest={selectedTest}
                      register={register}
                      errors={errors}
                      goToStep3={goToStep3}
                      goBack={() => setStep(1)}
                    />
                  )}

                  {step === 3 && (
                    <Step3Confirm
                      key="step3"
                      selectedTest={selectedTest}
                      values={watchedValues}
                      submitting={submitting}
                      onSubmit={handleSubmit(onSubmit)}
                      goBack={() => setStep(2)}
                    />
                  )}

                  {step === 4 && (
                    <Step4Success
                      key="step4"
                      bookingId={bookingId}
                      copyBookingId={copyBookingId}
                    />
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

function Step1SelectTest({
  searchQuery, setSearchQuery, tests, selectedTest, selectTest, goToStep2,
}: {
  searchQuery: string
  setSearchQuery: (v: string) => void
  tests: TestOption[]
  selectedTest: TestOption | null
  selectTest: (t: TestOption) => void
  goToStep2: () => void
}) {
  const [popularTests, setPopularTests] = useState<TestOption[]>([])

  useEffect(() => {
    api.get('/tests', { params: { popular: true, limit: 6 } }).then((res) => {
      setPopularTests(res.data?.tests || res.data?.data || [])
    }).catch(() => {})
  }, [])

  const displayTests = searchQuery ? tests : popularTests

  return (
    <motion.div variants={fadeIn} initial="hidden" animate="visible" exit="exit">
      <h2 className="text-xl font-bold text-brand-950 mb-4">Select a Test</h2>

      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for tests..."
          className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-brand-400 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all text-sm"
          autoFocus
        />
      </div>

      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
        {displayTests.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <Search className="w-10 h-10 mx-auto mb-3 opacity-50" />
            <p className="text-sm">{searchQuery ? 'No tests found' : 'Loading tests...'}</p>
          </div>
        ) : (
          displayTests.map((test, i) => {
            const Icon = testIcons[i % testIcons.length]
            const isSelected = selectedTest?._id === test._id
            return (
              <motion.div
                key={test._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => selectTest(test)}
                className={cn(
                  'flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all',
                  isSelected
                    ? 'border-brand-500 bg-brand-50 shadow-md shadow-brand-500/10'
                    : 'border-gray-100 hover:border-brand-200 hover:bg-gray-50'
                )}
              >
                <div className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all',
                  isSelected ? 'bg-brand-500 text-white' : 'bg-brand-50 text-brand-600'
                )}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-brand-950 truncate">{test.name}</p>
                  <p className="text-xs text-gray-500">{test.category}</p>
                </div>
                <div className="text-right shrink-0">
                  {test.offerPrice ? (
                    <>
                      <p className="text-sm font-bold text-brand-600">{formatPrice(test.offerPrice)}</p>
                      <p className="text-xs text-gray-400 line-through">{formatPrice(test.originalPrice)}</p>
                    </>
                  ) : (
                    <p className="text-sm font-bold text-brand-600">{formatPrice(test.originalPrice)}</p>
                  )}
                </div>
                <div className={cn(
                  'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0',
                  isSelected ? 'border-brand-500 bg-brand-500' : 'border-gray-300'
                )}>
                  {isSelected && <Check className="w-3 h-3 text-white" />}
                </div>
              </motion.div>
            )
          })
        )}
      </div>

      <div className="flex justify-end mt-6 pt-4 border-t border-gray-100">
        <Button variant="gradient" onClick={goToStep2} disabled={!selectedTest} className="gap-2">
          Continue <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  )
}

function Step2FillDetails({
  selectedTest, register, errors, goToStep3, goBack,
}: {
  selectedTest: TestOption | null
  register: any
  errors: any
  goToStep3: () => void
  goBack: () => void
}) {
  const today = new Date().toISOString().split('T')[0]

  return (
    <motion.div variants={fadeIn} initial="hidden" animate="visible" exit="exit">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
        <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center">
          <Activity className="w-5 h-5 text-brand-600" />
        </div>
        <div>
          <p className="text-sm font-medium text-brand-950">{selectedTest?.name}</p>
          <p className="text-xs text-gray-500">{selectedTest?.category}</p>
        </div>
        <div className="ml-auto text-right">
          {selectedTest?.offerPrice ? (
            <>
              <p className="text-sm font-bold text-brand-600">{formatPrice(selectedTest.offerPrice)}</p>
              <p className="text-xs text-gray-400 line-through">{formatPrice(selectedTest.originalPrice)}</p>
            </>
          ) : (
            <p className="text-sm font-bold text-brand-600">{formatPrice(selectedTest?.originalPrice || 0)}</p>
          )}
        </div>
      </div>

      <h2 className="text-xl font-bold text-brand-950 mb-5">Patient Details</h2>

      <div className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <Input
            label="Patient Name"
            placeholder="Enter patient name"
            {...register('patientName')}
            error={errors.patientName?.message}
          />
          <Input
            label="Age"
            type="number"
            placeholder="Enter age"
            {...register('age', { valueAsNumber: true })}
            error={errors.age?.message}
          />
        </div>

        <div>
          <Label className="mb-2 block">Gender</Label>
          <div className="flex gap-3">
            {['Male', 'Female', 'Other'].map((g) => (
              <label key={g} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 cursor-pointer hover:border-brand-300 hover:bg-brand-50/50 transition-all has-[:checked]:border-brand-500 has-[:checked]:bg-brand-50 has-[:checked]:shadow-sm">
                <input
                  type="radio"
                  value={g}
                  {...register('gender')}
                  className="accent-brand-600"
                />
                <span className="text-sm font-medium text-gray-700">{g}</span>
              </label>
            ))}
          </div>
          {errors.gender?.message && (
            <p className="mt-1 text-xs text-destructive">{errors.gender.message}</p>
          )}
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <Input
            label="Mobile Number"
            placeholder="Enter mobile number"
            {...register('mobileNumber')}
            error={errors.mobileNumber?.message}
          />
          <Input
            label="Email Address"
            type="email"
            placeholder="Enter email address"
            {...register('email')}
            error={errors.email?.message}
          />
        </div>

        <Input
          label="Address"
          placeholder="Enter full address"
          {...register('address')}
          error={errors.address?.message}
        />

        <Separator />

        <h3 className="text-lg font-semibold text-brand-950">Preferred Schedule</h3>

        <div className="grid sm:grid-cols-2 gap-4">
          <Input
            label="Preferred Date"
            type="date"
            min={today}
            {...register('preferredDate')}
            error={errors.preferredDate?.message}
          />
          <div>
            <Label className="mb-2 block">Preferred Time</Label>
            <select
              {...register('preferredTime')}
              className={cn(
                'flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                errors.preferredTime && 'border-destructive'
              )}
            >
              <option value="">Select time slot</option>
              {defaultTimeSlots.map((slot) => (
                <option key={slot} value={slot}>{slot}</option>
              ))}
            </select>
            {errors.preferredTime?.message && (
              <p className="mt-1 text-xs text-destructive">{errors.preferredTime.message}</p>
            )}
          </div>
        </div>

        <Textarea
          label="Additional Notes (Optional)"
          placeholder="Any specific instructions or notes..."
          rows={3}
          {...register('additionalNotes')}
        />
      </div>

      <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
        <Button variant="outline" onClick={goBack} className="gap-2">
          <ChevronLeft className="w-4 h-4" /> Back
        </Button>
        <Button variant="gradient" onClick={goToStep3} className="gap-2">
          Continue <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  )
}

function Step3Confirm({
  selectedTest, values, submitting, onSubmit, goBack,
}: {
  selectedTest: TestOption | null
  values: FormData
  submitting: boolean
  onSubmit: () => void
  goBack: () => void
}) {
  const details = [
    { icon: User, label: 'Patient Name', value: values.patientName },
    { icon: User, label: 'Age / Gender', value: `${values.age} / ${values.gender}` },
    { icon: Phone, label: 'Mobile', value: values.mobileNumber },
    { icon: Mail, label: 'Email', value: values.email },
    { icon: MapPin, label: 'Address', value: values.address },
    { icon: Calendar, label: 'Preferred Date', value: values.preferredDate },
    { icon: Clock, label: 'Preferred Time', value: values.preferredTime },
  ]

  return (
    <motion.div variants={fadeIn} initial="hidden" animate="visible" exit="exit">
      <h2 className="text-xl font-bold text-brand-950 mb-6">Review & Confirm</h2>

      <div className="bg-gradient-to-br from-brand-50 to-white rounded-xl border border-brand-100 p-5 mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Activity className="w-5 h-5 text-brand-600" />
          <div>
            <p className="font-semibold text-brand-950">{selectedTest?.name}</p>
            <p className="text-xs text-gray-500">{selectedTest?.category}</p>
          </div>
          <div className="ml-auto">
            {selectedTest?.offerPrice ? (
              <>
                <p className="text-lg font-bold text-brand-600">{formatPrice(selectedTest.offerPrice)}</p>
                <p className="text-xs text-gray-400 line-through text-right">{formatPrice(selectedTest.originalPrice)}</p>
              </>
            ) : (
              <p className="text-lg font-bold text-brand-600">{formatPrice(selectedTest?.originalPrice || 0)}</p>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        {details.map((d) => (
          <div key={d.label} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
            <d.icon className="w-4 h-4 text-gray-400 shrink-0" />
            <span className="text-xs text-gray-500 w-28 shrink-0">{d.label}</span>
            <span className="text-sm font-medium text-brand-950">{d.value}</span>
          </div>
        ))}
        {values.additionalNotes && (
          <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
            <FileText className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
            <span className="text-xs text-gray-500 w-28 shrink-0">Notes</span>
            <span className="text-sm text-gray-700">{values.additionalNotes}</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <Button variant="outline" onClick={goBack} disabled={submitting} className="gap-2">
          <ChevronLeft className="w-4 h-4" /> Edit
        </Button>
        <Button variant="gradient" onClick={onSubmit} disabled={submitting} className="gap-2 min-w-[160px]">
          {submitting ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Booking...
            </>
          ) : (
            <>
              Confirm Booking <Check className="w-4 h-4" />
            </>
          )}
        </Button>
      </div>
    </motion.div>
  )
}

function Step4Success({
  bookingId, copyBookingId,
}: {
  bookingId: string
  copyBookingId: () => void
}) {
  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="text-center py-6"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="w-20 h-20 mx-auto rounded-2xl bg-green-100 flex items-center justify-center mb-6"
      >
        <CheckCircle2 className="w-10 h-10 text-green-600" />
      </motion.div>

      <h2 className="text-2xl font-bold text-brand-950 mb-2">Booking Confirmed!</h2>
      <p className="text-gray-500 mb-6">Your test has been booked successfully.</p>

      <div className="inline-block bg-gradient-to-br from-brand-50 to-white rounded-xl border border-brand-100 p-6 mb-8">
        <p className="text-xs text-gray-500 mb-1">Booking ID</p>
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold text-brand-700 font-mono">{bookingId}</span>
          <button
            onClick={copyBookingId}
            className="p-2 rounded-lg hover:bg-brand-100 transition-colors"
            title="Copy Booking ID"
          >
            <Copy className="w-4 h-4 text-brand-600" />
          </button>
        </div>
      </div>

      <div className="space-y-3 mb-8">
        <p className="text-sm text-gray-500">
          We have sent the booking details to your email and mobile number.
        </p>
        <p className="text-sm text-gray-500">
          Use the Booking ID to track your order status online.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        <Link href="/track-order">
          <Button variant="gradient" className="gap-2">
            Track Order <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
        <Link href="/tests">
          <Button variant="outline" className="gap-2">
            Book Another Test
          </Button>
        </Link>
        <Link href="/">
          <Button variant="ghost" className="gap-2">
            <Home className="w-4 h-4" /> Home
          </Button>
        </Link>
      </div>
    </motion.div>
  )
}
