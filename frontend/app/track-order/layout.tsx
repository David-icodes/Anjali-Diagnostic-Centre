import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Track Report',
  description: 'Track your diagnostic report online. Enter your patient name and mobile number to check the status of your lab test or radiology report at Anjali Diagnostic Centre.',
  alternates: { canonical: 'https://www.anjalidiagnostic.com/track-order' },
  openGraph: {
    title: 'Track Report | Anjali Diagnostic Centre',
    description: 'Track your diagnostic report online. Enter your patient name and mobile number to check the status of your lab test or radiology report at Anjali Diagnostic Centre.',
    url: 'https://www.anjalidiagnostic.com/track-order',
  },
  twitter: {
    title: 'Track Report | Anjali Diagnostic Centre',
    description: 'Track your diagnostic report online. Enter your patient name and mobile number to check the status of your lab test or radiology report at Anjali Diagnostic Centre.',
  },
}

export default function TrackOrderLayout({ children }: { children: React.ReactNode }) {
  return children
}
