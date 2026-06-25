'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2, Power, PowerOff, Search, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
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

const radiologySchema = z.object({
  name: z.string().min(2, 'Name is required'),
  price: z.coerce.number().min(1, 'Price is required'),
  isActive: z.boolean().optional(),
  isPopular: z.boolean().optional(),
  hasOffer: z.boolean().optional(),
})

type RadiologyFormData = z.infer<typeof radiologySchema>

interface RadiologyService {
  _id: string
  name: string
  price: number
  isActive: boolean
  isPopular: boolean
  hasOffer: boolean
  createdAt: string
}

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
    defaultValues: { name: '', price: 0, isActive: true, isPopular: false, hasOffer: false },
  })

  const watchIsPopular = form.watch('isPopular')
  const watchHasOffer = form.watch('hasOffer')

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
    form.reset({ name: '', price: 0, isActive: true, isPopular: false, hasOffer: false })
    setDialogOpen(true)
  }

  const openEdit = (service: RadiologyService) => {
    setEditing(service)
    form.reset({
      name: service.name,
      price: service.price,
      isActive: service.isActive,
      isPopular: service.isPopular,
      hasOffer: service.hasOffer,
    })
    setDialogOpen(true)
  }

  const handleSubmit = async (data: RadiologyFormData) => {
    try {
      const payload = { ...data }
      if (editing) {
        await api.put(`/radiology/${editing._id}`, payload)
        toast.success('Service updated')
      } else {
        await api.post('/radiology', payload)
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

  const toggleActive = async (service: RadiologyService) => {
    try {
      await api.put(`/radiology/${service._id}`, { isActive: !service.isActive })
      toast.success(`Service ${service.isActive ? 'deactivated' : 'activated'}`)
      fetchData()
    } catch {
      toast.error('Failed to toggle')
    }
  }

  const columns: Column<RadiologyService>[] = [
    { key: 'name', header: 'Name' },
    { key: 'price', header: 'Price', render: (service) => formatPrice(service.price) },
    {
      key: 'isPopular', header: 'Popular',
      render: (service) => service.isPopular ? <Sparkles className="h-4 w-4 text-amber-500" /> : null,
    },
    {
      key: 'hasOffer', header: 'Offer',
      render: (service) => service.hasOffer ? <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">OFFER</span> : null,
    },
    { key: 'isActive', header: 'Status', render: (service) => <StatusBadge status={service.isActive ? 'Active' : 'Inactive'} /> },
    {
      key: '_id', header: 'Actions',
      render: (service) => (
        <div className="flex gap-1">
          <button onClick={() => openEdit(service)} className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-brand-600"><Pencil size={16} /></button>
          <button onClick={() => toggleActive(service)} className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100"><PowerOff size={16} /></button>
          <button onClick={() => { setDeleting(service); setDeleteDialogOpen(true) }} className="rounded-lg p-1.5 text-red-500 hover:bg-gray-100"><Trash2 size={16} /></button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Radiology Services</h1><p className="mt-1 text-sm text-gray-500">Clean card layout with name, price, and book now.</p></div>
        <Button onClick={openAdd} className="gap-2"><Plus className="h-4 w-4" /> Add Service</Button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <input type="text" placeholder="Search services..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} className="h-10 w-full rounded-lg border border-input bg-background pl-10 pr-4 text-sm" />
        </div>
      </div>

      <Card><CardContent className="p-0">
        <DataTable columns={columns} data={services} loading={loading} />
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t px-6 py-4">
            <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))}><ChevronLeft className="mr-1 h-4 w-4" /> Prev</Button>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((current) => current + 1)}>Next <ChevronRight className="ml-1 h-4 w-4" /></Button>
            </div>
          </div>
        )}
      </CardContent></Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing ? 'Edit Service' : 'Add Service'}</DialogTitle><DialogDescription>Minimal: name, price, Popular toggle, Offer toggle only.</DialogDescription></DialogHeader>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <Input label="Service Name" {...form.register('name')} error={form.formState.errors.name?.message} />
            <Input label="Price (₹)" type="number" {...form.register('price')} error={form.formState.errors.price?.message} />

            <div className="flex items-center gap-2">
              <Switch checked={!!watchIsPopular} onCheckedChange={(value) => form.setValue('isPopular', value)} />
              <Label>Popular</Label>
            </div>

            <div className="flex items-center gap-2">
              <Switch checked={!!watchHasOffer} onCheckedChange={(value) => form.setValue('hasOffer', value)} />
              <Label>Offer</Label>
            </div>

            <div className="flex items-center gap-2">
              <Switch checked={form.watch('isActive')} onCheckedChange={(value) => form.setValue('isActive', value)} />
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
