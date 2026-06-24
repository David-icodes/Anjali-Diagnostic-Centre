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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import DataTable, { Column } from '@/components/admin/DataTable'
import StatusBadge from '@/components/admin/StatusBadge'

const radiologySchema = z.object({
  name: z.string().min(2, 'Name is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.coerce.number().min(1, 'Price is required'),
  category: z.string().optional(),
  preparationInstructions: z.string().optional(),
  duration: z.string().optional(),
  isActive: z.boolean().optional(),
})

type RadiologyFormData = z.infer<typeof radiologySchema>

interface RadiologyService {
  _id: string
  name: string
  description: string
  price: number
  category: string
  preparationInstructions?: string
  duration?: string
  isActive: boolean
  createdAt: string
}

const categories = ['MRI', 'MRI 3T', 'CT Scan', 'PET CT', 'Ultrasound', 'X-Ray', 'Mammography', 'DEXA Scan', 'General']

export default function RadiologyPage() {
  const [services, setServices] = useState<RadiologyService[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editing, setEditing] = useState<RadiologyService | null>(null)
  const [deleting, setDeleting] = useState<RadiologyService | null>(null)

  const form = useForm<RadiologyFormData>({
    resolver: zodResolver(radiologySchema),
    defaultValues: { name: '', description: '', price: 0, category: '', isActive: true },
  })

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const params: any = { page, limit: 10 }
      if (search) params.search = search
      const res = await api.get('/radiology', { params })
      setServices(res.data.services || [])
      setTotalPages(res.data.pages || 1)
    } catch {
      toast.error('Failed to load radiology services')
    } finally {
      setLoading(false)
    }
  }, [page, search])

  useEffect(() => { fetchData() }, [fetchData])

  const openAdd = () => {
    setEditing(null)
    form.reset({ name: '', description: '', price: 0, category: '', isActive: true })
    setDialogOpen(true)
  }

  const openEdit = (s: RadiologyService) => {
    setEditing(s)
    form.reset({ name: s.name, description: s.description, price: s.price, category: s.category, preparationInstructions: s.preparationInstructions || '', duration: s.duration || '', isActive: s.isActive })
    setDialogOpen(true)
  }

  const handleSubmit = async (data: RadiologyFormData) => {
    try {
      if (editing) {
        await api.put(`/radiology/${editing._id}`, data)
        toast.success('Service updated')
      } else {
        await api.post('/radiology', data)
        toast.success('Service created')
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
      await api.delete(`/radiology/${deleting._id}`)
      toast.success('Service deleted')
      setDeleteDialogOpen(false)
      setDeleting(null)
      fetchData()
    } catch {
      toast.error('Failed to delete')
    }
  }

  const toggleActive = async (s: RadiologyService) => {
    try {
      await api.put(`/radiology/${s._id}`, { isActive: !s.isActive })
      toast.success(`Service ${s.isActive ? 'deactivated' : 'activated'}`)
      fetchData()
    } catch {
      toast.error('Failed to toggle')
    }
  }

  const columns: Column<RadiologyService>[] = [
    { key: 'name', header: 'Name' },
    { key: 'category', header: 'Category' },
    { key: 'price', header: 'Price', render: (s) => formatPrice(s.price) },
    { key: 'isActive', header: 'Status', render: (s) => <StatusBadge status={s.isActive ? 'Active' : 'Inactive'} /> },
    {
      key: '_id', header: 'Actions',
      render: (s) => (
        <div className="flex gap-1">
          <button onClick={() => openEdit(s)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-brand-600"><Pencil size={16} /></button>
          <button onClick={() => toggleActive(s)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"><PowerOff size={16} /></button>
          <button onClick={() => { setDeleting(s); setDeleteDialogOpen(true) }} className="p-1.5 rounded-lg hover:bg-gray-100 text-red-500"><Trash2 size={16} /></button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Radiology Services</h1><p className="text-gray-500 text-sm mt-1">Manage MRI, CT Scan, X-Ray and other radiology services</p></div>
        <Button onClick={openAdd} className="gap-2"><Plus className="w-4 h-4" /> Add Service</Button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input type="text" placeholder="Search services..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} className="w-full pl-10 pr-4 h-10 rounded-lg border border-input bg-background text-sm" />
        </div>
      </div>

      <Card><CardContent className="p-0">
        <DataTable columns={columns} data={services} loading={loading} />
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
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing ? 'Edit Service' : 'Add Service'}</DialogTitle><DialogDescription>Fill in the details below</DialogDescription></DialogHeader>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <Input label="Service Name" {...form.register('name')} error={form.formState.errors.name?.message} />
            <div><Label className="mb-1.5 block">Category</Label>
              <Select onValueChange={(v) => form.setValue('category', v)} defaultValue={form.getValues('category')}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>{categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <Input label="Price" type="number" {...form.register('price')} error={form.formState.errors.price?.message} />
            <Textarea label="Description" {...form.register('description')} error={form.formState.errors.description?.message} rows={3} />
            <Textarea label="Preparation Instructions" {...form.register('preparationInstructions')} rows={2} />
            <Input label="Duration" {...form.register('duration')} placeholder="e.g. 30-45 mins" />
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
          <DialogHeader><DialogTitle>Delete Service</DialogTitle><DialogDescription>Are you sure? This cannot be undone.</DialogDescription></DialogHeader>
          <DialogFooter><Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button><Button variant="destructive" onClick={handleDelete}>Delete</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
