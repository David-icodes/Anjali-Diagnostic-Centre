import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn about Anjali Diagnostic Centre in Kukatpally, Hyderabad — our team, infrastructure, certifications, and commitment to accurate diagnostics and patient care.',
  alternates: { canonical: 'https://www.anjalidiagnostic.com/about' },
  openGraph: {
    title: 'About Us | Anjali Diagnostic Centre',
    description: 'Learn about Anjali Diagnostic Centre in Kukatpally, Hyderabad — our team, infrastructure, certifications, and commitment to accurate diagnostics and patient care.',
    url: 'https://www.anjalidiagnostic.com/about',
  },
  twitter: {
    title: 'About Us | Anjali Diagnostic Centre',
    description: 'Learn about Anjali Diagnostic Centre in Kukatpally, Hyderabad — our team, infrastructure, certifications, and commitment to accurate diagnostics and patient care.',
  },
}

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children
}
