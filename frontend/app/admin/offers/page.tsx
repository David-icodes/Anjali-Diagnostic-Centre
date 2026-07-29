'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit2, Trash2, Eye, EyeOff, Tag, Calendar, Percent, Copy, Search } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import api from '@/lib/api'
import { formatDate } from '@/lib/utils'
import { offerSchema, type OfferFormData } from '@/lib/validations'
import Modal from '@/components/admin/Modal'
import ImageUpload from '@/components/admin/ImageUpload'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface Offer {
  _id: string
  title: string
  description: string
  discountPercentage: number
  couponCode?: string
  image?: string
  validFrom: string
  validUntil: string
  isActive: boolean
  showOnHomePage: boolean
  createdAt: string
}

export default function OffersPage() {
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [image, setImage] = useState<File | null>(null)

  const form = useForm<OfferFormData>({
    resolver: zodResolver(offerSchema),
    defaultValues: {
      title: '',
      description: '',
      discountPercentage: 0,
      couponCode: '',
      validFrom: '',
      validUntil: '',
      isActive: true,
      showOnHomePage: false,
    },
  })

  const fetchOffers = async () => {
    try {
      setLoading(true)
      const { data } = await api.get('/offers')
      setOffers(Array.isArray(data) ? data : data.offers || [])
    } catch {
      toast.error('Failed to fetch offers')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOffers()
  }, [])

  const openAddModal = () => {
    setEditingOffer(null)
    form.reset({ title: '', description: '', discountPercentage: 0, couponCode: '', validFrom: '', validUntil: '', isActive: true, showOnHomePage: false })
    setImage(null)
    setModalOpen(true)
  }

  const openEditModal = (offer: Offer) => {
    setEditingOffer(offer)
    form.reset({
      title: offer.title,
      description: offer.description,
      discountPercentage: offer.discountPercentage,
      couponCode: offer.couponCode || '',
      validFrom: new Date(offer.validFrom).toISOString().split('T')[0],
      validUntil: new Date(offer.validUntil).toISOString().split('T')[0],
      isActive: offer.isActive,
      showOnHomePage: offer.showOnHomePage,
    })
    setImage(null)
    setModalOpen(true)
  }

  const handleSubmit = async (data: OfferFormData) => {
    try {
      const formData = new FormData()
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined) formData.append(key, String(value))
      })
      if (image) formData.append('image', image)

      if (editingOffer) {
        await api.put(`/offers/${editingOffer._id}`, formData)
        toast.success('Offer updated successfully')
      } else {
        await api.post('/offers', formData)
        toast.success('Offer created successfully')
      }
      setModalOpen(false)
      fetchOffers()
    } catch {
      toast.error(editingOffer ? 'Failed to update offer' : 'Failed to create offer')
    }
  }

  const handleDelete = async () => {
    if (!deletingId) return
    try {
      await api.delete(`/offers/${deletingId}`)
      toast.success('Offer deleted successfully')
      setDeleteModalOpen(false)
      setDeletingId(null)
      fetchOffers()
    } catch {
      toast.error('Failed to delete offer')
    }
  }

  const toggleActive = async (offer: Offer) => {
    try {
      await api.patch(`/offers/${offer._id}/toggle`)
      toast.success(`Offer ${offer.isActive ? 'deactivated' : 'activated'} successfully`)
      fetchOffers()
    } catch {
      toast.error('Failed to update offer status')
    }
  }

  const filtered = offers.filter(o =>
    o.title.toLowerCase().includes(search.toLowerCase()) ||
    (o.couponCode || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Offers</h1>
                <p className="text-gray-500 mt-1">Manage promotional offers and coupons</p>
              </div>
              <Button onClick={openAddModal} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Offer
              </Button>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search offers by title or coupon code..."
                className="pl-10"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            {loading ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map(i => (
                  <Card key={i}>
                    <CardContent className="p-0">
                      <Skeleton className="h-48 rounded-t-xl" />
                      <div className="p-6 space-y-3">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20">
                <Tag className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-500">No offers found</h3>
                <p className="text-gray-500 mt-1">Click "Add Offer" to create your first offer.</p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <AnimatePresence mode="popLayout">
                  {filtered.map(offer => (
                    <motion.div
                      key={offer._id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                    >
                      <Card className="overflow-hidden group">
                        <div className="relative h-48 bg-gradient-to-br from-blue-50 to-indigo-100">
                          {offer.image ? (
                            <img
                              src={offer.image}
                              alt={offer.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <Tag className="h-16 w-16 text-blue-200" />
                            </div>
                          )}
                          <div className="absolute top-3 right-3">
                            <Badge variant={offer.isActive ? 'success' : 'secondary'}>
                              {offer.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          {offer.showOnHomePage ? (
                            <div className="absolute bottom-3 right-3">
                              <Badge variant="outline" className="border-white/80 bg-white/90 text-brand-700">
                                Home Page
                              </Badge>
                            </div>
                          ) : null}
                          <div className="absolute top-3 left-3">
                            <Badge variant="warning" className="text-base px-3 py-1">
                              {offer.discountPercentage}% OFF
                            </Badge>
                          </div>
                        </div>
                        <CardContent className="p-5">
                          <h3 className="font-semibold text-gray-900 text-lg mb-1">{offer.title}</h3>
                          <p className="text-gray-500 text-sm line-clamp-2 mb-3">{offer.description}</p>
                          {offer.couponCode && (
                            <div className="flex items-center gap-2 mb-3">
                              <Badge variant="outline" className="font-mono text-xs">
                                <Copy className="h-3 w-3 mr-1" />
                                {offer.couponCode}
                              </Badge>
                            </div>
                          )}
                          <div className="flex items-center text-xs text-gray-500 mb-4">
                            <Calendar className="h-3 w-3 mr-1" />
                            {formatDate(offer.validFrom)} - {formatDate(offer.validUntil)}
                          </div>
                          <div className="flex items-center gap-2 pt-3 border-t">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditModal(offer)}
                              className="gap-1"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleActive(offer)}
                              className="gap-1"
                            >
                              {offer.isActive ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                              {offer.isActive ? 'Deactivate' : 'Activate'}
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => { setDeletingId(offer._id); setDeleteModalOpen(true) }}
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
        title={editingOffer ? 'Edit Offer' : 'Add Offer'}
      >
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <Input
            label="Title"
            {...form.register('title')}
            error={form.formState.errors.title?.message}
          />
          <Textarea
            label="Description"
            {...form.register('description')}
            error={form.formState.errors.description?.message}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Discount %"
              type="number"
              {...form.register('discountPercentage')}
              error={form.formState.errors.discountPercentage?.message}
            />
            <Input
              label="Coupon Code"
              {...form.register('couponCode')}
              error={form.formState.errors.couponCode?.message}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Valid From"
              type="date"
              {...form.register('validFrom')}
              error={form.formState.errors.validFrom?.message}
            />
            <Input
              label="Valid Until"
              type="date"
              {...form.register('validUntil')}
              error={form.formState.errors.validUntil?.message}
            />
          </div>
          <ImageUpload
            value={image}
            onChange={setImage}
            existingImage={editingOffer?.image}
          />
          <div className="flex items-center gap-3">
            <Switch
              checked={form.watch('isActive')}
              onCheckedChange={v => form.setValue('isActive', v)}
            />
            <Label>Active</Label>
          </div>
          <div className="flex items-center gap-3">
            <Switch
              checked={form.watch('showOnHomePage')}
              onCheckedChange={v => form.setValue('showOnHomePage', v)}
            />
            <Label>Show On Home Page</Label>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {editingOffer ? 'Update' : 'Create'} Offer
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={deleteModalOpen}
        onClose={() => { setDeleteModalOpen(false); setDeletingId(null) }}
        title="Delete Offer"
      >
        <p className="text-gray-600 mb-6">Are you sure you want to delete this offer? It will be hidden from the website and admin listings but preserved securely in the database.</p>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => { setDeleteModalOpen(false); setDeletingId(null) }}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  )
}
