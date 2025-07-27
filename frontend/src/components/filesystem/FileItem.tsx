"use client"

import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { 
  Folder, 
  FolderOpen,
  Coins,
  DollarSign
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { OrganizationItem } from '@/types/filesystem'

interface TokenItemProps {
  item: OrganizationItem
  isSelected: boolean
  viewMode: 'grid' | 'list'
  onSelect: (id: string, isMultiple?: boolean) => void
  onDoubleClick: (item: OrganizationItem) => void
  isDragging?: boolean
}

function formatTokenBalance(balance: string, symbol: string): string {
  const num = parseFloat(balance)
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(2)}M ${symbol}`
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(2)}K ${symbol}`
  } else if (num >= 1) {
    return `${num.toFixed(2)} ${symbol}`
  } else {
    return `${num.toFixed(6)} ${symbol}`
  }
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function FileItem({ 
  item, 
  isSelected, 
  viewMode, 
  onSelect, 
  onDoubleClick,
  isDragging: propIsDragging 
}: TokenItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: sortableIsDragging,
  } = useSortable({ 
    id: item.id,
    data: {
      type: item.type,
      name: item.name,
      chainId: item.chainId,
    }
  })

  const isDragging = propIsDragging || sortableIsDragging

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const Icon = item.type === 'folder' 
    ? (isSelected ? FolderOpen : Folder)
    : Coins

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    onSelect(item.id, e.ctrlKey || e.metaKey)
  }

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    onDoubleClick(item)
  }

  if (viewMode === 'grid') {
    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className={cn(
          "group p-4 rounded-lg border-2 border-transparent hover:border-border cursor-pointer transition-all",
          "bg-card hover:bg-secondary",
          isSelected && "border-primary bg-primary/10",
          isDragging && "opacity-50 scale-95"
        )}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
      >
        <div className="flex flex-col items-center space-y-2">
          <Icon className={cn(
            "h-12 w-12",
            item.type === 'folder' ? "text-primary" : "text-primary"
          )} />
          <div className="text-center">
            <p className="text-sm font-medium truncate max-w-[120px] text-foreground" title={item.name}>
              {item.name}
            </p>
            {item.type === 'token' && item.token && (
              <div className="text-xs text-muted-foreground">
                <p>{formatTokenBalance(item.token.balance, item.token.symbol)}</p>
                {item.token.value && (
                  <p className="text-primary">{item.token.value}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "flex items-center p-3 rounded-lg hover:bg-secondary cursor-pointer transition-all",
        "border-2 border-transparent hover:border-border",
        isSelected && "border-primary bg-primary/10",
        isDragging && "opacity-50"
      )}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
    >
      <Icon className={cn(
        "h-5 w-5 mr-3 flex-shrink-0",
        item.type === 'folder' ? "text-primary" : "text-primary"
      )} />
      
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate text-foreground">{item.name}</p>
        {item.type === 'token' && item.token && (
          <p className="text-xs text-muted-foreground">
            {item.token.symbol} • {item.token.balance}
          </p>
        )}
      </div>
      
      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
        {item.modified && (
          <span className="hidden sm:block">
            {formatDate(item.modified)}
          </span>
        )}
        {item.type === 'token' && item.token?.value && (
          <span className="hidden md:block min-w-[80px] text-right text-primary font-medium">
            {item.token.value}
          </span>
        )}
      </div>
    </div>
  )
}
