"use client"

import { cn, getStatusColor } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

interface StatusBadgeProps {
  status: string
  className?: string
}

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        'border-0 font-medium px-2.5 py-0.5 text-xs rounded-full',
        getStatusColor(status),
        className
      )}
    >
      {status}
    </Badge>
  )
}
