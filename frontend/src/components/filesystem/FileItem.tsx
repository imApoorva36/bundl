"use client"

import React, { useState } from 'react'
import { useDraggable, useDroppable } from '@dnd-kit/core'
import { cn } from '@/lib/utils'
import { OrganizationItem } from '@/types/filesystem'
import Image from 'next/image'
import { Copy, Check, Wallet } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

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

interface WalletAddressProps {
  address: string
  className?: string
}

function WalletAddress({ address, className }: WalletAddressProps) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent folder selection when clicking copy
    try {
      await navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy: ', err)
    }
  }

  if (address === 'Loading...') {
    return (
      <div className={cn("text-xs text-muted-foreground", className)}>
        <span>Loading wallet...</span>
      </div>
    )
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className={cn("flex items-center gap-1 text-xs text-muted-foreground", className)}>
          <span className="font-mono truncate">
            {address.slice(0, 6)}...{address.slice(-4)}
          </span>
          <button
            onClick={copyToClipboard}
            className="p-0.5 hover:bg-secondary rounded opacity-0 group-hover:opacity-100 transition-opacity"
            title="Copy wallet address"
          >
            {copied ? (
              <Check className="h-3 w-3 text-green-500" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </button>
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs">{address}</span>
          <button
            onClick={copyToClipboard}
            className="p-1 hover:bg-secondary rounded"
          >
            {copied ? (
              <Check className="h-3 w-3 text-green-500" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </button>
        </div>
      </TooltipContent>
    </Tooltip>
  )
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
    setNodeRef: setDragRef,
    transform,
    isDragging: draggableIsDragging,
  } = useDraggable({
    id: item.id,
    data: {
      type: item.type,
      name: item.name,
      chainId: item.chainId,
    }
  })

  const {
    setNodeRef: setDropRef,
    isOver,
  } = useDroppable({
    id: item.id,
    data: {
      type: item.type,
      name: item.name,
      chainId: item.chainId,
    }
  })

  const isDragging = propIsDragging || draggableIsDragging

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined

  // Combine refs
  const setNodeRef = (node: HTMLElement | null) => {
    setDragRef(node)
    setDropRef(node)
  }

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
          "group p-4 rounded-lg border-2 border-transparent hover:border-primary cursor-pointer transition-all",
          "bg-card hover:bg-secondary",
          isSelected && "border-primary bg-primary/10",
          isDragging && "opacity-50 scale-95",
          isOver && item.type === 'folder' && "border-primary bg-secondary-foreground/50"
        )}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
      >
        <div className="flex flex-col items-center space-y-2">
          {item.type === 'folder' ? (
            <Image src="/folder.png" alt="Folder Icon" width={64} height={64} className="m-2" />
          ) : (
            <Image src="/coin.png" alt="Token Icon" width={64} height={64} className="m-2" />
          )}
          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              <p className="text-sm font-medium truncate max-w-[100px] text-foreground" title={item.name}>
                {item.name}
              </p>
              {item.type === 'folder' && item.walletAddress && item.walletAddress !== 'Loading...' && (
                <div title="Has wallet">
                  <Wallet className="h-3 w-3 text-muted-foreground" />
                </div>
              )}
            </div>
            {item.type === 'folder' && item.walletAddress && (
              <WalletAddress address={item.walletAddress} className="mt-1" />
            )}
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
        isDragging && "opacity-50",
        isOver && item.type === 'folder' && "border-primary bg-secondary-foreground/50"
      )}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
    >
      {item.type === 'folder' ? (
        <Image src="/folder.png" alt="Folder Icon" width={64} height={64} className="m-2" />
      ) : (
        <Image src="/coin.png" alt="Token Icon" width={64} height={64} className="m-2" />
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <p className="text-sm font-medium truncate text-foreground">{item.name}</p>
          {item.type === 'folder' && item.walletAddress && item.walletAddress !== 'Loading...' && (
            <div title="Has wallet">
              <Wallet className="h-3 w-3 text-muted-foreground" />
            </div>
          )}
        </div>
        {item.type === 'folder' && item.walletAddress && (
          <WalletAddress address={item.walletAddress} />
        )}
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
