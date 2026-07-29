"use client"

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'

interface FAQ {
  question: string
  answer: string
  category: string
}

const faqs: FAQ[] = [
  {
    category: 'Booking',
    question: 'How can I book a diagnostic test?',
    answer:
      'You can book a test through our website by searching for the test, selecting a convenient time slot, and completing the booking. You can also call our helpline or visit our center directly.',
  },
  {
    category: 'Booking',
    question: 'Can I reschedule or cancel my booking?',
    answer:
      'Yes, you can reschedule or cancel your booking up to 2 hours before the scheduled time. Please contact our support team or use the manage booking option on our website.',
  },
  {
    category: 'Booking',
    question: 'Do I need a doctor\'s prescription for tests?',
    answer:
      'While most tests can be done without a prescription, some specialized tests may require one. We recommend consulting with your doctor for the most appropriate tests.',
  },
  {
    category: 'Tests',
    question: 'Is fasting required before sample collection?',
    answer:
      'Some tests like blood sugar fasting, lipid profile, and glucose tolerance test require fasting for 8-12 hours. Our team will inform you about specific requirements when you book.',
  },
  {
    category: 'Tests',
    question: 'What types of samples do you collect?',
    answer:
      'We collect blood, urine, stool, and other samples as required. Our trained phlebotomists use sterile equipment and follow strict safety protocols for all collections.',
  },
  {
    category: 'Tests',
    question: 'How long does each test take?',
    answer:
      'The sample collection itself takes just 5-10 minutes. The time for receiving reports varies from 6-48 hours depending on the type of test.',
  },
  {
    category: 'Reports',
    question: 'How will I receive my test reports?',
    answer:
      'Reports are delivered digitally via email and our patient portal. You can also access them through our mobile app. Physical copies are available on request.',
  },
  {
    category: 'Reports',
    question: 'Are the reports confidential?',
    answer:
      'Absolutely. We follow strict HIPAA-compliant data protection protocols. Your reports are accessible only to you and your authorized healthcare providers.',
  },
  {
    category: 'Reports',
    question: 'Can I get a second opinion on my reports?',
    answer:
      'Yes, our senior pathologists are available for consultation to help you understand your reports and answer any questions you may have.',
  },
  {
    category: 'Payments',
    question: 'What payment methods do you accept?',
    answer:
      'We accept cash, credit/debit cards, UPI (GPay, PhonePe, Paytm), net banking, and most digital wallets. We also offer EMI options for premium packages.',
  },
  {
    category: 'Payments',
    question: 'Do you accept health insurance?',
    answer:
      'Yes, we accept major health insurance plans. Please provide your insurance details at the time of booking and our team will assist you with the claim process.',
  },
  {
    category: 'Payments',
    question: 'Is there a cancellation fee?',
    answer:
      'Cancellations made more than 2 hours before the scheduled time are free. Late cancellations may incur a nominal fee of 10% of the test cost.',
  },
]

const categories = ['Booking', 'Tests', 'Reports', 'Payments']

export default function FAQSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' })

  return (
    <section className="py-24 px-4" id="faq">
      <div ref={sectionRef} className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 rounded-full bg-brand-100 text-brand-700 text-sm font-medium mb-4">
            FAQ
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Frequently Asked{' '}
            <span className="text-gradient">Questions</span>
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-8"
        >
          {categories.map((category, catIndex) => {
            const categoryFaqs = faqs.filter((f) => f.category === category)
            return (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: catIndex * 0.1 + 0.3 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <Badge
                    variant={
                      catIndex === 0
                        ? 'default'
                        : catIndex === 1
                          ? 'info'
                          : catIndex === 2
                            ? 'success'
                            : 'warning'
                    }
                    className="text-sm px-4 py-1"
                  >
                    {category}
                  </Badge>
                </div>
                <Accordion type="single" collapsible className="w-full">
                  {categoryFaqs.map((faq, idx) => (
                    <AccordionItem
                      key={idx}
                      value={`${category}-${idx}`}
                      className="border border-border/50 rounded-xl mb-2 px-2 data-[state=open]:shadow-sm data-[state=open]:border-brand-200 transition-all"
                    >
                      <AccordionTrigger className="text-base font-medium hover:no-underline hover:text-brand-600 transition-colors px-2">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground leading-relaxed px-2 pb-4">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
