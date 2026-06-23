import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

export const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price)
}

export const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    'Pending': 'bg-yellow-100 text-yellow-800',
    'Confirmed': 'bg-blue-100 text-blue-800',
    'Assigned': 'bg-sky-100 text-sky-800',
    'Sample Collection Scheduled': 'bg-purple-100 text-purple-800',
    'Sample Collected': 'bg-indigo-100 text-indigo-800',
    'Processing': 'bg-orange-100 text-orange-800',
    'Report Uploaded': 'bg-green-100 text-green-800',
    'Report Ready': 'bg-green-100 text-green-800',
    'Completed': 'bg-emerald-100 text-emerald-800',
    'Cancelled': 'bg-red-100 text-red-800',
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}
