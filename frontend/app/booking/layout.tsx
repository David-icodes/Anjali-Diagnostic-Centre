import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Book a Test',
  description: 'Book laboratory tests, radiology services, or health checkup packages online at Anjali Diagnostic Centre in Kukatpally, Hyderabad.',
  alternates: { canonical: 'https://www.anjalidiagnostic.com/booking' },
  openGraph: {
    title: 'Book a Test | Anjali Diagnostic Centre',
    description: 'Book laboratory tests, radiology services, or health checkup packages online at Anjali Diagnostic Centre in Kukatpally, Hyderabad.',
    url: 'https://www.anjalidiagnostic.com/booking',
  },
  twitter: {
    title: 'Book a Test | Anjali Diagnostic Centre',
    description: 'Book laboratory tests, radiology services, or health checkup packages online at Anjali Diagnostic Centre in Kukatpally, Hyderabad.',
  },
}

export default function BookingLayout({ children }: { children: React.ReactNode }) {
  return children
}
