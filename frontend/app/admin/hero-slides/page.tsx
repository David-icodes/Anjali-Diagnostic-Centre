'use client'

import { useEffect, useState } from 'react'
import { Edit2, Eye, EyeOff, ImagePlus, Trash2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import api from '@/lib/api'
import Modal from '@/components/admin/Modal'
import ImageUpload from '@/components/admin/ImageUpload'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface HeroSlide {
  _id: string
  title?: string
  image: string
  displayOrder: number
  isActive: boolean
}

export default function HeroSlidesPage() {
  const [slides, setSlides] = useState<HeroSlide[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null)
  const [image, setImage] = useState<File | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const form = useForm({
    defaultValues: {
      title: '',
      displayOrder: 0,
      isActive: true,
    },
  })

  const fetchSlides = async () => {
    try {
      setLoading(true)
      const { data } = await api.get('/hero-slides')
      setSlides(Array.isArray(data) ? data : [])
    } catch {
      toast.error('Failed to load hero slides')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSlides()
  }, [])

  const openCreate = () => {
    setEditingSlide(null)
    setImage(null)
    form.reset({ title: '', displayOrder: slides.length, isActive: true })
    setModalOpen(true)
  }

  const openEdit = (slide: HeroSlide) => {
    setEditingSlide(slide)
    setImage(null)
    form.reset({
      title: slide.title || '',
      displayOrder: slide.displayOrder || 0,
      isActive: slide.isActive,
    })
    setModalOpen(true)
  }

  const submit = form.handleSubmit(async (values) => {
    try {
      const formData = new FormData()
      formData.append('title', values.title || '')
      formData.append('displayOrder', String(values.displayOrder ?? 0))
      formData.append('isActive', String(values.isActive))
      if (image) {
        formData.append('image', image, image.name)
      }

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }

      if (editingSlide) {
        await api.put(`/hero-slides/${editingSlide._id}`, formData, config)
        toast.success('Hero slide updated successfully')
      } else {
        if (!image) {
          toast.error('Please upload a hero image')
          return
        }
        await api.post('/hero-slides', formData, config)
        toast.success('Hero slide created successfully')
      }

      setModalOpen(false)
      setImage(null)
      fetchSlides()
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to save hero slide')
    }
  })

  const toggleStatus = async (slide: HeroSlide) => {
    try {
      await api.patch(`/hero-slides/${slide._id}/toggle`)
      toast.success(`Hero slide ${slide.isActive ? 'disabled' : 'enabled'}`)
      fetchSlides()
    } catch {
      toast.error('Failed to update hero slide status')
    }
  }

  const deleteSlide = async () => {
    if (!deleteId) return
    try {
      await api.delete(`/hero-slides/${deleteId}`)
      toast.success('Hero slide deleted successfully')
      setDeleteId(null)
      fetchSlides()
    } catch {
      toast.error('Failed to delete hero slide')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hero Slider Management</h1>
          <p className="mt-1 text-sm text-gray-500">Control the homepage hero slideshow images, order, and visibility.</p>
        </div>
        <Button onClick={openCreate} className="gap-2 rounded-full bg-gradient-to-r from-brand-600 to-emerald-500 text-white">
          <ImagePlus className="h-4 w-4" />
          Add Hero Slide
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((item) => <Skeleton key={item} className="h-72 rounded-3xl" />)}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {slides.map((slide) => (
            <Card key={slide._id} className="overflow-hidden rounded-[1.75rem] border-gray-200 shadow-sm">
              <div className="relative h-56 overflow-hidden bg-slate-100">
                <img src={slide.image} alt={slide.title || 'Hero slide'} className="h-full w-full object-cover" />
              </div>
              <CardContent className="space-y-4 p-5">
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold text-gray-900">{slide.title || 'Homepage hero image'}</h3>
                  <p className="text-sm text-gray-500">Display Order: {slide.displayOrder}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="gap-1" onClick={() => openEdit(slide)}>
                    <Edit2 className="h-3.5 w-3.5" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1" onClick={() => toggleStatus(slide)}>
                    {slide.isActive ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    {slide.isActive ? 'Disable' : 'Enable'}
                  </Button>
                  <Button variant="destructive" size="sm" className="ml-auto gap-1" onClick={() => setDeleteId(slide._id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingSlide ? 'Edit Hero Slide' : 'Add Hero Slide'}>
        <form onSubmit={submit} className="space-y-4">
          <Input label="Title" {...form.register('title')} />
          <Input label="Display Order" type="number" {...form.register('displayOrder', { valueAsNumber: true })} />
          <div className="space-y-2">
            <Label>{editingSlide ? 'Replace image (optional)' : 'Hero image'}</Label>
            <ImageUpload value={image} onChange={setImage} existingImage={editingSlide?.image} />
            <p className="text-xs text-gray-500">
              {image ? `Selected file: ${image.name}` : editingSlide ? 'Keep the current image or upload a replacement.' : 'Upload a JPG, PNG, or WEBP image for the homepage hero slider.'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Switch checked={form.watch('isActive')} onCheckedChange={(value) => form.setValue('isActive', value)} />
            <Label>Active</Label>
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit">{editingSlide ? 'Update' : 'Create'} Slide</Button>
          </div>
        </form>
      </Modal>

      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Hero Slide">
        <p className="mb-6 text-gray-600">Are you sure you want to delete this hero slide? The image will also be removed from Cloudinary.</p>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button variant="destructive" onClick={deleteSlide}>Delete</Button>
        </div>
      </Modal>
    </div>
  )
}
