'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Award, CheckCircle2, ChevronLeft, ChevronRight, Clock3, HeartPulse, Microscope, ShieldCheck, Users } from 'lucide-react'
import Footer from '@/components/layout/Footer'
import PageTransition from '@/components/layout/PageTransition'
import { BRAND, CENTRE_IMAGES } from '@/lib/site'

const ABOUT_SLIDES = [
  {
    image: CENTRE_IMAGES.slideshowLab,
    alt: 'Anjali Diagnostics laboratory equipment',
  },
  {
    image: CENTRE_IMAGES.slideshowClia,
    alt: 'CLIA 9000i advanced immunoassay system',
  },
  {
    image: CENTRE_IMAGES.heroCentre,
    alt: 'Anjali Diagnostics front desk',
  },
  {
    image: CENTRE_IMAGES.reception,
    alt: 'Anjali Diagnostics reception and collection area',
  },
  {
    image: CENTRE_IMAGES.waiting,
    alt: 'Anjali Diagnostics patient access space',
  },
] as const

const principles = [
  {
    title: 'Our Mission',
    description: 'To provide timely diagnostic support in a professional, accessible, and healthcare-focused environment.',
  },
  {
    title: 'Our Vision',
    description: 'To be a trusted local diagnostic centre known for dependable service, accuracy, and patient care.',
  },
  {
    title: 'Our Commitment',
    description: 'We focus on careful processes, respectful support, and reliable reporting for every patient visit.',
  },
]

const highlights = [
  { icon: ShieldCheck, title: 'Reliable Reporting', text: 'Processes designed to support consistent and dependable results.' },
  { icon: HeartPulse, title: 'Patient-Focused Care', text: 'A calm, service-oriented environment for every visitor.' },
  { icon: Clock3, title: 'Timely Service', text: 'Streamlined workflows that help reduce waiting and reporting delays.' },
  { icon: Award, title: 'Professional Standards', text: 'Clean presentation, organized spaces, and careful handling throughout.' },
]

const stats = [
  { icon: Users, value: '50,000+', label: 'Patients Served' },
  { icon: Award, value: '100+', label: 'Tests Offered' },
  { icon: ShieldCheck, value: '99%', label: 'Focused Accuracy' },
  { icon: Clock3, value: '10+', label: 'Years of Service' },
]

export default function AboutPage() {
  useEffect(() => {
    document.title = `About Us | ${BRAND.fullName}`
  }, [])

  return (
    <>
      <main className="min-h-screen">
        <PageTransition>
          <SlideshowSection />
          <StorySection />
          <PrinciplesSection />
          <HighlightsSection />
          <StatsSection />
        </PageTransition>
      </main>
      <Footer />
    </>
  )
}

function StorySection() {
  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-14 items-center">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-brand-100 text-brand-700 text-sm font-medium mb-4">
            Our Story
          </span>
          <h2 className="mb-5 text-3xl font-bold text-gray-900 sm:text-4xl">
            Delivering Excellence in Diagnostics Since 2014
          </h2>
          <div className="space-y-4 text-base leading-relaxed text-gray-600">
            <p>
              Anjali Diagnostic Centre was founded with a vision to provide accurate,
              affordable, and accessible diagnostic services to every individual. Over the
              years, we have grown from a small lab into a state-of-the-art diagnostic centre
              trusted by thousands of patients and healthcare providers.
            </p>
            <p>
              Our commitment to quality, precision, and patient-centric care has made us a
              preferred choice for diagnostic services. We continually invest in the latest
              technology and training to ensure the highest standards of accuracy and reliability.
            </p>
            <p>
              At Anjali Diagnostic Centre, we believe that timely and accurate diagnosis is the
              cornerstone of effective healthcare. Every test we perform is a step towards
              better health outcomes for our patients.
            </p>
          </div>
          <div className="flex flex-wrap gap-4 mt-8">
            {['NABL Accredited', 'ISO Certified', '100+ Tests', 'Expert Team'].map((item) => (
              <div key={item} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-50 text-green-700 text-sm font-medium">
                <CheckCircle2 className="w-4 h-4" />
                {item}
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          <div className="relative rounded-2xl overflow-hidden shadow-xl">
            <div className="aspect-[4/3] bg-gradient-to-br from-brand-100 to-brand-50 flex items-center justify-center">
              <Microscope className="w-32 h-32 text-brand-300" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-brand-950/30 to-transparent" />
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl border border-gray-100 p-5"
          >
            <p className="text-3xl font-bold text-brand-600">10+</p>
            <p className="text-sm text-gray-500">Years of Excellence</p>
          </motion.div>
        </motion.div>
        </div>
      </div>
    </section>
  )
}

function SlideshowSection() {
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    ABOUT_SLIDES.forEach((slide) => {
      const preloadedImage = new window.Image()
      preloadedImage.src = slide.image
    })

    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % ABOUT_SLIDES.length)
    }, 4500)

    return () => window.clearInterval(interval)
  }, [])

  const goToPrev = () => setActiveIndex((current) => (current - 1 + ABOUT_SLIDES.length) % ABOUT_SLIDES.length)
  const goToNext = () => setActiveIndex((current) => (current + 1) % ABOUT_SLIDES.length)

  return (
    <section className="bg-[linear-gradient(180deg,#EDF8FF_0%,#F8FBFC_100%)] py-8 sm:py-10 lg:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="overflow-hidden rounded-[2rem] border border-white/80 bg-white/70 p-3 shadow-[0_30px_80px_rgba(15,118,110,0.12)] backdrop-blur-sm"
        >
          <div className="relative h-[320px] overflow-hidden rounded-[1.6rem] bg-white sm:h-[400px] lg:h-[560px]">
            {ABOUT_SLIDES.map((slide, index) => (
              <div
                key={slide.image}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                  index === activeIndex ? 'opacity-100' : 'opacity-0'
                }`}
                aria-hidden={index !== activeIndex}
              >
                <Image
                  src={slide.image}
                  alt={slide.alt}
                  fill
                  className="object-cover"
                  priority={index < 2}
                  sizes="100vw"
                />
              </div>
            ))}

            <button
              type="button"
              onClick={goToPrev}
              className="absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/80 bg-white/88 text-[#0F766E] shadow-lg shadow-black/10 backdrop-blur-md transition-all hover:scale-105 hover:bg-white sm:left-5 sm:h-12 sm:w-12"
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <button
              type="button"
              onClick={goToNext}
              className="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/80 bg-white/88 text-[#0F766E] shadow-lg shadow-black/10 backdrop-blur-md transition-all hover:scale-105 hover:bg-white sm:right-5 sm:h-12 sm:w-12"
              aria-label="Next slide"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 flex-wrap items-center gap-3">
              {ABOUT_SLIDES.map((slide, index) => (
                <button
                  key={slide.image}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={`h-2.5 rounded-full transition-all ${
                    index === activeIndex ? 'w-8 bg-white shadow-[0_0_0_4px_rgba(255,255,255,0.28)]' : 'w-2.5 bg-white/75 hover:bg-white'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function PrinciplesSection() {
  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">Vision, mission, and patient commitment</h2>
          <p className="mx-auto max-w-2xl text-base leading-relaxed text-gray-600">
            The centre is guided by clear service principles that support professionalism, clarity, and patient trust.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {principles.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className="rounded-[1.75rem] border border-gray-100 bg-[#F8FBFC] p-7 shadow-sm"
            >
              <h3 className="mb-3 text-xl font-semibold text-gray-900">{item.title}</h3>
              <p className="text-sm leading-relaxed text-gray-600">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function HighlightsSection() {
  return (
    <section className="bg-[#F8FBFC] py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">Why patients choose Anjali Diagnostics</h2>
          <p className="mx-auto max-w-2xl text-base leading-relaxed text-gray-600">
            A modern, less cluttered presentation built around trust, professionalism, and straightforward healthcare service.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {highlights.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className="rounded-[1.75rem] border border-white bg-white p-6 shadow-sm"
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                <item.icon className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">{item.title}</h3>
              <p className="text-sm leading-relaxed text-gray-600">{item.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function StatsSection() {
  return (
    <section className="bg-gradient-to-r from-brand-600 via-brand-500 to-brand-400 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className="rounded-[1.5rem] border border-white/15 bg-white/10 p-6 text-center backdrop-blur-sm"
            >
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
                <stat.icon className="h-7 w-7 text-white" />
              </div>
              <p className="text-3xl font-bold text-white">{stat.value}</p>
              <p className="mt-1 text-sm font-medium text-brand-100">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
