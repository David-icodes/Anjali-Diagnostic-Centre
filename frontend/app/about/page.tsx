'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Microscope, Target, Eye, Heart, Shield,
  Award, Users, Clock, CheckCircle2, Quote,
  ChevronRight, Star, Sparkles, ArrowRight,
} from 'lucide-react'
import { cn, getStatusColor } from '@/lib/utils'
import api from '@/lib/api'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import PageTransition from '@/components/layout/PageTransition'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: 'easeOut' },
  }),
}

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
}

export default function AboutPage() {
  const [settings, setSettings] = useState<Record<string, string>>({})

  useEffect(() => {
    api.get('/settings/public').then((res) => {
      if (res.data?.settings) setSettings(res.data.settings)
    }).catch(() => {})
    document.title = 'About Us | Anjali Diagnostic Centre'
  }, [])

  return (
    <>
      <Header />
      <main className="min-h-screen pt-20">
        <PageTransition>
          <HeroBanner settings={settings} />
          <OverviewSection />
          <VisionMissionSection />
          <WhyChooseUsSection />
          <TeamSection />
          <StatsCounterSection />
          <CTASection />
        </PageTransition>
      </main>
      <Footer />
    </>
  )
}

function HeroBanner({ settings }: { settings: Record<string, string> }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-brand-950 via-brand-900 to-brand-800 min-h-[50vh] flex items-center">
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-500/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-brand-400/10 rounded-full blur-[100px]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white/80 text-sm font-medium mb-6 border border-white/10"
          >
            <Sparkles className="w-4 h-4" />
            About Us
          </motion.div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
            Leading Diagnostic Care
          </h1>
          <p className="text-lg sm:text-xl text-brand-200/80 max-w-2xl mx-auto leading-relaxed">
            {settings.description || 'Providing accurate diagnostic services with cutting-edge technology and experienced professionals. Your health is our priority.'}
          </p>
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent" />
    </section>
  )
}

function OverviewSection() {
  return (
    <section className="py-20 bg-white">
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
            <h2 className="text-3xl sm:text-4xl font-bold text-brand-950 mb-6 leading-tight">
              Delivering Excellence in Diagnostics Since 2014
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
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

function VisionMissionSection() {
  const items = [
    {
      icon: Eye,
      title: 'Our Vision',
      description: 'To be the most trusted diagnostic centre, setting benchmarks in accuracy, innovation, and patient care.',
      gradient: 'from-blue-50 to-blue-100',
      iconBg: 'from-blue-500 to-blue-400',
      border: 'border-blue-200/50',
    },
    {
      icon: Target,
      title: 'Our Mission',
      description: 'To provide accurate, timely, and affordable diagnostic services with compassion and respect for every patient.',
      gradient: 'from-brand-50 to-brand-100',
      iconBg: 'from-brand-600 to-brand-400',
      border: 'border-brand-200/50',
    },
    {
      icon: Heart,
      title: 'Our Values',
      description: 'Integrity, accuracy, patient-centricity, innovation, and continuous improvement in everything we do.',
      gradient: 'from-green-50 to-green-100',
      iconBg: 'from-green-500 to-green-400',
      border: 'border-green-200/50',
    },
  ]

  return (
    <section className="py-20 bg-gradient-to-b from-brand-50/30 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-14"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-brand-100 text-brand-700 text-sm font-medium mb-4">
            Our Principles
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-brand-950 mb-4">
            Vision, Mission & Values
          </h2>
          <p className="text-gray-500">
            The core principles that drive everything we do
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {items.map((item, i) => (
            <motion.div
              key={item.title}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              whileHover={{ y: -6 }}
              className={cn(
                'rounded-2xl border p-8 bg-gradient-to-br transition-all duration-300 hover:shadow-xl',
                item.gradient, item.border
              )}
            >
              <div className={cn(
                'w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center mb-6 shadow-lg',
                item.iconBg
              )}>
                <item.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-brand-950 mb-3">{item.title}</h3>
              <p className="text-gray-600 leading-relaxed">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function WhyChooseUsSection() {
  const features = [
    { icon: Award, title: 'NABL Accredited Lab', description: 'Nationally accredited meeting rigorous quality standards.' },
    { icon: Microscope, title: 'Cutting-Edge Technology', description: 'Latest automated analyzers for precise results.' },
    { icon: Users, title: 'Expert Team', description: 'Highly qualified pathologists and trained technicians.' },
    { icon: Clock, title: 'Timely Reports', description: 'Most reports delivered within 24-48 hours.' },
    { icon: Shield, title: 'Quality Assured', description: 'Strict internal and external quality control programs.' },
    { icon: Heart, title: 'Patient First Approach', description: 'Comfortable, hygienic environment with personalized care.' },
    { icon: Truck, title: 'Free Home Collection', description: 'Convenient sample collection at your doorstep.' },
    { icon: Dollar, title: 'Affordable Pricing', description: 'Quality diagnostics at transparent, competitive prices.' },
  ]

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-14"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-brand-100 text-brand-700 text-sm font-medium mb-4">
            Why Choose Us
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-brand-950 mb-4">
            What Sets Us Apart
          </h2>
          <p className="text-gray-500">
            Our commitment to excellence makes us the preferred diagnostic partner
          </p>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              variants={fadeUp}
              custom={i}
              whileHover={{ y: -4, scale: 1.01 }}
              className="p-6 rounded-2xl border border-gray-100 bg-white hover:border-brand-200 hover:shadow-lg transition-all duration-300 group"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-50 to-brand-100 flex items-center justify-center mb-4 group-hover:from-brand-500 group-hover:to-brand-400 transition-all duration-300">
                <feature.icon className="w-6 h-6 text-brand-600 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-base font-semibold text-brand-950 mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

function TeamSection() {
  const team = [
    { name: 'Dr. Anjali Sharma', role: 'Chief Pathologist', qualification: 'MD Pathology, 15+ years' },
    { name: 'Dr. Rajesh Kumar', role: 'Senior Consultant', qualification: 'MD Internal Medicine, 20+ years' },
    { name: 'Dr. Priya Patel', role: 'Lab Director', qualification: 'PhD Biochemistry, 12+ years' },
    { name: 'Mr. Amit Verma', role: 'Chief Technologist', qualification: 'MLT, 18+ years' },
  ]

  return (
    <section className="py-20 bg-gradient-to-b from-brand-50/30 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-14"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-brand-100 text-brand-700 text-sm font-medium mb-4">
            Our Team
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-brand-950 mb-4">
            Meet Our Experts
          </h2>
          <p className="text-gray-500">
            Experienced professionals dedicated to your health
          </p>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {team.map((member, i) => (
            <motion.div
              key={member.name}
              variants={fadeUp}
              custom={i}
              whileHover={{ y: -6 }}
              className="text-center group"
            >
              <div className="relative w-32 h-32 mx-auto mb-5">
                <div className="w-full h-full rounded-2xl bg-gradient-to-br from-brand-100 to-brand-200 flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:shadow-brand-500/20 transition-all">
                  <Avatar className="w-28 h-28 rounded-2xl">
                    <AvatarFallback className="rounded-2xl bg-gradient-to-br from-brand-500 to-brand-400 text-white text-3xl font-bold">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-green-500 border-2 border-white flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-brand-950">{member.name}</h3>
              <p className="text-brand-600 text-sm font-medium">{member.role}</p>
              <p className="text-gray-400 text-xs mt-1">{member.qualification}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link href="/contact">
            <Button variant="outline" size="lg" className="gap-2">
              Meet the Full Team <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

function StatsCounterSection() {
  const stats = [
    { icon: Users, value: '50,000+', label: 'Patients Served' },
    { icon: Award, value: '100+', label: 'Tests Offered' },
    { icon: Shield, value: '99.9%', label: 'Accuracy Rate' },
    { icon: Clock, value: '10+', label: 'Years Experience' },
  ]

  return (
    <section className="relative overflow-hidden py-20 bg-gradient-to-r from-brand-600 via-brand-500 to-brand-400">
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/10 rounded-full blur-[100px]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
              className="text-center"
            >
              <div className="w-16 h-16 mx-auto rounded-2xl bg-white/10 flex items-center justify-center mb-4 backdrop-blur-sm border border-white/20">
                <stat.icon className="w-8 h-8 text-white" />
              </div>
              <p className="text-4xl lg:text-5xl font-bold text-white mb-1">{stat.value}</p>
              <p className="text-brand-100 text-sm font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function CTASection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-3xl bg-gradient-to-r from-brand-600 via-brand-500 to-brand-400 overflow-hidden px-8 py-14 text-center"
        >
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[80px]" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-[60px]" />

          <div className="relative">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to Book Your Test?
            </h2>
            <p className="text-brand-100 text-lg mb-8 max-w-xl mx-auto">
              Schedule your appointment today and experience the difference of accurate diagnostics.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/tests">
                <Button size="xl" className="bg-white text-brand-700 hover:bg-brand-50 shadow-xl">
                  Browse Tests
                </Button>
              </Link>
              <Link href="/booking">
                <Button size="xl" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                  Book Appointment
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
