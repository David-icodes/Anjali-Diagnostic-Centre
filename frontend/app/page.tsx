'use client'

import dynamic from 'next/dynamic'
import PageTransition from '@/components/layout/PageTransition'
import HeroSection from '@/components/home/HeroSection'
import OffersSection from '@/components/home/OffersSection'
import PopularTests from '@/components/home/PopularTests'

const Footer = dynamic(() => import('@/components/layout/Footer'), { ssr: false })

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <PageTransition>
        <HeroSection />
        <OffersSection />
        <PopularTests />
      </PageTransition>
      <Footer />
    </main>
  )
}
