import { z } from 'zod'

export const bookingSchema = z.object({
  patientName: z.string().min(2, 'Name must be at least 2 characters'),
  age: z.coerce.number().min(1, 'Age is required').max(150, 'Invalid age'),
  gender: z.enum(['Male', 'Female', 'Other'], { required_error: 'Please select gender' }),
  mobileNumber: z.string().regex(/^\d{10}$/, 'Mobile number must be exactly 10 digits'),
  email: z.string().trim().optional().refine((value) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value), 'Enter valid email address'),
  address: z.string().min(10, 'Enter complete address'),
  testId: z.string().optional(),
  preferredDate: z.string().min(1, 'Please select a date'),
  preferredTime: z.string().min(1, 'Please select a time'),
  additionalNotes: z.string().optional(),
  homeCollection: z.boolean().optional(),
  serviceType: z.string().optional(),
  radiologyId: z.string().optional(),
  packageId: z.string().optional(),
})

export const enquirySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  mobileNumber: z.string().min(10, 'Enter valid mobile number'),
  email: z.string().email('Enter valid email address'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
})

export const loginSchema = z.object({
  username: z.string().min(2, 'Enter your username or email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const testSchema = z.object({
  name: z.string().min(2, 'Test name is required'),
  originalPrice: z.coerce.number().min(1, 'Price is required'),
  category: z.string().min(1, 'Category is required'),
  hasOffer: z.boolean().optional(),
  isActive: z.boolean().optional(),
  isPopular: z.boolean().optional(),
})

export const offerSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  discountPercentage: z.coerce.number().min(1).max(100),
  couponCode: z.string().optional(),
  validFrom: z.string().min(1, 'Start date is required'),
  validUntil: z.string().min(1, 'End date is required'),
  isActive: z.boolean().optional(),
  showOnHomePage: z.boolean().optional(),
})

export const testimonialSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  role: z.string().optional(),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  rating: z.coerce.number().min(1).max(5),
  isActive: z.boolean().optional(),
})

export type BookingFormData = z.infer<typeof bookingSchema>
export type EnquiryFormData = z.infer<typeof enquirySchema>
export type LoginFormData = z.infer<typeof loginSchema>
export type TestFormData = z.infer<typeof testSchema>
export type OfferFormData = z.infer<typeof offerSchema>
export type TestimonialFormData = z.infer<typeof testimonialSchema>
