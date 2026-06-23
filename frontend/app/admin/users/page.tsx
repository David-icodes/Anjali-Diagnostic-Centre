'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Trash2, Shield, ShieldAlert, Search, RefreshCw, Pencil, Power, PowerOff, BadgeCheck } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import api from '@/lib/api'
import Modal from '@/components/admin/Modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const staffSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter valid email address'),
  username: z.string().optional(),
  password: z.string().min(6, 'Password must be at least 6 characters').optional().or(z.literal('')),
  mobileNumber: z.string().optional(),
  role: z.string().optional(),
})

type StaffFormData = z.infer<typeof staffSchema>

interface User {
  _id: string
  name: string
  username?: string
  email: string
  role: string
  mobileNumber?: string
  isActive: boolean
  isDefault?: boolean
  createdAt: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deletingUser, setDeletingUser] = useState<User | null>(null)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [currentUserRole, setCurrentUserRole] = useState<string>('')
  const [currentUserId, setCurrentUserId] = useState<string>('')

  const form = useForm<StaffFormData>({
    resolver: zodResolver(staffSchema),
    defaultValues: { name: '', email: '', username: '', password: '', mobileNumber: '', role: 'staff' },
  })

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const { data } = await api.get('/auth/users')
      const userList = Array.isArray(data) ? data : data.users || []
      setUsers(userList)
      const stored = localStorage.getItem('user')
      if (stored) {
        const parsed = JSON.parse(stored)
        setCurrentUserRole(parsed.role || '')
        setCurrentUserId(parsed._id || '')
      }
    } catch {
      toast.error('Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchUsers() }, [])

  const openAddModal = () => {
    setEditingUser(null)
    form.reset({ name: '', email: '', username: '', password: '', mobileNumber: '', role: 'staff' })
    setModalOpen(true)
  }

  const openEditModal = (user: User) => {
    setEditingUser(user)
    form.reset({
      name: user.name,
      email: user.email,
      username: user.username || '',
      password: '',
      mobileNumber: user.mobileNumber || '',
      role: user.role,
    })
    setModalOpen(true)
  }

  const handleSubmit = async (data: StaffFormData) => {
    try {
      if (editingUser) {
        const payload: any = { name: data.name, email: data.email, mobileNumber: data.mobileNumber }
        if (data.username) payload.username = data.username
        if (data.password) payload.password = data.password
        if (currentUserRole === 'superadmin') payload.role = data.role
        await api.put(`/auth/users/${editingUser._id}`, payload)
        toast.success('User updated successfully')
      } else {
        await api.post('/auth/staff', {
          name: data.name,
          email: data.email,
          password: data.password,
          mobileNumber: data.mobileNumber,
          role: currentUserRole === 'superadmin' ? data.role : 'staff',
        })
        toast.success('User added successfully')
      }
      setModalOpen(false)
      fetchUsers()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to save user')
    }
  }

  const handleDelete = async () => {
    if (!deletingUser) return
    try {
      await api.delete(`/auth/users/${deletingUser._id}`)
      toast.success('User deleted successfully')
      setDeleteModalOpen(false)
      setDeletingUser(null)
      fetchUsers()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to delete user')
    }
  }

  const toggleActive = async (user: User) => {
    try {
      await api.put(`/auth/users/${user._id}`, { isActive: !user.isActive })
      toast.success(`User ${user.isActive ? 'deactivated' : 'activated'} successfully`)
      fetchUsers()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to toggle status')
    }
  }

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  const isSuperAdmin = currentUserRole === 'superadmin'
  const isAdmin = (role: string) => role === 'admin' || role === 'superadmin'

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-500 mt-1">Manage staff accounts and permissions</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={fetchUsers} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={openAddModal} className="gap-2">
            <Plus className="h-4 w-4" />
            {isSuperAdmin ? 'Add User' : 'Add Staff'}
          </Button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search users by name or email..."
          className="pl-10"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <Shield className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-500">No users found</h3>
          <p className="text-gray-400 mt-1">Click "Add User" to create a new account.</p>
        </div>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50/50">
                  <th className="text-left p-4 text-sm font-medium text-gray-500">User</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-500">Email / Username</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-500">Mobile</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-500">Role</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-500">Status</th>
                  <th className="text-right p-4 text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user, index) => (
                  <motion.tr
                    key={user._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b last:border-0 hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-sm">
                            {user.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <span className="font-medium text-gray-900">{user.name}</span>
                          {user.isDefault && (
                            <Badge variant="default" className="ml-2 text-[10px] px-1.5 py-0 bg-amber-100 text-amber-800 border-amber-200 gap-1">
                              <BadgeCheck className="w-3 h-3" />
                              Protected Administrator
                            </Badge>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      <div>{user.email}</div>
                      {user.username && <div className="text-xs text-gray-400">@{user.username}</div>}
                    </td>
                    <td className="p-4 text-sm text-gray-600">{user.mobileNumber || '-'}</td>
                    <td className="p-4">
                      <Badge variant={isAdmin(user.role) ? 'default' : 'secondary'} className="gap-1">
                        {isAdmin(user.role) ? <ShieldAlert className="h-3 w-3" /> : <Shield className="h-3 w-3" />}
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <Badge variant={user.isActive ? 'success' : 'secondary'}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEditModal(user)} className="h-8 w-8">
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        {user._id !== currentUserId && (
                          <>
                            <Button variant="ghost" size="icon" onClick={() => toggleActive(user)} className="h-8 w-8">
                              {user.isActive ? <PowerOff className="h-3.5 w-3.5" /> : <Power className="h-3.5 w-3.5" />}
                            </Button>
                            {!user.isDefault && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => { setDeletingUser(user); setDeleteModalOpen(true) }}
                                className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingUser ? 'Edit User' : 'Add User'}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <Input label="Name" {...form.register('name')} error={form.formState.errors.name?.message} />
          <Input label="Email" type="email" {...form.register('email')} error={form.formState.errors.email?.message} />
          <Input label="Username" {...form.register('username')} />
          <Input label="Mobile Number" {...form.register('mobileNumber')} />
          <Input
            label={editingUser ? 'New Password (leave blank to keep)' : 'Password'}
            type="password"
            {...form.register('password')}
            error={form.formState.errors.password?.message}
          />
          {isSuperAdmin && (
            <div>
              <Label className="mb-1.5 block">Role</Label>
              <Select onValueChange={(v) => form.setValue('role', v)} defaultValue={form.getValues('role') || 'staff'}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  {isSuperAdmin && <SelectItem value="superadmin">Super Admin</SelectItem>}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit">{editingUser ? 'Update' : 'Add User'}</Button>
          </div>
        </form>
      </Modal>

      <Modal open={deleteModalOpen} onClose={() => { setDeleteModalOpen(false); setDeletingUser(null) }} title="Delete User">
        {deletingUser && (
          <>
            <p className="text-gray-600 mb-2">
              Are you sure you want to delete <strong>{deletingUser.name}</strong>?
            </p>
            <p className="text-sm text-gray-500 mb-6">This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => { setDeleteModalOpen(false); setDeletingUser(null) }}>Cancel</Button>
              <Button variant="destructive" onClick={handleDelete}>Delete</Button>
            </div>
          </>
        )}
      </Modal>
    </div>
  )
}
