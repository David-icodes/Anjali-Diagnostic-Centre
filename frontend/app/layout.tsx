import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Anjali Diagnostic Centre | Advanced Diagnostic Care You Can Trust',
  description: 'State-of-the-art diagnostic centre offering accurate test results, health checkup packages, and home sample collection services.',
  keywords: 'diagnostic centre, medical tests, health checkup, pathology lab, blood test, full body checkup',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={inter.className}>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#fff',
              color: '#1e293b',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              borderRadius: '12px',
            },
          }}
        />
      </body>
    </html>
  )
}
