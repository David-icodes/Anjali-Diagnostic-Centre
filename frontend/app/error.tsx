'use client'

import { useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-gradient-to-b from-white to-[#F8FBFC] px-4">
      <div className="max-w-xl text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-red-50 text-red-600">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <h1 className="mb-3 text-3xl font-bold text-gray-900">Something went wrong</h1>
        <p className="mb-8 text-gray-600">
          The page hit an unexpected error. Please try loading it again.
        </p>
        <Button onClick={reset} className="bg-[#1BAE9A] text-white hover:bg-[#168E7E]">
          Try Again
        </Button>
      </div>
    </div>
  )
}
