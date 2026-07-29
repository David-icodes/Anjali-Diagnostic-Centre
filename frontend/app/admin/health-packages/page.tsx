'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Plus, Pencil, Trash2, Power, PowerOff, Search, ChevronLeft, ChevronRight, Check, FlaskConical, ScanLine, X } from 'lucide-react'
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
  name: z.string().min(2, 'Package name is required'),
  description: z.string().min(2, 'Description is required'),
  originalPrice: z.coerce.number().min(1, 'Original price is required'),
  offerPrice: z.coerce.number().min(0).optional(),
  hasOffer: z.boolean().optional(),
  offerText: z.string().optional(),
  isPopular: z.boolean().optional(),
  homeCollectionAvailable: z.boolean().optional(),
  labVisitAvailable: z.boolean().optional(),
  isActive: z.boolean().optional(),
})

type PackageFormData = z.infer<typeof packageSchema>

type IncludedOption = {
  name: string
  type: 'Laboratory' | 'Radiology'
}

interface HealthPackage {
  _id: string
  name: string
  description: string
  benefits?: string[]
  includedTests: string[]
  originalPrice: number
  offerPrice: number
  discountPercentage?: number
  hasOffer?: boolean
  offerText?: string
  isPopular?: boolean
  homeCollectionAvailable?: boolean
  labVisitAvailable?: boolean
  isActive: boolean
  createdAt: string
}

const getArrayFromResponse = (payload: any, keys: string[]) => {
  for (const key of keys) {
    if (Array.isArray(payload?.[key])) return payload[key]
  }
  return Array.isArray(payload) ? payload : []
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
  const [availableOptions, setAvailableOptions] = useState<IncludedOption[]>([])
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [selectorSearch, setSelectorSearch] = useState('')
  const [legacyBenefits, setLegacyBenefits] = useState<string[]>([])

  const form = useForm<PackageFormData>({
    resolver: zodResolver(packageSchema),
    defaultValues: {
      name: '',
      description: '',
      originalPrice: 0,
      offerPrice: 0,
      hasOffer: false,
      offerText: '',
      isPopular: false,
      homeCollectionAvailable: true,
      labVisitAvailable: true,
      isActive: true,
    },
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

  const fetchSelectableItems = useCallback(async () => {
    try {
      const [testsRes, radiologyRes] = await Promise.all([
        api.get('/tests', { params: { limit: 250 } }),
        api.get('/radiology', { params: { limit: 250 } }),
      ])

      const tests = getArrayFromResponse(testsRes.data, ['tests'])
      const radiology = getArrayFromResponse(radiologyRes.data, ['services', 'radiologyServices'])

      const options: IncludedOption[] = [
        ...tests.map((test: any) => ({ name: test.name, type: 'Laboratory' as const })),
        ...radiology.map((service: any) => ({ name: service.name, type: 'Radiology' as const })),
      ]

      const deduped = Array.from(new Map(options.map((option) => [option.name.toLowerCase(), option])).values())
      setAvailableOptions(deduped.sort((a, b) => a.name.localeCompare(b.name)))
    } catch {
      toast.error('Failed to load tests and radiology services for package selection')
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])
  useEffect(() => { fetchSelectableItems() }, [fetchSelectableItems])

  const openAdd = () => {
    setEditing(null)
    setLegacyBenefits([])
    setSelectedItems([])
    setSelectorSearch('')
    form.reset({
      name: '',
      description: '',
      originalPrice: 0,
      offerPrice: 0,
      hasOffer: false,
      offerText: '',
      isPopular: false,
      homeCollectionAvailable: true,
      labVisitAvailable: true,
      isActive: true,
    })
    setDialogOpen(true)
  }

  const openEdit = (pkg: HealthPackage) => {
    setEditing(pkg)
    setLegacyBenefits(pkg.benefits || [])
    setSelectedItems(pkg.includedTests || [])
    setSelectorSearch('')
    form.reset({
      name: pkg.name,
      description: pkg.description,
      originalPrice: pkg.originalPrice,
      offerPrice: pkg.offerPrice || 0,
      hasOffer: !!pkg.hasOffer || (!!pkg.offerPrice && pkg.offerPrice > 0 && pkg.offerPrice < pkg.originalPrice) || !!pkg.offerText,
      offerText: pkg.offerText || '',
      isPopular: !!pkg.isPopular,
      homeCollectionAvailable: pkg.homeCollectionAvailable ?? true,
      labVisitAvailable: pkg.labVisitAvailable ?? true,
      isActive: pkg.isActive,
    })
    setDialogOpen(true)
  }

  const hasOfferEnabled = form.watch('hasOffer')
  const selectedItemSet = useMemo(() => new Set(selectedItems.map((item) => item.toLowerCase())), [selectedItems])

  const mergedOptions = useMemo(() => {
    const extras = selectedItems
      .filter((name) => !availableOptions.some((option) => option.name.toLowerCase() === name.toLowerCase()))
      .map((name) => ({ name, type: 'Laboratory' as const }))

    return [...availableOptions, ...extras]
  }, [availableOptions, selectedItems])

  const filteredOptions = useMemo(() => {
    const query = selectorSearch.trim().toLowerCase()
    if (!query) return mergedOptions
    return mergedOptions.filter((option) => option.name.toLowerCase().includes(query))
  }, [mergedOptions, selectorSearch])

  const groupedOptions = useMemo(() => ({
    Laboratory: filteredOptions.filter((option) => option.type === 'Laboratory'),
    Radiology: filteredOptions.filter((option) => option.type === 'Radiology'),
  }), [filteredOptions])

  const toggleSelectedItem = (name: string) => {
    setSelectedItems((current) => {
      const exists = current.some((item) => item.toLowerCase() === name.toLowerCase())
      if (exists) return current.filter((item) => item.toLowerCase() !== name.toLowerCase())
      return [...current, name]
    })
  }

  const handleSubmit = async (data: PackageFormData) => {
    try {
      const originalPrice = Number(data.originalPrice)
      const hasOffer = !!data.hasOffer
      const rawOfferPrice = Number(data.offerPrice || 0)
      const offerPrice = hasOffer ? rawOfferPrice : 0

      if (hasOffer && (!offerPrice || offerPrice >= originalPrice)) {
        toast.error('Offer price must be lower than the original price when offer is enabled')
        return
      }

      const discountPercentage = hasOffer && offerPrice > 0
        ? Math.round(((originalPrice - offerPrice) / originalPrice) * 100)
        : 0

      const payload = {
        name: data.name,
        description: data.description,
        originalPrice,
        offerPrice,
        discountPercentage,
        hasOffer,
        offerText: hasOffer ? (data.offerText || '') : '',
        isPopular: !!data.isPopular,
        homeCollectionAvailable: !!data.homeCollectionAvailable,
        labVisitAvailable: !!data.labVisitAvailable,
        isActive: !!data.isActive,
        benefits: legacyBenefits,
        includedTests: selectedItems,
      }

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
      toast.error(err?.response?.data?.message || 'Failed to save package')
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
    } catch {
      toast.error('Failed to delete package')
    }
  }

  const toggleActive = async (pkg: HealthPackage) => {
    try {
      await api.put(`/health-packages/${pkg._id}`, { isActive: !pkg.isActive })
      toast.success(`Package ${pkg.isActive ? 'deactivated' : 'activated'}`)
      fetchData()
    } catch {
      toast.error('Failed to update package status')
    }
  }

  const columns: Column<HealthPackage>[] = [
    {
      key: 'name',
      header: 'Package',
      render: (pkg) => (
        <div>
          <p className="font-semibold text-gray-900">{pkg.name}</p>
          <p className="text-xs text-gray-500">{pkg.includedTests?.length || 0} included items</p>
        </div>
      ),
    },
    {
      key: 'originalPrice',
      header: 'Pricing',
      render: (pkg) => {
        const hasOffer = !!pkg.hasOffer && pkg.offerPrice > 0 && pkg.offerPrice < pkg.originalPrice
        return (
          <div>
            {hasOffer ? <p className="text-xs text-gray-400 line-through">{formatPrice(pkg.originalPrice)}</p> : null}
            <p className="font-semibold text-emerald-700">{formatPrice(hasOffer ? pkg.offerPrice : pkg.originalPrice)}</p>
          </div>
        )
      },
    },
    {
      key: 'offerText',
      header: 'Badges',
      render: (pkg) => (
        <div className="flex flex-wrap gap-2">
          {pkg.hasOffer && pkg.offerText ? <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">{pkg.offerText}</span> : null}
          {pkg.isPopular ? <span className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-medium text-teal-700">POPULAR</span> : null}
          {pkg.homeCollectionAvailable ? <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">Home Collection</span> : null}
          {pkg.labVisitAvailable ? <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">Lab Visit</span> : null}
        </div>
      ),
    },
    {
      key: 'isActive',
      header: 'Status',
      render: (pkg) => <StatusBadge status={pkg.isActive ? 'Active' : 'Inactive'} />,
    },
    {
      key: '_id',
      header: 'Actions',
      render: (pkg) => (
        <div className="flex gap-1">
          <button onClick={() => openEdit(pkg)} className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-brand-600"><Pencil size={16} /></button>
          <button onClick={() => toggleActive(pkg)} className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-amber-600">{pkg.isActive ? <PowerOff size={16} /> : <Power size={16} />}</button>
          <button onClick={() => { setDeleting(pkg); setDeleteDialogOpen(true) }} className="rounded-lg p-1.5 text-red-500 transition-colors hover:bg-gray-100"><Trash2 size={16} /></button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Health Packages</h1>
          <p className="mt-1 text-sm text-gray-500">Create clean package cards with dynamic offer, popular, and availability badges.</p>
        </div>
        <Button onClick={openAdd} className="gap-2"><Plus className="h-4 w-4" /> Add Package</Button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <input type="text" placeholder="Search packages..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} className="h-10 w-full rounded-lg border border-input bg-background pl-10 pr-4 text-sm" />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <DataTable columns={columns} data={packages} loading={loading} />
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t px-6 py-4">
              <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))}><ChevronLeft className="mr-1 h-4 w-4" /> Prev</Button>
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((current) => current + 1)}>Next <ChevronRight className="ml-1 h-4 w-4" /></Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[92vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Package' : 'Add Package'}</DialogTitle>
            <DialogDescription>Simplified package form with searchable included items and dynamic homepage/public badges.</DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
            <Input label="Package Name" {...form.register('name')} error={form.formState.errors.name?.message} />

            <Textarea label="Description" rows={3} {...form.register('description')} error={form.formState.errors.description?.message} />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Input label="Original Price" type="number" {...form.register('originalPrice')} error={form.formState.errors.originalPrice?.message} />
              <Input label="Offer Price" type="number" disabled={!hasOfferEnabled} {...form.register('offerPrice')} error={form.formState.errors.offerPrice?.message} />
            </div>

            <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900">Offer</p>
                  <p className="text-sm text-gray-500">Enable a frontend offer badge and discounted package price.</p>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={!!hasOfferEnabled} onCheckedChange={(value) => form.setValue('hasOffer', value)} />
                  <Label>Offer Enabled</Label>
                </div>
              </div>
              {hasOfferEnabled ? (
                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Input label="Offer Text" placeholder="e.g. 20% OFF or Limited Offer" {...form.register('offerText')} error={form.formState.errors.offerText?.message} />
                </div>
              ) : null}
            </div>

            <div className="grid grid-cols-1 gap-4 rounded-2xl border border-gray-100 bg-gray-50/70 p-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="flex items-center justify-between gap-3 rounded-xl bg-white px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-gray-900">Popular</p>
                  <p className="text-xs text-gray-500">Show POPULAR badge</p>
                </div>
                <Switch checked={!!form.watch('isPopular')} onCheckedChange={(value) => form.setValue('isPopular', value)} />
              </div>
              <div className="flex items-center justify-between gap-3 rounded-xl bg-white px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-gray-900">Home Collection</p>
                  <p className="text-xs text-gray-500">Show badge when enabled</p>
                </div>
                <Switch checked={!!form.watch('homeCollectionAvailable')} onCheckedChange={(value) => form.setValue('homeCollectionAvailable', value)} />
              </div>
              <div className="flex items-center justify-between gap-3 rounded-xl bg-white px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-gray-900">Lab Visit</p>
                  <p className="text-xs text-gray-500">Show badge when enabled</p>
                </div>
                <Switch checked={!!form.watch('labVisitAvailable')} onCheckedChange={(value) => form.setValue('labVisitAvailable', value)} />
              </div>
              <div className="flex items-center justify-between gap-3 rounded-xl bg-white px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-gray-900">Status</p>
                  <p className="text-xs text-gray-500">Active package visibility</p>
                </div>
                <Switch checked={!!form.watch('isActive')} onCheckedChange={(value) => form.setValue('isActive', value)} />
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Included Tests</h3>
                  <p className="text-sm text-gray-500">Search and select laboratory tests or radiology services for this package.</p>
                </div>
                <div className="relative w-full md:max-w-sm">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input type="text" value={selectorSearch} onChange={(e) => setSelectorSearch(e.target.value)} placeholder="Search tests or radiology..." className="h-10 w-full rounded-lg border border-input bg-background pl-10 pr-4 text-sm" />
                </div>
              </div>

              {selectedItems.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {selectedItems.map((item) => (
                    <span key={item} className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1.5 text-xs font-medium text-teal-700">
                      {item}
                      <button type="button" onClick={() => toggleSelectedItem(item)} className="rounded-full text-teal-600 transition hover:text-teal-800">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-sm text-gray-500">No tests selected yet.</p>
              )}

              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                <div className="rounded-2xl border border-gray-100">
                  <div className="flex items-center gap-2 border-b border-gray-100 px-4 py-3 text-sm font-semibold text-gray-900">
                    <FlaskConical className="h-4 w-4 text-teal-600" /> Laboratory Tests
                  </div>
                  <div className="max-h-72 space-y-2 overflow-y-auto p-3">
                    {groupedOptions.Laboratory.length > 0 ? groupedOptions.Laboratory.map((option) => (
                      <label key={`lab-${option.name}`} className="flex cursor-pointer items-center gap-3 rounded-xl border border-transparent px-3 py-2 text-sm transition hover:border-teal-100 hover:bg-teal-50/40">
                        <input type="checkbox" checked={selectedItemSet.has(option.name.toLowerCase())} onChange={() => toggleSelectedItem(option.name)} className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500" />
                        <span className="text-gray-700">{option.name}</span>
                      </label>
                    )) : <p className="px-3 py-2 text-sm text-gray-500">No laboratory tests match your search.</p>}
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-100">
                  <div className="flex items-center gap-2 border-b border-gray-100 px-4 py-3 text-sm font-semibold text-gray-900">
                    <ScanLine className="h-4 w-4 text-sky-600" /> Radiology Services
                  </div>
                  <div className="max-h-72 space-y-2 overflow-y-auto p-3">
                    {groupedOptions.Radiology.length > 0 ? groupedOptions.Radiology.map((option) => (
                      <label key={`rad-${option.name}`} className="flex cursor-pointer items-center gap-3 rounded-xl border border-transparent px-3 py-2 text-sm transition hover:border-sky-100 hover:bg-sky-50/40">
                        <input type="checkbox" checked={selectedItemSet.has(option.name.toLowerCase())} onChange={() => toggleSelectedItem(option.name)} className="h-4 w-4 rounded border-gray-300 text-sky-600 focus:ring-sky-500" />
                        <span className="text-gray-700">{option.name}</span>
                      </label>
                    )) : <p className="px-3 py-2 text-sm text-gray-500">No radiology services match your search.</p>}
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit">{editing ? 'Update Package' : 'Create Package'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Package</DialogTitle>
            <DialogDescription>Are you sure? This will remove the package from active package listings.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
