import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import PublicLayout from '@/components/layout/PublicLayout'
import { BRAND } from '@/lib/site'

const inter = Inter({ subsets: ['latin'] })

const baseUrl = 'https://www.anjalidiagnostic.com'

export const metadata: Metadata = {
  title: {
    default: 'Anjali Diagnostic Centre | Diagnostic Lab & Health Checkups in Kukatpally, Hyderabad',
    template: '%s | Anjali Diagnostic Centre',
  },
  description: 'Anjali Diagnostic Centre provides reliable diagnostic testing, laboratory services, health checkups, blood tests, radiology services, and accurate medical reports in Kukatpally, Hyderabad. Trusted diagnostics for better health.',
  keywords: [
    'Anjali Diagnostic Centre',
    'Diagnostic Centre Hyderabad',
    'Diagnostic Centre Kukatpally',
    'Blood Tests Hyderabad',
    'Medical Laboratory Hyderabad',
    'Health Checkup Centre',
    'Radiology Services Hyderabad',
    'Diagnostic Lab Telangana',
    'Health Packages Hyderabad',
    'Diagnostic Services Hyderabad',
    'Laboratory Services Hyderabad',
  ],
  authors: [{ name: 'Anjali Diagnostic Centre' }],
  creator: 'Anjali Diagnostic Centre',
  publisher: 'Anjali Diagnostic Centre',
  formatDetection: {
    telephone: true,
    email: false,
    address: true,
  },
  metadataBase: new URL(baseUrl),
  alternates: {
    canonical: baseUrl,
  },
  openGraph: {
    title: 'Anjali Diagnostic Centre | Diagnostic Lab & Health Checkups in Kukatpally, Hyderabad',
    description: 'Anjali Diagnostic Centre provides reliable diagnostic testing, laboratory services, health checkups, blood tests, radiology services, and accurate medical reports in Kukatpally, Hyderabad.',
    url: baseUrl,
    siteName: 'Anjali Diagnostic Centre',
    locale: 'en_IN',
    type: 'website',
    images: [
      {
        url: '/branding/logo.png',
        width: 512,
        height: 512,
        alt: 'Anjali Diagnostic Centre',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Anjali Diagnostic Centre | Diagnostic Lab & Health Checkups in Kukatpally, Hyderabad',
    description: 'Anjali Diagnostic Centre provides reliable diagnostic testing, laboratory services, health checkups, blood tests, radiology services, and accurate medical reports in Kukatpally, Hyderabad.',
    images: ['/branding/logo.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
    },
  },
  icons: {
    icon: [
      { url: '/branding/logo.png', type: 'image/png', sizes: '512x512' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    shortcut: { url: '/branding/logo.png', type: 'image/png' },
    apple: [
      { url: '/branding/logo.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { rel: 'apple-touch-icon-precomposed', url: '/branding/logo.png' },
    ],
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': ['DiagnosticCenter', 'MedicalBusiness', 'MedicalOrganization', 'LocalBusiness'],
  '@id': `${baseUrl}/#business`,
  name: 'Anjali Diagnostic Centre',
  url: baseUrl,
  legalName: 'Anjali Diagnostics Centre',
  logo: `${baseUrl}/branding/logo.png`,
  image: `${baseUrl}/branding/logo.png`,
  telephone: ['+919989220938', '+919440626892', '+9140147350'],
  email: 'anjalidiagnostics1602@gmail.com',
  description: 'Anjali Diagnostic Centre provides reliable diagnostic testing, laboratory services, health checkups, blood tests, radiology services, and accurate medical reports in Kukatpally, Hyderabad.',
  medicalSpecialty: 'Diagnostic',
  areaServed: { '@type': 'City', name: 'Hyderabad' },
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Plot No. 347, HMT Hills, Opp. Community Hall, Beside Park, Opp. JNTU, Kukatpally',
    addressLocality: 'Hyderabad',
    addressRegion: 'Telangana',
    postalCode: '500085',
    addressCountry: 'IN',
  },
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      opens: '06:00',
      closes: '22:00',
    },
  ],
  sameAs: [
    baseUrl,
  ],
  founder: { '@type': 'Organization', name: 'Anjali Diagnostic Centre' },
  foundingDate: '2008',
  duns: '414/DM & HO/RR/2008',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={inter.className}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
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
