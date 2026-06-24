import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Find a Centre',
  description: 'Visit Anjali Diagnostic Centre at Plot No. 347, HMT Hills, Kukatpally, Hyderabad. Get directions and find our diagnostic centre easily.',
  alternates: { canonical: 'https://www.anjalidiagnostic.com/find-a-centre' },
  openGraph: {
    title: 'Find a Centre | Anjali Diagnostic Centre',
    description: 'Visit Anjali Diagnostic Centre at Plot No. 347, HMT Hills, Kukatpally, Hyderabad. Get directions and find our diagnostic centre easily.',
    url: 'https://www.anjalidiagnostic.com/find-a-centre',
  },
  twitter: {
    title: 'Find a Centre | Anjali Diagnostic Centre',
    description: 'Visit Anjali Diagnostic Centre at Plot No. 347, HMT Hills, Kukatpally, Hyderabad. Get directions and find our diagnostic centre easily.',
  },
}

export default function FindCentreLayout({ children }: { children: React.ReactNode }) {
  return children
}
