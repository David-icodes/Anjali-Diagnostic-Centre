'use client'

import { useEffect } from 'react'
import Footer from '@/components/layout/Footer'
import PageTransition from '@/components/layout/PageTransition'
import FindCentre from '@/components/home/FindCentre'
import { BRAND } from '@/lib/site'

export default function FindACentrePage() {
  useEffect(() => {
    document.title = `Find a Centre | ${BRAND.fullName}`
  }, [])

  return (
    <>
      <main className="min-h-screen">
        <PageTransition>
          <FindCentre />
        </PageTransition>
      </main>
      <Footer />
    </>
  )
}
