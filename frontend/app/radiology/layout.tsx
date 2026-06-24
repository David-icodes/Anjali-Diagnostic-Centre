import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Radiology Services',
  description: 'Advanced radiology services including X-Ray, Ultrasound, CT Scan, and MRI at Anjali Diagnostic Centre in Kukatpally, Hyderabad.',
  alternates: { canonical: 'https://www.anjalidiagnostic.com/radiology' },
  openGraph: {
    title: 'Radiology Services | Anjali Diagnostic Centre',
    description: 'Advanced radiology services including X-Ray, Ultrasound, CT Scan, and MRI at Anjali Diagnostic Centre in Kukatpally, Hyderabad.',
    url: 'https://www.anjalidiagnostic.com/radiology',
  },
  twitter: {
    title: 'Radiology Services | Anjali Diagnostic Centre',
    description: 'Advanced radiology services including X-Ray, Ultrasound, CT Scan, and MRI at Anjali Diagnostic Centre in Kukatpally, Hyderabad.',
  },
}

export default function RadiologyLayout({ children }: { children: React.ReactNode }) {
  return children
}
