'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Plus, Pencil, Trash2, Power, PowerOff, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { formatPrice } from '@/lib/utils'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import DataTable, { Column } from '@/components/admin/DataTable'
import StatusBadge from '@/components/admin/StatusBadge'

const packageSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  originalPrice: z.coerce.number().min(1, 'Original price is required'),
  offerPrice: z.coerce.number().min(0, 'Offer price is required'),
  discountPercentage: z.coerce.number().min(0).max(100).optional(),
  homeCollectionAvailable: z.boolean().optional(),
  isActive: z.boolean().optional(),
})

type PackageFormData = z.infer<typeof packageSchema>

interface HealthPackage {
  _id: string
  name: string
  description: string
  benefits: string[]
  includedTests: string[]
  originalPrice: number
  offerPrice: number
  discountPercentage: number
  homeCollectionAvailable: boolean
  isActive: boolean
  createdAt: string
}

export default function HealthPackagesPage() {
  const [packages, setPackages] = useState<HealthPackage[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editing, setEditing] = useState<HealthPackage | null>(null)
  const [deleting, setDeleting] = useState<HealthPackage | null>(null)
  const [benefitsList, setBenefitsList] = useState<string[]>([])
  const [testsList, setTestsList] = useState<string[]>([])

  const form = useForm<PackageFormData>({
    resolver: zodResolver(packageSchema),
    defaultValues: { name: '', description: '', originalPrice: 0, offerPrice: 0, discountPercentage: 0, homeCollectionAvailable: true, isActive: true },
  })

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const params: any = { page, limit: 10 }
      if (search) params.search = search
      const res = await api.get('/health-packages', { params })
      setPackages(res.data.packages || [])
      setTotalPages(res.data.pages || 1)
    } catch {
      toast.error('Failed to load health packages')
    } finally {
      setLoading(false)
    }
  }, [page, search])

  useEffect(() => { fetchData() }, [fetchData])

  const openAdd = () => {
    setEditing(null)
    form.reset({ name: '', description: '', originalPrice: 0, offerPrice: 0, discountPercentage: 0, homeCollectionAvailable: true, isActive: true })
    setBenefitsList([])
    setTestsList([])
    setDialogOpen(true)
  }

  const openEdit = (p: HealthPackage) => {
    setEditing(p)
    form.reset({ name: p.name, description: p.description, originalPrice: p.originalPrice, offerPrice: p.offerPrice, discountPercentage: p.discountPercentage, homeCollectionAvailable: p.homeCollectionAvailable, isActive: p.isActive })
    setBenefitsList(p.benefits || [])
    setTestsList(p.includedTests || [])
    setDialogOpen(true)
  }

  const handleSubmit = async (data: PackageFormData) => {
    try {
      const payload = { ...data, benefits: benefitsList, includedTests: testsList }
      if (editing) {
        await api.put(`/health-packages/${editing._id}`, payload)
        toast.success('Package updated')
      } else {
        await api.post('/health-packages', payload)
        toast.success('Package created')
      }
      setDialogOpen(false)
      fetchData()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to save')
    }
  }

  const handleDelete = async () => {
    if (!deleting) return
    try {
      await api.delete(`/health-packages/${deleting._id}`)
      toast.success('Package deleted')
      setDeleteDialogOpen(false)
      setDeleting(null)
      fetchData()
    } catch { toast.error('Failed to delete') }
  }

  const toggleActive = async (p: HealthPackage) => {
    try {
      await api.put(`/health-packages/${p._id}`, { isActive: !p.isActive })
      toast.success(`Package ${p.isActive ? 'deactivated' : 'activated'}`)
      fetchData()
    } catch { toast.error('Failed to toggle') }
  }

  const columns: Column<HealthPackage>[] = [
    { key: 'name', header: 'Name' },
    { key: 'originalPrice', header: 'Original Price', render: (p) => formatPrice(p.originalPrice) },
    { key: 'offerPrice', header: 'Offer Price', render: (p) => <span className="text-green-600 font-medium">{formatPrice(p.offerPrice)}</span> },
    { key: 'discountPercentage', header: 'Discount', render: (p) => p.discountPercentage ? `${p.discountPercentage}%` : '-' },
    { key: 'isActive', header: 'Status', render: (p) => <StatusBadge status={p.isActive ? 'Active' : 'Inactive'} /> },
    {
      key: '_id', header: 'Actions',
      render: (p) => (
        <div className="flex gap-1">
          <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-brand-600"><Pencil size={16} /></button>
          <button onClick={() => toggleActive(p)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"><PowerOff size={16} /></button>
          <button onClick={() => { setDeleting(p); setDeleteDialogOpen(true) }} className="p-1.5 rounded-lg hover:bg-gray-100 text-red-500"><Trash2 size={16} /></button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Health Packages</h1><p className="text-gray-500 text-sm mt-1">Manage health checkup packages and offers</p></div>
        <Button onClick={openAdd} className="gap-2"><Plus className="w-4 h-4" /> Add Package</Button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input type="text" placeholder="Search packages..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} className="w-full pl-10 pr-4 h-10 rounded-lg border border-input bg-background text-sm" />
        </div>
      </div>

      <Card><CardContent className="p-0">
        <DataTable columns={columns} data={packages} loading={loading} />
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t">
            <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}><ChevronLeft className="w-4 h-4 mr-1" /> Prev</Button>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next <ChevronRight className="w-4 h-4 ml-1" /></Button>
            </div>
          </div>
        )}
      </CardContent></Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? 'Edit Package' : 'Add Package'}</DialogTitle><DialogDescription>Fill in the package details</DialogDescription></DialogHeader>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <Input label="Package Name" {...form.register('name')} error={form.formState.errors.name?.message} />
            <Textarea label="Description" {...form.register('description')} error={form.formState.errors.description?.message} rows={3} />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Original Price" type="number" {...form.register('originalPrice')} error={form.formState.errors.originalPrice?.message} />
              <Input label="Offer Price" type="number" {...form.register('offerPrice')} error={form.formState.errors.offerPrice?.message} />
            </div>
            <Input label="Discount %" type="number" {...form.register('discountPercentage')} />
            <div>
              <Label className="mb-1.5 block">Benefits (one per line)</Label>
              <Textarea value={benefitsList.join('\n')} onChange={(e) => setBenefitsList(e.target.value.split('\n').filter(Boolean))} rows={3} placeholder="Enter each benefit on a new line" />
            </div>
            <div>
              <Label className="mb-1.5 block">Included Tests (one per line)</Label>
              <Textarea value={testsList.join('\n')} onChange={(e) => setTestsList(e.target.value.split('\n').filter(Boolean))} rows={3} placeholder="Enter each test on a new line" />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.watch('homeCollectionAvailable')} onCheckedChange={(v) => form.setValue('homeCollectionAvailable', v)} />
              <Label>Home Collection Available</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.watch('isActive')} onCheckedChange={(v) => form.setValue('isActive', v)} />
              <Label>Active</Label>
            </div>
            <DialogFooter><Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button><Button type="submit">{editing ? 'Update' : 'Create'}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={() => setDeleteDialogOpen(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Delete Package</DialogTitle><DialogDescription>Are you sure? This cannot be undone.</DialogDescription></DialogHeader>
          <DialogFooter><Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button><Button variant="destructive" onClick={handleDelete}>Delete</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
