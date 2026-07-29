'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Phone, User, Calendar, Trash2, CheckCheck, ChevronDown, ChevronUp, MessageSquare, Search, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '@/lib/api'
import { formatDate } from '@/lib/utils'
import DataTable from '@/components/admin/DataTable'
import Modal from '@/components/admin/Modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface Enquiry {
  _id: string
  name: string
  mobileNumber: string
  email: string
  message: string
  isRead: boolean
  createdAt: string
}

export default function EnquiriesPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchEnquiries = async () => {
    try {
      setLoading(true)
      const { data } = await api.get('/enquiries')
      setEnquiries(Array.isArray(data) ? data : data.enquiries || [])
    } catch {
      toast.error('Failed to fetch enquiries')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchEnquiries() }, [])

  const unreadCount = enquiries.filter(e => !e.isRead).length

  const markAsRead = async (id: string) => {
    try {
      await api.put(`/enquiries/${id}/read`)
      setEnquiries(prev => prev.map(e => e._id === id ? { ...e, isRead: true } : e))
      toast.success('Marked as read')
    } catch {
      toast.error('Failed to update enquiry')
    }
  }

  const handleDelete = async () => {
    if (!deletingId) return
    try {
      await api.delete(`/enquiries/${deletingId}`)
      toast.success('Enquiry deleted successfully')
      setDeleteModalOpen(false)
      setDeletingId(null)
      fetchEnquiries()
    } catch {
      toast.error('Failed to delete enquiry')
    }
  }

  const filtered = enquiries.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.email.toLowerCase().includes(search.toLowerCase()) ||
    e.mobileNumber.includes(search)
  )

  const columns = [
    { header: 'Status', accessor: 'isRead' as const },
    { header: 'Name', accessor: 'name' as const },
    { header: 'Mobile', accessor: 'mobileNumber' as const },
    { header: 'Email', accessor: 'email' as const },
    { header: 'Date', accessor: 'createdAt' as const },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Enquiries</h1>
          <p className="text-gray-500 mt-1">Manage customer enquiries and messages</p>
        </div>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <Badge variant="info" className="text-sm px-3 py-1">
              {unreadCount} Unread
            </Badge>
          )}
          <Button variant="outline" size="sm" onClick={fetchEnquiries} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
        <Input
          placeholder="Search by name, email or mobile..."
          className="pl-10"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <Mail className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-500">No enquiries found</h3>
          <p className="text-gray-500 mt-1">When customers submit enquiries, they will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filtered.map(enquiry => (
              <motion.div
                key={enquiry._id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Card
                  className={`overflow-hidden cursor-pointer transition-colors ${
                    !enquiry.isRead ? 'border-l-4 border-l-blue-500 bg-blue-50/30' : ''
                  }`}
                  onClick={() => setExpandedId(expandedId === enquiry._id ? null : enquiry._id)}
                >
                  <div className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="shrink-0">
                        {enquiry.isRead ? (
                          <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                            <Mail className="h-4 w-4 text-gray-500" />
                          </div>
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <Mail className="h-4 w-4 text-blue-600" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className={`font-medium truncate ${!enquiry.isRead ? 'text-gray-900' : 'text-gray-600'}`}>
                            {enquiry.name}
                          </span>
                          {!enquiry.isRead && (
                            <Badge variant="info" className="text-xs">New</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {enquiry.mobileNumber}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(enquiry.createdAt)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {!enquiry.isRead && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={e => { e.stopPropagation(); markAsRead(enquiry._id) }}
                            className="gap-1"
                          >
                            <CheckCheck className="h-4 w-4" />
                            Mark Read
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={e => { e.stopPropagation(); setDeletingId(enquiry._id); setDeleteModalOpen(true) }}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        {expandedId === enquiry._id ? (
                          <ChevronUp className="h-4 w-4 text-gray-500" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-gray-500" />
                        )}
                      </div>
                    </div>

                    <AnimatePresence>
                      {expandedId === enquiry._id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="pt-4 mt-4 border-t">
                            <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                              <MessageSquare className="h-4 w-4" />
                              <span>Message from {enquiry.name} ({enquiry.email})</span>
                            </div>
                            <p className="text-gray-700 bg-white rounded-lg p-4 border whitespace-pre-wrap">
                              {enquiry.message}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <Modal
        open={deleteModalOpen}
        onClose={() => { setDeleteModalOpen(false); setDeletingId(null) }}
        title="Delete Enquiry"
      >
        <p className="text-gray-600 mb-6">Are you sure you want to delete this enquiry? This action cannot be undone.</p>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => { setDeleteModalOpen(false); setDeletingId(null) }}>Cancel</Button>
          <Button variant="destructive" onClick={handleDelete}>Delete</Button>
        </div>
      </Modal>
    </div>
  )
}
