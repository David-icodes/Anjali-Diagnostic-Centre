'use client'

import { motion } from 'framer-motion'
import { Award, Shield, Truck, Clock, Heart, Headphones, Users, Star, TrendingUp, FlaskRoundIcon as Flask } from 'lucide-react'

const features = [
  {
    icon: Award,
    title: 'NABL Accredited',
    description: 'Accredited by National Accreditation Board for testing and calibration laboratories.',
    color: '#1BAE9A',
  },
  {
    icon: Shield,
    title: '99% Accuracy',
    description: 'State-of-the-art equipment and strict quality control ensure reliable results every time.',
    color: '#4CAF50',
  },
  {
    icon: Truck,
    title: 'Free Home Collection',
    description: 'Convenient sample collection from your doorstep at no extra cost.',
    color: '#1BAE9A',
  },
  {
    icon: Clock,
    title: 'Quick Reports',
    description: 'Most reports delivered within 24-48 hours with online access.',
    color: '#4CAF50',
  },
  {
    icon: Heart,
    title: 'Expert Team',
    description: 'Experienced doctors, technicians and support staff dedicated to your health.',
    color: '#1BAE9A',
  },
  {
    icon: Headphones,
    title: '24/7 Support',
    description: 'Round-the-clock customer support and emergency diagnostic services.',
    color: '#4CAF50',
  },
]

const stats = [
  { icon: Users, value: '50,000+', label: 'Happy Patients' },
  { icon: Flask, value: '100+', label: 'Test Menu' },
  { icon: Star, value: '4.9/5', label: 'Patient Rating' },
  { icon: TrendingUp, value: '15+', label: 'Years Experience' },
]

export default function WhyChooseUs() {
  return (
    <section className="relative py-20 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-14"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#4CAF50]/5 border border-[#4CAF50]/10 mb-4">
            <Heart className="w-4 h-4 text-[#4CAF50]" />
            <span className="text-sm font-medium text-[#4CAF50]">Why Choose Us</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Why Anjali Diagnostics?
          </h2>
          <p className="text-lg text-gray-500">
            We combine cutting-edge technology with compassionate care to deliver accurate diagnostic services.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group bg-white rounded-2xl border border-gray-100 p-6 card-hover"
            >
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300" style={{ backgroundColor: feature.color + '10' }}>
                <feature.icon className="w-7 h-7" style={{ color: feature.color }} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center p-6 rounded-2xl bg-[#F8FBFC] border border-gray-100"
            >
              <stat.icon className="w-8 h-8 text-[#1BAE9A] mx-auto mb-3" />
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
