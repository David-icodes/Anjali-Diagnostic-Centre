'use client'

import Link from 'next/link'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BRAND } from '@/lib/site'

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-gradient-to-b from-white to-[#F8FBFC] px-4">
      <div className="max-w-xl text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-brand-50 text-brand-600">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h1 className="mb-3 text-3xl font-bold text-gray-900">Page not found</h1>
        <p className="mb-8 text-gray-600">
          The page you requested is not available right now. You can return to the {BRAND.name} home page.
        </p>
        <Link href="/">
          <Button className="bg-[#1BAE9A] text-white hover:bg-[#168E7E]">
            Go to Home
          </Button>
        </Link>
      </div>
    </div>
  )
}
