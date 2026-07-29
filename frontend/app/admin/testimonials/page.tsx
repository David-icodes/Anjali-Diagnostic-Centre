'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit2, Trash2, Eye, EyeOff, Star, Quote, Search } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import api from '@/lib/api'
import { testimonialSchema, type TestimonialFormData } from '@/lib/validations'
import Modal from '@/components/admin/Modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface Testimonial {
  _id: string
  name: string
  role?: string
  content: string
  rating: number
  isActive: boolean
  createdAt: string
}

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Testimonial | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const form = useForm<TestimonialFormData>({
    resolver: zodResolver(testimonialSchema),
    defaultValues: { name: '', role: '', content: '', rating: 5, isActive: true },
  })

  const fetchTestimonials = async () => {
    try {
      setLoading(true)
      const { data } = await api.get('/testimonials')
      setTestimonials(Array.isArray(data) ? data : data.testimonials || [])
    } catch {
      toast.error('Failed to fetch testimonials')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchTestimonials() }, [])

  const openAddModal = () => {
    setEditingItem(null)
    form.reset({ name: '', role: '', content: '', rating: 5, isActive: true })
    setModalOpen(true)
  }

  const openEditModal = (item: Testimonial) => {
    setEditingItem(item)
    form.reset({
      name: item.name,
      role: item.role || '',
      content: item.content,
      rating: item.rating,
      isActive: item.isActive,
    })
    setModalOpen(true)
  }

  const handleSubmit = async (data: TestimonialFormData) => {
    try {
      if (editingItem) {
        await api.put(`/testimonials/${editingItem._id}`, data)
        toast.success('Testimonial updated successfully')
      } else {
        await api.post('/testimonials', data)
        toast.success('Testimonial created successfully')
      }
      setModalOpen(false)
      fetchTestimonials()
    } catch {
      toast.error(editingItem ? 'Failed to update testimonial' : 'Failed to create testimonial')
    }
  }

  const handleDelete = async () => {
    if (!deletingId) return
    try {
      await api.delete(`/testimonials/${deletingId}`)
      toast.success('Testimonial deleted successfully')
      setDeleteModalOpen(false)
      setDeletingId(null)
      fetchTestimonials()
    } catch {
      toast.error('Failed to delete testimonial')
    }
  }

  const toggleActive = async (item: Testimonial) => {
    try {
      await api.patch(`/testimonials/${item._id}/toggle`)
      toast.success(`Testimonial ${item.isActive ? 'deactivated' : 'activated'} successfully`)
      fetchTestimonials()
    } catch {
      toast.error('Failed to update testimonial status')
    }
  }

  const renderStars = (rating: number) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          className={`h-4 w-4 ${i <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`}
        />
      ))}
    </div>
  )

  const filtered = testimonials.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    (t.role || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Testimonials</h1>
                <p className="text-gray-500 mt-1">Manage client testimonials and reviews</p>
              </div>
              <Button onClick={openAddModal} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Testimonial
              </Button>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search testimonials..."
                className="pl-10"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            {loading ? (
              <div className="grid gap-6 md:grid-cols-2">
                {[1, 2].map(i => (
                  <Card key={i}>
                    <CardContent className="p-6 space-y-4">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-16 w-full" />
                      <Skeleton className="h-4 w-20" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20">
                <Quote className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-500">No testimonials found</h3>
                <p className="text-gray-500 mt-1">Click "Add Testimonial" to create your first one.</p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                <AnimatePresence mode="popLayout">
                  {filtered.map(item => (
                    <motion.div
                      key={item._id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                    >
                      <Card className="relative overflow-hidden">
                        <CardContent className="p-6">
                          <div className="absolute top-4 right-4">
                            <Badge variant={item.isActive ? 'success' : 'secondary'}>
                              {item.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          <div className="flex items-start gap-4 mb-4">
                            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-lg shrink-0">
                              {item.name.charAt(0)}
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">{item.name}</h3>
                              {item.role && <p className="text-sm text-gray-500">{item.role}</p>}
                              {renderStars(item.rating)}
                            </div>
                          </div>
                          <div className="relative">
                            <Quote className="h-6 w-6 text-blue-100 absolute -top-1 -left-1" />
                            <p className="text-gray-600 text-sm leading-relaxed pl-6 line-clamp-3">
                              {item.content}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                            <Button variant="outline" size="sm" onClick={() => openEditModal(item)} className="gap-1">
                              <Edit2 className="h-3.5 w-3.5" />
                              Edit
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => toggleActive(item)} className="gap-1">
                              {item.isActive ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                              {item.isActive ? 'Deactivate' : 'Activate'}
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => { setDeletingId(item._id); setDeleteModalOpen(true) }}
                              className="gap-1 ml-auto"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingItem ? 'Edit Testimonial' : 'Add Testimonial'}
      >
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <Input label="Name" {...form.register('name')} error={form.formState.errors.name?.message} />
          <Input label="Role (optional)" {...form.register('role')} error={form.formState.errors.role?.message} />
          <Textarea
            label="Content"
            {...form.register('content')}
            error={form.formState.errors.content?.message}
          />
          <div>
            <Label className="mb-2 block">Rating</Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(i => (
                <button
                  key={i}
                  type="button"
                  onClick={() => form.setValue('rating', i)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-6 w-6 ${i <= form.watch('rating') ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`}
                  />
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Switch
              checked={form.watch('isActive')}
              onCheckedChange={v => form.setValue('isActive', v)}
            />
            <Label>Active</Label>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit">{editingItem ? 'Update' : 'Create'} Testimonial</Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={deleteModalOpen}
        onClose={() => { setDeleteModalOpen(false); setDeletingId(null) }}
        title="Delete Testimonial"
      >
        <p className="text-gray-600 mb-6">Are you sure you want to delete this testimonial? This action cannot be undone.</p>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => { setDeleteModalOpen(false); setDeletingId(null) }}>Cancel</Button>
          <Button variant="destructive" onClick={handleDelete}>Delete</Button>
        </div>
      </Modal>
    </div>
  )
}
