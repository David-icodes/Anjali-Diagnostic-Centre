'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Activity, ChevronLeft, ChevronRight, RefreshCw, Clock, Globe, FolderArchive, AlertTriangle, RotateCcw,
} from 'lucide-react'
import { formatDate } from '@/lib/utils'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import Modal from '@/components/admin/Modal'
import toast from 'react-hot-toast'

interface ActivityLog {
  _id: string
  user: { _id: string; name: string; email: string }
  username: string
  action: string
  details: string
  ipAddress: string
  createdAt: string
  isArchived?: boolean
  archivedAt?: string | null
}

type ConfirmAction =
  | { type: 'single'; id: string }
  | { type: 'selected' }
  | { type: 'all' }
  | { type: 'restore'; id: string }
  | null

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null)
  const [processing, setProcessing] = useState(false)
  const [canDelete, setCanDelete] = useState(false)
  const [canRestore, setCanRestore] = useState(false)
  const [showArchived, setShowArchived] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const res = await api.get('/activity-logs', { params: { page, limit: 20, includeArchived: showArchived ? 'true' : undefined } })
      const nextLogs = res.data.logs || []
      setLogs(nextLogs.filter((log: ActivityLog) => showArchived ? log.isArchived : !log.isArchived))
      setTotalPages(res.data.pages || 1)
      setSelectedIds((prev) => prev.filter((id) => nextLogs.some((log: ActivityLog) => log._id === id)))
    } catch {
      toast.error('Failed to load activity logs')
    } finally {
      setLoading(false)
    }
  }, [page, showArchived])

  useEffect(() => { fetchData() }, [fetchData])

  useEffect(() => {
    try {
      const rawUser = localStorage.getItem('user')
      if (!rawUser) return
      const user = JSON.parse(rawUser)
      setCanDelete(['admin', 'superadmin'].includes(user?.role))
      setCanRestore(user?.role === 'superadmin')
    } catch {
      setCanDelete(false)
      setCanRestore(false)
    }
  }, [])

  const getActionColor = (action: string) => {
    if (action.includes('Created') || action.includes('Uploaded')) return 'bg-green-100 text-green-800'
    if (action.includes('Deleted') || action.includes('Archived')) return 'bg-red-100 text-red-800'
    if (action.includes('Restored')) return 'bg-emerald-100 text-emerald-800'
    if (action.includes('Updated')) return 'bg-blue-100 text-blue-800'
    if (action.includes('Login')) return 'bg-purple-100 text-purple-800'
    return 'bg-gray-100 text-gray-800'
  }

  const allVisibleSelected = logs.length > 0 && logs.every((log) => selectedIds.includes(log._id))

  const toggleAll = () => {
    if (allVisibleSelected) {
      setSelectedIds((prev) => prev.filter((id) => !logs.some((log) => log._id === id)))
      return
    }

    setSelectedIds((prev) => Array.from(new Set([...prev, ...logs.map((log) => log._id)])))
  }

  const toggleOne = (id: string) => {
    setSelectedIds((prev) => (
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    ))
  }

  const runDeleteAction = async () => {
    if (!confirmAction) return

    try {
      setProcessing(true)

      if (confirmAction.type === 'single') {
        await api.delete(`/activity-logs/${confirmAction.id}`)
        toast.success('Activity log archived')
      } else if (confirmAction.type === 'selected') {
        await api.post('/activity-logs/delete-selected', { ids: selectedIds })
        toast.success('Selected activity logs archived')
        setSelectedIds([])
      } else if (confirmAction.type === 'all') {
        await api.delete('/activity-logs')
        toast.success('All activity logs archived')
        setSelectedIds([])
      } else if (confirmAction.type === 'restore') {
        await api.put(`/activity-logs/${confirmAction.id}/restore`)
        toast.success('Activity log restored')
      }

      setConfirmAction(null)
      fetchData()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Unable to update activity logs')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Activity Logs</h1>
          <p className="mt-1 text-sm text-gray-500">Track all admin and staff actions</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={fetchData} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>

          {canRestore && (
            <Button variant="outline" size="sm" onClick={() => { setShowArchived((prev) => !prev); setPage(1) }} className="gap-2">
              <RotateCcw className="h-4 w-4" />
              {showArchived ? 'Show Active Logs' : 'Show Archived Logs'}
            </Button>
          )}

          {canDelete && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfirmAction({ type: 'selected' })}
                disabled={selectedIds.length === 0 || processing}
                className="gap-2 border-amber-200 text-amber-700 hover:bg-amber-50"
              >
                <FolderArchive className="h-4 w-4" />
                Archive Selected
              </Button>
              <Button
                size="sm"
                onClick={() => setConfirmAction({ type: 'all' })}
                disabled={logs.length === 0 || processing}
                className="gap-2 bg-amber-600 text-white hover:bg-amber-700"
              >
                <FolderArchive className="h-4 w-4" />
                Archive Visible Logs
              </Button>
            </>
          )}
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">{[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
      ) : logs.length === 0 ? (
        <div className="py-20 text-center">
          <Activity className="mx-auto mb-4 h-12 w-12 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-500">{showArchived ? 'No archived activity logs found' : 'No activity logs yet'}</h3>
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <label className="flex items-center gap-3 text-sm font-medium text-gray-700">
                <input
                  type="checkbox"
                  checked={allVisibleSelected}
                  onChange={toggleAll}
                  className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                />
                Select all on this page
              </label>
              {selectedIds.length > 0 && (
                <span className="text-sm text-gray-500">{selectedIds.length} selected</span>
              )}
            </div>

            <div className="divide-y">
              {logs.map((log, i) => (
                <motion.div
                  key={log._id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex gap-4 p-4 transition-colors hover:bg-gray-50/50"
                >
                  {canDelete && !showArchived && (
                    <div className="pt-1">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(log._id)}
                        onChange={() => toggleOne(log._id)}
                        className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                        aria-label={`Select log ${log._id}`}
                      />
                    </div>
                  )}

                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-50">
                    <Activity className="h-4 w-4 text-brand-600" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">{log.username || log.user?.name || 'System'}</span>
                      <Badge className={`px-1.5 py-0 text-[10px] ${getActionColor(log.action)}`}>{log.action}</Badge>
                    </div>
                    <p className="mt-0.5 text-sm text-gray-500">{log.details}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{formatDate(log.createdAt)}</span>
                      {log.ipAddress && <span className="flex items-center gap-1"><Globe className="h-3 w-3" />{log.ipAddress}</span>}
                      {showArchived && log.archivedAt && <span className="flex items-center gap-1"><FolderArchive className="h-3 w-3" />Archived {formatDate(log.archivedAt)}</span>}
                    </div>
                  </div>

                  {canDelete && !showArchived && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setConfirmAction({ type: 'single', id: log._id })}
                      className="self-start text-amber-600 hover:bg-amber-50 hover:text-amber-700"
                    >
                      <FolderArchive className="h-4 w-4" />
                    </Button>
                  )}

                  {canRestore && showArchived && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setConfirmAction({ type: 'restore', id: log._id })}
                      className="self-start text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  )}
                </motion.div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t px-6 py-4">
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
      )}

      <Modal
        open={!!confirmAction}
        onClose={() => !processing && setConfirmAction(null)}
        title={confirmAction?.type === 'restore' ? 'Restore Activity Log' : 'Archive Activity Logs'}
        description={confirmAction?.type === 'restore' ? 'This will return the log to active views.' : 'Logs will be hidden from normal views and retained permanently.'}
        size="sm"
      >
        <div className="space-y-5">
          <div className={`flex gap-3 rounded-2xl p-4 text-sm ${confirmAction?.type === 'restore' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-800'}`}>
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
            <p>
              {confirmAction?.type === 'single' && 'Archive this activity log?'}
              {confirmAction?.type === 'selected' && `Archive ${selectedIds.length} selected activity log${selectedIds.length === 1 ? '' : 's'}?`}
              {confirmAction?.type === 'all' && 'Archive all currently visible activity logs?'}
              {confirmAction?.type === 'restore' && 'Restore this archived activity log?'}
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setConfirmAction(null)} disabled={processing}>Cancel</Button>
            <Button
              onClick={runDeleteAction}
              disabled={processing}
              className={confirmAction?.type === 'restore' ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-amber-600 text-white hover:bg-amber-700'}
            >
              {processing ? (confirmAction?.type === 'restore' ? 'Restoring...' : 'Archiving...') : (confirmAction?.type === 'restore' ? 'Restore' : 'Confirm Archive')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
