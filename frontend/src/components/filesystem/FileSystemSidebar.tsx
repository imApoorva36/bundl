"use client"

import React from 'react'
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
      item.chainId === currentChain.chain_id
  )

  const handleNavigateToChain = (chainId: number | null) => {
    if (chainId === null) {
      setCurrentChain(null)
      setCurrentPath([])
    } else {
      const chain = chains.find(c => c.chain_id === chainId)
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
    return currentChain?.chain_id === chainId
  }

  const isActiveFolder = (folderId: string) => {
    return currentPath.length === 1 && currentPath[0] === folderId
  }

  return (
    <div className={cn("w-64 bg-background border-r border-border flex flex-col", className)}>
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
            {chains && chains.length > 0 ? chains.map((c) => {
              return (
                <Button
                  key={c.chain_id}
                  variant={isActiveChain(c.chain_id) ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start text-foreground",
                    isActiveChain(c.chain_id)
                      ? "bg-primary/70 border border-primary text-white hover:bg-primary/90"
                      : "hover:bg-secondary hover:text-foreground"
                  )}
                  onClick={() => handleNavigateToChain(c.chain_id)}
                >
                  <Image src={c.chain_icon} alt={c.chain_name} width={20} height={20} className="mr-2" />
                  {c.chain_name}
                </Button>
              )
            }) : (
              <div className="text-sm text-muted-foreground p-2">
                Loading networks...
              </div>
            )}
          </div>
        </div>

        {/* Current Chain Folders */}
        {currentChain && currentChainFolders.length > 0 && (
          <>
            <Separator className="bg-border mt-6" />
            <div className="mt-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                {currentChain.chain_name} Folders
              </h3>
              <div className="space-y-1">
                {currentChainFolders.map((folder) => {
                  const isActive = isActiveFolder(folder.id)

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
                      <Image src="/folder.png" alt="Folder Icon" width={16} height={16} className="mr-2" />
                      {folder.name}
                    </Button>
                  )
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
