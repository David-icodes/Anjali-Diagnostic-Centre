'use client'

import dynamic from 'next/dynamic'
import PageTransition from '@/components/layout/PageTransition'
import HeroSection from '@/components/home/HeroSection'
import PopularTests from '@/components/home/PopularTests'
import BookTestSection from '@/components/home/BookTestSection'
import WhyChooseUs from '@/components/home/WhyChooseUs'
import ServicesSection from '@/components/home/ServicesSection'
import OffersSection from '@/components/home/OffersSection'

const Footer = dynamic(() => import('@/components/layout/Footer'), { ssr: false })

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <PageTransition>
        <HeroSection />
        <PopularTests />
        <OffersSection />
        <BookTestSection />
        <WhyChooseUs />
        <ServicesSection />
      </PageTransition>
      <Footer />
    </main>
  )
}
