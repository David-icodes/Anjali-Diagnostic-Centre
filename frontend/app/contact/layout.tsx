import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with Anjali Diagnostic Centre. Call +91 9440626892 or visit us at Plot No. 347, HMT Hills, Kukatpally, Hyderabad.',
  alternates: { canonical: 'https://www.anjalidiagnostic.com/contact' },
  openGraph: {
    title: 'Contact Us | Anjali Diagnostic Centre',
    description: 'Get in touch with Anjali Diagnostic Centre. Call +91 9440626892 or visit us at Plot No. 347, HMT Hills, Kukatpally, Hyderabad.',
    url: 'https://www.anjalidiagnostic.com/contact',
  },
  twitter: {
    title: 'Contact Us | Anjali Diagnostic Centre',
    description: 'Get in touch with Anjali Diagnostic Centre. Call +91 9440626892 or visit us at Plot No. 347, HMT Hills, Kukatpally, Hyderabad.',
  },
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children
}
