import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Health Checkup Packages',
  description: 'Explore our curated health checkup packages designed for all ages. Full body checkups, cardiac screening, diabetes profile and more at Anjali Diagnostic Centre in Kukatpally, Hyderabad.',
  alternates: { canonical: 'https://www.anjalidiagnostic.com/health-packages' },
  openGraph: {
    title: 'Health Checkup Packages | Anjali Diagnostic Centre',
    description: 'Explore our curated health checkup packages designed for all ages. Full body checkups, cardiac screening, diabetes profile and more at Anjali Diagnostic Centre in Kukatpally, Hyderabad.',
    url: 'https://www.anjalidiagnostic.com/health-packages',
  },
  twitter: {
    title: 'Health Checkup Packages | Anjali Diagnostic Centre',
    description: 'Explore our curated health checkup packages designed for all ages. Full body checkups, cardiac screening, diabetes profile and more at Anjali Diagnostic Centre in Kukatpally, Hyderabad.',
  },
}

export default function HealthPackagesLayout({ children }: { children: React.ReactNode }) {
  return children
}
