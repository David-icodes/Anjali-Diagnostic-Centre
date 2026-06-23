'use client'

import { useEffect } from 'react'

export default function GlobalError({
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
    <html lang="en">
      <body className="bg-white">
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div style={{ maxWidth: '560px', textAlign: 'center' }}>
            <h1 style={{ marginBottom: '12px', fontSize: '32px', fontWeight: 700, color: '#111827' }}>
              Application error
            </h1>
            <p style={{ marginBottom: '24px', color: '#4B5563', lineHeight: 1.6 }}>
              An unexpected error occurred while loading the application.
            </p>
            <button
              onClick={reset}
              style={{
                border: 0,
                borderRadius: '12px',
                background: '#1BAE9A',
                color: '#FFFFFF',
                padding: '12px 20px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
