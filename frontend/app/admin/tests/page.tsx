'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Plus, Pencil, Trash2, Power, PowerOff, Search, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import { testSchema, type TestFormData } from '@/lib/validations'
import { formatPrice } from '@/lib/utils'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import DataTable, { Column } from '@/components/admin/DataTable'
import StatusBadge from '@/components/admin/StatusBadge'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
}

interface Test {
  _id: string
  name: string
  originalPrice: number
  hasOffer?: boolean
  isActive: boolean
  isPopular: boolean
}

export default function TestsPage() {
  const [tests, setTests] = useState<Test[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
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
      name: '',
      originalPrice: 0,
      hasOffer: false,
      isActive: true,
      isPopular: false,
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
      const res = await api.get('/tests', { params })
      setTests(res.data.tests || res.data)
      setTotalPages(res.data.pages || 1)
    } catch {
      toast.error('Failed to load tests')
    } finally {
      setLoading(false)
    }
  }, [page, search])

  useEffect(() => { fetchTests() }, [fetchTests])

  const openAddModal = () => {
    setEditingTest(null)
    reset({
      name: '',
      originalPrice: 0,
      hasOffer: false,
      isActive: true,
      isPopular: false,
    })
    setModalOpen(true)
  }

  const openEditModal = (test: Test) => {
    setEditingTest(test)
    reset({
      name: test.name,
      originalPrice: test.originalPrice,
      hasOffer: !!test.hasOffer,
      isActive: test.isActive,
      isPopular: test.isPopular,
    })
    setModalOpen(true)
  }

  const onSubmit = async (data: TestFormData) => {
    setSubmitting(true)
    try {
      const payload = {
        name: data.name,
        originalPrice: Number(data.originalPrice),
        hasOffer: !!data.hasOffer,
        isActive: !!data.isActive,
        isPopular: !!data.isPopular,
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
      header: 'Test Name',
      render: (test) => <p className="font-semibold text-gray-900">{test.name}</p>,
    },
    {
      key: 'originalPrice',
      header: 'Price',
      render: (test) => <p className="font-semibold text-gray-900">{formatPrice(test.originalPrice)}</p>,
    },
    {
      key: 'isPopular',
      header: 'Display',
      render: (test) => (
        <div className="flex flex-wrap gap-2">
          {test.isPopular ? <span className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-medium text-teal-700">POPULAR</span> : null}
          {test.hasOffer ? <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">OFFER</span> : null}
        </div>
      ),
    },
    {
      key: 'isActive',
      header: 'Status',
      render: (test) => <StatusBadge status={test.isActive ? 'Active' : 'Inactive'} />,
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
          <p className="mt-1 text-sm text-gray-500">Minimal test setup with name, price, offer, popular, and status controls only.</p>
        </div>
        <Button onClick={openAddModal} className="bg-gradient-to-r from-brand-500 to-brand-400 text-white shadow-lg shadow-brand-500/25 hover:from-brand-600 hover:to-brand-500">
          <Plus className="mr-2 h-4 w-4" />
          Add Test
        </Button>
      </motion.div>

      <motion.div variants={itemVariants} className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search tests..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="h-10 w-full rounded-lg border border-gray-200 bg-white pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-500"
          />
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card>
          <CardContent className="p-0">
            <DataTable columns={columns} data={tests} loading={loading} />
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4">
                <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                    <ChevronLeft className="mr-1 h-4 w-4" /> Prev
                  </Button>
                  <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                    Next <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingTest ? 'Edit Test' : 'Add Test'}</DialogTitle>
            <DialogDescription>
              Minimal test setup: name, price, Popular toggle, and Offer toggle only.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <Label>Test Name</Label>
              <Input {...register('name')} error={errors.name?.message} placeholder="e.g. Complete Blood Count" />
            </div>
            <div>
              <Label>Price (₹)</Label>
              <Input type="number" {...register('originalPrice')} error={errors.originalPrice?.message} placeholder="0" />
            </div>

            <div className="flex items-center gap-2">
              <Switch checked={!!watchIsPopular} onCheckedChange={(value) => setValue('isPopular', value)} id="isPopular" />
              <Label htmlFor="isPopular">Popular</Label>
            </div>

            <div className="flex items-center gap-2">
              <Switch checked={!!watchHasOffer} onCheckedChange={(value) => setValue('hasOffer', value)} id="hasOffer" />
              <Label htmlFor="hasOffer">Offer</Label>
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
