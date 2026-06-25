import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import PublicLayout from '@/components/layout/PublicLayout'

const inter = Inter({ subsets: ['latin'] })

const baseUrl = 'https://www.anjalidiagnostic.com'

export const metadata: Metadata = {
  title: {
    default: 'Anjali Diagnostic Centre | Diagnostic Lab in Kukatpally, Hyderabad',
    template: '%s | Anjali Diagnostic Centre',
  },
  description:
    'Anjali Diagnostic Centre, Kukatpally, Hyderabad provides reliable diagnostic testing, laboratory services, health checkups, blood tests, radiology services, home sample collection, preventive health packages, and accurate reports with quality healthcare services.',
  keywords: [
    'Anjali Diagnostic Centre',
    'Diagnostic Centre Hyderabad',
    'Diagnostic Centre Kukatpally',
    'Blood Tests',
    'Health Checkups',
    'Radiology',
    'Laboratory Services',
    'Pathology Lab',
    'Medical Laboratory',
    'Diagnostic Lab Hyderabad',
    'Home Sample Collection',
    'Health Packages',
  ],
  authors: [{ name: 'Anjali Diagnostic Centre' }],
  creator: 'Anjali Diagnostic Centre',
  publisher: 'Anjali Diagnostic Centre',
  applicationName: 'Anjali Diagnostics Centre',
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
    title: 'Anjali Diagnostic Centre | Diagnostic Lab & Health Checkups',
    description:
      'Reliable diagnostic testing, laboratory services, blood tests, radiology, health packages and home sample collection in Kukatpally, Hyderabad.',
    url: baseUrl,
    siteName: 'Anjali Diagnostic Centre',
    locale: 'en_IN',
    type: 'website',
    images: [
      {
        url: `${baseUrl}/branding/logo.png`,
        width: 256,
        height: 256,
        alt: 'Anjali Diagnostics Centre official logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Anjali Diagnostic Centre | Diagnostic Lab & Health Checkups',
    description:
      'Reliable diagnostic testing, laboratory services, blood tests, radiology, health packages and home sample collection in Kukatpally, Hyderabad.',
    images: [`${baseUrl}/branding/logo.png`],
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
  manifest: '/site.webmanifest',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-32x32.png', type: 'image/png', sizes: '32x32' },
      { url: '/favicon-16x16.png', type: 'image/png', sizes: '16x16' },
    ],
    shortcut: ['/favicon.ico'],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${baseUrl}/#organization`,
      name: 'ANJALI DIAGNOSTICS CENTRE',
      url: baseUrl,
      logo: `${baseUrl}/branding/logo.png`,
      image: `${baseUrl}/branding/logo.png`,
      telephone: '+91 9440626892',
    },
    {
      '@type': ['DiagnosticCenter', 'MedicalOrganization', 'LocalBusiness'],
      '@id': `${baseUrl}/#diagnostic-centre`,
      name: 'ANJALI DIAGNOSTICS CENTRE',
      url: baseUrl,
      image: `${baseUrl}/branding/logo.png`,
      logo: `${baseUrl}/branding/logo.png`,
      telephone: '+91 9440626892',
      description:
        'Anjali Diagnostic Centre, Kukatpally, Hyderabad provides reliable diagnostic testing, laboratory services, health checkups, blood tests, radiology services, home sample collection, preventive health packages, and accurate reports with quality healthcare services.',
      medicalSpecialty: 'Diagnostic',
      address: {
        '@type': 'PostalAddress',
        streetAddress:
          'Plot No. 347, HMT Hills, Opp. Community Hall, Beside Park, Opp. JNTU, Kukatpally',
        addressLocality: 'Hyderabad',
        addressRegion: 'Telangana',
        postalCode: '500085',
        addressCountry: 'IN',
      },
      openingHoursSpecification: [
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
          opens: '07:00',
          closes: '21:00',
        },
      ],
      areaServed: {
        '@type': 'City',
        name: 'Hyderabad',
      },
      sameAs: [baseUrl],
    },
  ],
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
