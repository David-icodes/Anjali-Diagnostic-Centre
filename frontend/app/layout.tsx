import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import PublicLayout from '@/components/layout/PublicLayout'
import { BRAND } from '@/lib/site'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Anjali Diagnostic Centre | Advanced Diagnostic Care You Can Trust',
  description: 'State-of-the-art diagnostic centre in Hyderabad offering 100+ lab tests, radiology services, health checkup packages with 99% accuracy and free home sample collection.',
  keywords: 'diagnostic centre, medical tests, health checkup, pathology lab, blood test, full body checkup, radiology, MRI, CT scan, Hyderabad',
  icons: {
    icon: BRAND.favicon,
    shortcut: BRAND.favicon,
    apple: BRAND.logo,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={inter.className}>
        <PublicLayout>
          {children}
        </PublicLayout>
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
