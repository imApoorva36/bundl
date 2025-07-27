"use client"

import React from 'react'
import { 
  Folder, 
  FolderOpen, 
  Wallet,
  Star, 
  Clock, 
  Trash,
  Settings,
  Plus
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useFileSystem } from '@/contexts/FileSystemContext'
import Image from 'next/image'

interface FileSystemSidebarProps {
  className?: string
}

export function FileSystemSidebar({ className }: FileSystemSidebarProps) {
  const { items, currentChain, setCurrentChain, currentPath, setCurrentPath, chains } = useFileSystem()

  // Get folders for the current chain
  const currentChainFolders = items.filter(
    item => item.type === 'folder' && 
           item.parentId === null && 
           currentChain && 
           item.chainId === currentChain.id
  )

  const handleNavigateToChain = (chainId: number | null) => {
    if (chainId === null) {
      setCurrentChain(null)
      setCurrentPath([])
    } else {
      const chain = chains.find(c => c.id === chainId)
      if (chain) {
        setCurrentChain(chain)
        setCurrentPath([])
      }
    }
  }

  const handleNavigateToFolder = (folderId: string) => {
    setCurrentPath([folderId])
  }

  const isActiveChain = (chainId: number | null) => {
    if (chainId === null) return currentChain === null
    return currentChain?.id === chainId
  }

  const isActiveFolder = (folderId: string) => {
    return currentPath.length === 1 && currentPath[0] === folderId
  }

  return (
    <div className={cn("w-64 bg-gradient-to-br from-background to-primary/30 border-r border-border flex flex-col", className)}>
      <div className="p-4">
        <Image
          src="/bundl3.png"
          alt="Logo"
          width={250}
          height={32}
          className="mb-4"
        />

        <Separator className="bg-border" />

        {/* Blockchain Networks */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Networks</h3>
          </div>
          <div className="space-y-1">
            {chains.map((chain) => {
              return (
                <Button
                  key={chain.id}
                  variant={isActiveChain(chain.id) ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start text-foreground",
                    isActiveChain(chain.id) 
                      ? "bg-primary/70 border border-primary text-white hover:bg-primary/90" 
                      : "hover:bg-secondary hover:text-foreground"
                  )}
                  onClick={() => handleNavigateToChain(chain.id)}
                >
                  <span className="h-4 w-4 mr-2 text-sm">{chain.icon}</span>
                  {chain.name}
                </Button>
              )
            })}
          </div>
        </div>

        {/* Current Chain Folders */}
        {currentChain && currentChainFolders.length > 0 && (
          <>
            <Separator className="bg-border mt-6" />
            <div className="mt-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                {currentChain.name} Folders
              </h3>
              <div className="space-y-1">
                {currentChainFolders.map((folder) => {
                  const isActive = isActiveFolder(folder.id)
                  const Icon = isActive ? FolderOpen : Folder
                  
                  return (
                    <Button
                      key={folder.id}
                      variant={isActive ? "default" : "ghost"}
                      className={cn(
                        "w-full justify-start text-foreground",
                        isActive 
                          ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                          : "hover:bg-secondary hover:text-foreground"
                      )}
                      onClick={() => handleNavigateToFolder(folder.id)}
                    >
                      <Icon className="h-4 w-4 mr-2 text-primary" />
                      {folder.name}
                    </Button>
                  )
                })}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Settings */}
      <div className="mt-auto p-4">
        <Separator className="mb-4 bg-border" />
        <Button 
          variant="ghost" 
          className="w-full justify-start text-foreground hover:bg-secondary hover:text-foreground"
        >
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </Button>
      </div>
    </div>
  )
}
