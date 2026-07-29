'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminPage() {
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      router.replace('/admin/dashboard')
    } else {
      router.replace('/admin/login')
    }
  }, [router])

  return null
}
