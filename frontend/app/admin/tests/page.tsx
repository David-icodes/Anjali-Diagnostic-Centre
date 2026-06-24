'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Plus, Pencil, Trash2, Power, PowerOff, Search, ChevronLeft, ChevronRight, Sparkles,
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import { testSchema, type TestFormData } from '@/lib/validations'
import { formatPrice } from '@/lib/utils'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import DataTable, { Column } from '@/components/admin/DataTable'
import StatusBadge from '@/components/admin/StatusBadge'

const categories = [
  'Blood Test',
  'Urine Test',
  'Cardiac',
  'Diabetes',
  'Thyroid',
  'Liver',
  'Kidney',
  'Hormones',
  'Vitamin',
  'Infection',
  'Cancer',
  'Full Body Checkup',
  'Women Health',
  'Senior Citizen',
  'Other',
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
}

interface Test {
  _id: string
  name: string
  category: string
  originalPrice: number
  offerPrice: number
  offerLabel?: string
  offerBadge?: string
  hasOffer?: boolean
  description: string
  preparationInstructions?: string
  testDuration?: string
  isActive: boolean
  isPopular: boolean
}

export default function TestsPage() {
  const [tests, setTests] = useState<Test[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingTest, setEditingTest] = useState<Test | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TestFormData>({
    resolver: zodResolver(testSchema),
    defaultValues: {
      isActive: true,
      isPopular: false,
      hasOffer: false,
      offerLabel: '',
      offerBadge: '',
      description: '',
      preparationInstructions: '',
      testDuration: '',
    },
  })

  const watchIsActive = watch('isActive')
  const watchIsPopular = watch('isPopular')
  const watchHasOffer = watch('hasOffer')

  const fetchTests = useCallback(async () => {
    try {
      setLoading(true)
      const params: any = { page, limit: 10 }
      if (search) params.search = search
      if (categoryFilter) params.category = categoryFilter
      const res = await api.get('/tests', { params })
      setTests(res.data.tests || res.data)
      setTotalPages(res.data.pages || 1)
    } catch {
      toast.error('Failed to load tests')
    } finally {
      setLoading(false)
    }
  }, [page, search, categoryFilter])

  useEffect(() => { fetchTests() }, [fetchTests])

  const openAddModal = () => {
    setEditingTest(null)
    reset({
      name: '',
      category: '',
      description: '',
      originalPrice: 0,
      offerPrice: 0,
      offerLabel: '',
      offerBadge: '',
      hasOffer: false,
      preparationInstructions: '',
      testDuration: '',
      isActive: true,
      isPopular: false,
    })
    setModalOpen(true)
  }

  const openEditModal = (test: Test) => {
    setEditingTest(test)
    reset({
      name: test.name,
      category: test.category,
      description: test.description || '',
      originalPrice: test.originalPrice,
      offerPrice: test.offerPrice,
      offerLabel: test.offerLabel || '',
      offerBadge: test.offerBadge || '',
      hasOffer: !!test.hasOffer || test.offerPrice < test.originalPrice,
      preparationInstructions: test.preparationInstructions || '',
      testDuration: test.testDuration || '',
      isActive: test.isActive,
      isPopular: test.isPopular,
    })
    setModalOpen(true)
  }

  const onSubmit = async (data: TestFormData) => {
    setSubmitting(true)
    try {
      const hasOffer = !!data.hasOffer
      const originalPrice = Number(data.originalPrice)
      const offerPrice = hasOffer
        ? Number(data.offerPrice || 0)
        : originalPrice

      if (hasOffer && (!offerPrice || offerPrice >= originalPrice)) {
        toast.error('Offer price must be lower than the original price when offer is enabled')
        setSubmitting(false)
        return
      }

      const payload = {
        ...data,
        description: data.description || '',
        originalPrice,
        offerPrice,
        hasOffer,
        offerLabel: hasOffer ? (data.offerLabel || '') : '',
        offerBadge: hasOffer ? (data.offerBadge || '') : '',
      }

      if (editingTest) {
        await api.put(`/tests/${editingTest._id}`, payload)
        toast.success('Test updated successfully')
      } else {
        await api.post('/tests', payload)
        toast.success('Test added successfully')
      }
      setModalOpen(false)
      fetchTests()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  const toggleActive = async (test: Test) => {
    try {
      await api.patch(`/tests/${test._id}/toggle`)
      toast.success(`Test ${test.isActive ? 'deactivated' : 'activated'}`)
      fetchTests()
    } catch {
      toast.error('Failed to update status')
    }
  }

  const deleteTest = async () => {
    if (!deleteConfirm) return
    try {
      await api.delete(`/tests/${deleteConfirm}`)
      toast.success('Test deleted successfully')
      setDeleteConfirm(null)
      fetchTests()
    } catch {
      toast.error('Failed to delete test')
    }
  }

  const columns: Column<Test>[] = [
    {
      key: 'name',
      header: 'Name',
      render: (test) => (
        <div>
          <p className="font-semibold text-gray-900">{test.name}</p>
          <p className="text-xs text-gray-500">{test.category}</p>
        </div>
      ),
    },
    {
      key: 'originalPrice',
      header: 'Pricing',
      render: (test) => (
        <div>
          <p className={`font-medium ${test.hasOffer ? 'text-gray-400 line-through' : 'text-gray-900'}`}>{formatPrice(test.originalPrice)}</p>
          {test.hasOffer ? <p className="text-sm font-semibold text-emerald-600">{formatPrice(test.offerPrice)}</p> : null}
        </div>
      ),
    },
    {
      key: 'isPopular',
      header: 'Visibility',
      render: (test) => (
        <div className="flex flex-wrap gap-2">
          <StatusBadge status={test.isActive ? 'Active' : 'Inactive'} />
          {test.isPopular ? <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700">Popular</span> : null}
          {test.hasOffer ? <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">Offer Enabled</span> : null}
        </div>
      ),
    },
    {
      key: 'offerLabel',
      header: 'Offer Details',
      render: (test) => test.hasOffer ? (
        <div>
          <p className="font-medium text-gray-900">{test.offerLabel || 'Special Offer'}</p>
          <p className="text-xs text-gray-500">{test.offerBadge || 'Homepage offer card enabled'}</p>
        </div>
      ) : <span className="text-sm text-gray-400">No offer</span>,
    },
    {
      key: '_id',
      header: 'Actions',
      render: (test) => (
        <div className="flex items-center gap-2">
          <button onClick={() => openEditModal(test)} className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-brand-600">
            <Pencil size={16} />
          </button>
          <button onClick={() => toggleActive(test)} className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-amber-600">
            {test.isActive ? <PowerOff size={16} /> : <Power size={16} />}
          </button>
          <button onClick={() => setDeleteConfirm(test._id)} className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-red-600">
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Test Management</h1>
          <p className="mt-1 text-sm text-gray-500">Required fields stay minimal while Popular and Offer toggles control the homepage automatically.</p>
        </div>
        <Button onClick={openAddModal} className="bg-gradient-to-r from-brand-500 to-brand-400 text-white shadow-lg shadow-brand-500/25 hover:from-brand-600 hover:to-brand-500">
          <Plus className="mr-2 h-4 w-4" />
          Add Test
        </Button>
      </motion.div>

      <motion.div variants={itemVariants} className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search tests..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="h-10 w-full rounded-lg border border-gray-200 bg-white pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400"
          />
        </div>
        <Select value={categoryFilter || 'all'} onValueChange={(v) => { setCategoryFilter(v === 'all' ? '' : v); setPage(1) }}>
          <SelectTrigger className="w-full sm:w-56">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card>
          <CardContent className="p-0">
            <DataTable columns={columns} data={tests} loading={loading} />
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4">
                <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    <ChevronLeft className="mr-1 h-4 w-4" /> Prev
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingTest ? 'Edit Test' : 'Add Test'}</DialogTitle>
            <DialogDescription>
              Required fields: Test Name, Category, and Price. Offer controls are optional and power the homepage Special Offers section.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label>Test Name</Label>
                <Input {...register('name')} error={errors.name?.message} placeholder="e.g. Complete Blood Count" />
              </div>
              <div>
                <Label htmlFor="test-category">Category</Label>
                <select
                  id="test-category"
                  value={watch('category')}
                  onChange={(event) => setValue('category', event.target.value, { shouldValidate: true })}
                  className="mt-2 h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                {errors.category && <p className="mt-1 text-xs text-destructive">{errors.category.message}</p>}
              </div>
            </div>

            <div>
              <Label>Description</Label>
              <Textarea {...register('description')} rows={3} placeholder="Describe the test (optional)..." />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label>Original Price (Rs.)</Label>
                <Input type="number" {...register('originalPrice')} error={errors.originalPrice?.message} placeholder="0" />
              </div>
              <div>
                <Label>Offer Price {watchHasOffer ? '' : '(Optional)'}</Label>
                <Input type="number" {...register('offerPrice')} error={errors.offerPrice?.message} placeholder="0" disabled={!watchHasOffer} />
              </div>
            </div>

            <div className="rounded-2xl border border-amber-100 bg-amber-50/60 p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900">Enable Offer</p>
                  <p className="text-sm text-gray-500">Turn this on to display the test in the homepage Special Offers section.</p>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={watchHasOffer} onCheckedChange={(value) => setValue('hasOffer', value)} id="hasOffer" />
                  <Label htmlFor="hasOffer">Offer Enabled</Label>
                </div>
              </div>
              {watchHasOffer ? (
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <Label>Offer Label</Label>
                    <Input {...register('offerLabel')} placeholder="e.g. Health Saver" />
                  </div>
                  <div>
                    <Label>Offer Badge</Label>
                    <Input {...register('offerBadge')} placeholder="e.g. 20% OFF" />
                  </div>
                </div>
              ) : null}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label>Preparation Instructions</Label>
                <Textarea {...register('preparationInstructions')} rows={2} placeholder="Any preparation instructions..." />
              </div>
              <div>
                <Label>Test Duration</Label>
                <Input {...register('testDuration')} placeholder="e.g. 30 mins, 2 hours" />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 rounded-2xl border border-gray-100 bg-gray-50/70 p-4">
              <div className="flex items-center gap-2">
                <Switch checked={watchIsActive} onCheckedChange={(value) => setValue('isActive', value)} id="isActive" />
                <Label htmlFor="isActive">Active</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={watchIsPopular} onCheckedChange={(value) => setValue('isPopular', value)} id="isPopular" />
                <Label htmlFor="isPopular">Popular</Label>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Sparkles className="h-4 w-4 text-brand-600" />
                Popular shows in homepage Popular Tests.
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting} className="bg-gradient-to-r from-brand-500 to-brand-400">
                {submitting ? 'Saving...' : editingTest ? 'Update Test' : 'Add Test'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Test</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this test? It will be removed from active listings but kept safely in the database.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="destructive" onClick={deleteTest}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}

