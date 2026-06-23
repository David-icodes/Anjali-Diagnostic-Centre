'use client'

import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import PageTransition from '@/components/layout/PageTransition'
import HeroSection from '@/components/home/HeroSection'
import StatsSection from '@/components/home/StatsSection'
import WhyChooseUs from '@/components/home/WhyChooseUs'
import PopularTests from '@/components/home/PopularTests'
import TestPackages from '@/components/home/TestPackages'
import HowItWorks from '@/components/home/HowItWorks'
import OffersSection from '@/components/home/OffersSection'
import Testimonials from '@/components/home/Testimonials'
import FAQSection from '@/components/home/FAQSection'
import ContactSection from '@/components/home/ContactSection'

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="min-h-screen">
        <PageTransition>
          <HeroSection />
          <StatsSection />
          <WhyChooseUs />
          <PopularTests />
          <TestPackages />
          <HowItWorks />
          <OffersSection />
          <Testimonials />
          <FAQSection />
          <ContactSection />
        </PageTransition>
      </main>
      <Footer />
    </>
  )
}
