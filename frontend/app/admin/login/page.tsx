'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Mail, Lock, Eye, EyeOff, ArrowRight, Stethoscope, Activity, Heart } from 'lucide-react'
import toast from 'react-hot-toast'
import { loginSchema, type LoginFormData } from '@/lib/validations'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const floatingShapes = [
  { Icon: Stethoscope, size: 48, color: 'text-brand-400/20', x: '10%', y: '15%', delay: 0 },
  { Icon: Activity, size: 64, color: 'text-brand-300/15', x: '85%', y: '20%', delay: 0.5 },
  { Icon: Heart, size: 40, color: 'text-rose-300/20', x: '75%', y: '75%', delay: 1 },
  { Icon: Stethoscope, size: 56, color: 'text-brand-400/15', x: '20%', y: '80%', delay: 1.5 },
]

export default function AdminLoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [shakeKey, setShakeKey] = useState(0)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) router.replace('/admin/dashboard')
  }, [router])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    try {
      const res = await api.post('/auth/login', data)
      const { token, user } = res.data
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      toast.success('Welcome back!')
      router.push('/admin/dashboard')
    } catch (error: any) {
      setShakeKey((k) => k + 1)
      toast.error(error.response?.data?.message || 'Invalid credentials')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-brand-950 via-brand-900 to-slate-900 flex items-center justify-center p-4">
      {floatingShapes.map(({ Icon, size, color, x, y, delay }, i) => (
        <motion.div
          key={i}
          className={`absolute ${color}`}
          style={{ left: x, top: y }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: 1,
            scale: 1,
            y: [0, -30, 0],
            rotate: [0, 10, -10, 0],
          }}
          transition={{
            duration: 6,
            delay,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
        >
          <Icon size={size} />
        </motion.div>
      ))}

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-400/10 via-transparent to-transparent" />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="relative w-full max-w-md"
      >
        <div className="absolute -inset-1 bg-gradient-to-r from-brand-500 to-brand-300 rounded-3xl blur-xl opacity-30" />
        <div className="relative bg-white/10 backdrop-blur-2xl rounded-3xl p-8 sm:p-10 border border-white/10 shadow-2xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col items-center mb-8"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shadow-lg shadow-brand-500/30 mb-4">
              <Stethoscope className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Admin Login</h1>
            <p className="text-brand-200/60 text-sm mt-1">Anjali Diagnostic Centre</p>
          </motion.div>

          <AnimatePresence mode="popLayout">
            <motion.form
              key={shakeKey}
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-5"
              animate={shakeKey ? { x: [0, -10, 10, -10, 10, 0] } : {}}
              transition={{ duration: 0.4 }}
            >
              <div>
                <Input
                  type="email"
                  label="Email Address"
                  placeholder="Enter your email"
                  error={errors.email?.message}
                  {...register('email')}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-brand-400 focus:ring-brand-400"
                />
              </div>

              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  label="Password"
                  placeholder="Enter your password"
                  error={errors.password?.message}
                  {...register('password')}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-brand-400 focus:ring-brand-400 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                size="lg"
                className="w-full bg-gradient-to-r from-brand-500 to-brand-400 hover:from-brand-600 hover:to-brand-500 text-white font-semibold shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                ) : (
                  <ArrowRight className="w-5 h-5 mr-2" />
                )}
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </motion.form>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}
