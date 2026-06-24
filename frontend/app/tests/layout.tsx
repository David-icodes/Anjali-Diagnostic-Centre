import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Laboratory Tests',
  description: 'Browse our comprehensive range of laboratory tests including blood tests, pathology, biochemistry, and more at Anjali Diagnostic Centre in Kukatpally, Hyderabad.',
  alternates: { canonical: 'https://www.anjalidiagnostic.com/tests' },
  openGraph: {
    title: 'Laboratory Tests | Anjali Diagnostic Centre',
    description: 'Browse our comprehensive range of laboratory tests including blood tests, pathology, biochemistry, and more at Anjali Diagnostic Centre in Kukatpally, Hyderabad.',
    url: 'https://www.anjalidiagnostic.com/tests',
  },
  twitter: {
    title: 'Laboratory Tests | Anjali Diagnostic Centre',
    description: 'Browse our comprehensive range of laboratory tests including blood tests, pathology, biochemistry, and more at Anjali Diagnostic Centre in Kukatpally, Hyderabad.',
  },
}

export default function TestsLayout({ children }: { children: React.ReactNode }) {
  return children
}
