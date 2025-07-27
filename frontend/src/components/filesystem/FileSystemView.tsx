"use client"

import React, { useMemo, useState } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
} from '@dnd-kit/sortable'
import { 
  Grid3X3, 
  List, 
  ArrowLeft,
  ChevronRight,
  Home,
  Folder,
  FolderPlus,
  Send
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import { OrganizationItem, DragData } from '@/types/filesystem'
import { useFileSystem } from '@/contexts/FileSystemContext'
import { FileItem } from './FileItem'
import { CreateFolderDialog, SendFolderDialog } from './ContextDialogs'
import { Wallet } from '@coinbase/onchainkit/wallet'

export function FileSystemView() {
  const {
    items,
    setItems,
    currentChain,
    currentPath,
    setCurrentPath,
    viewMode,
    setViewMode,
    selectedItems,
    setSelectedItems,
  } = useFileSystem()

  const [draggedItem, setDraggedItem] = React.useState<OrganizationItem | null>(null)
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false)
  const [isSendFolderOpen, setIsSendFolderOpen] = useState(false)
  const [selectedFolderForSend, setSelectedFolderForSend] = useState<OrganizationItem | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  // Get current folder items
  const currentItems = useMemo(() => {
    if (!currentChain) {
      // No chain selected - show portfolio overview or empty state
      return []
    }
    
    if (currentPath.length === 0) {
      // Root level of a chain - show all items without parent for this chain
      return items.filter(item => item.parentId === null && item.chainId === currentChain.id)
    } else {
      // Show items in the current folder for this chain
      const currentFolderId = currentPath[currentPath.length - 1]
      return items.filter(item => item.parentId === currentFolderId && item.chainId === currentChain.id)
    }
  }, [items, currentPath, currentChain])

  // Get breadcrumb path
  const breadcrumbs = useMemo(() => {
    if (!currentChain) return []
    
    const crumbs = [{ id: 'chain-root', name: currentChain.name, chainIcon: currentChain.icon }]
    
    for (let i = 0; i < currentPath.length; i++) {
      const folderId = currentPath[i]
      const folder = items.find(item => item.id === folderId)
      if (folder) {
        crumbs.push({ id: folder.id, name: folder.name, chainIcon: '' })
      }
    }
    
    return crumbs
  }, [currentPath, items, currentChain])

  const handleSelect = (id: string, isMultiple = false) => {
    if (isMultiple) {
      setSelectedItems(prev => 
        prev.includes(id) 
          ? prev.filter(item => item !== id)
          : [...prev, id]
      )
    } else {
      setSelectedItems(prev => prev.includes(id) ? [] : [id])
    }
  }

  const handleDoubleClick = (item: OrganizationItem) => {
    if (item.type === 'folder') {
      setCurrentPath(prev => [...prev, item.id])
      setSelectedItems([])
    }
  }

  const handleNavigateBack = () => {
    setCurrentPath(prev => prev.slice(0, -1))
    setSelectedItems([])
  }

  const handleBreadcrumbClick = (index: number) => {
    if (index === 0) {
      setCurrentPath([])
    } else {
      setCurrentPath(prev => prev.slice(0, index))
    }
    setSelectedItems([])
  }

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const draggedItem = items.find(item => item.id === active.id)
    setDraggedItem(draggedItem || null)
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    
    if (!over || active.id === over.id) return

    const activeItem = items.find(item => item.id === active.id)
    const overItem = items.find(item => item.id === over.id)
    
    if (!activeItem || !overItem) return

    // Only allow tokens to be moved into folders
    if (activeItem.type === 'token' && overItem.type === 'folder') {
      setItems(prevItems => {
        return prevItems.map(item => {
          if (item.id === activeItem.id) {
            return { ...item, parentId: overItem.id }
          }
          return item
        })
      })
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setDraggedItem(null)

    if (!over || active.id === over.id) return

    const activeIndex = currentItems.findIndex(item => item.id === active.id)
    const overIndex = currentItems.findIndex(item => item.id === over.id)

    if (activeIndex !== -1 && overIndex !== -1) {
      const activeItem = currentItems[activeIndex]
      const overItem = currentItems[overIndex]

      // Handle folder reorganization (only folders can be rearranged)
      if (activeItem.type === 'folder' && overItem.type === 'folder') {
        const newOrder = arrayMove(currentItems, activeIndex, overIndex)
        
        // Update the items array with new order
        setItems(prevItems => {
          const otherItems = prevItems.filter(item => 
            !currentItems.some(currentItem => currentItem.id === item.id)
          )
          return [...otherItems, ...newOrder]
        })
      }
    }
  }

  const handleCreateFolder = (name: string) => {
    if (!currentChain) return

    const newFolder: OrganizationItem = {
      id: `folder-${Date.now()}`,
      name,
      type: 'folder',
      parentId: currentPath.length > 0 ? currentPath[currentPath.length - 1] : null,
      chainId: currentChain.id,
      modified: new Date(),
    }

    setItems(prevItems => [...prevItems, newFolder])
  }

  const handleSendFolder = (address: string) => {
    if (selectedFolderForSend) {
      // Here you would implement the actual sending logic
      console.log(`Sending folder "${selectedFolderForSend.name}" to address: ${address}`)
      // You could show a success toast or notification here
      setSelectedFolderForSend(null)
    }
  }

  const handleContextMenuCreateFolder = () => {
    setIsCreateFolderOpen(true)
  }

  const handleContextMenuSendFolder = (folder: OrganizationItem) => {
    setSelectedFolderForSend(folder)
    setIsSendFolderOpen(true)
  }

  return (
    <div className="flex-1 flex flex-col bg-background">
      {/* Header */}
      <div className="p-4 border-b border-border bg-card">
        <div className="flex items-center justify-between mb-4">
          {/* Navigation */}
          <div className="flex items-center space-x-2">
            {currentPath.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleNavigateBack}
                className="border-border text-foreground hover:bg-secondary"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            
            {/* Breadcrumbs */}
            <div className="flex items-center space-x-1">
              {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={crumb.id}>
                  {index > 0 && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleBreadcrumbClick(index)}
                    className={cn(
                      "text-sm hover:bg-secondary",
                      index === breadcrumbs.length - 1 
                        ? "font-medium text-foreground" 
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {index === 0 && crumb.chainIcon ? (
                      <span className="text-sm mr-1">{crumb.chainIcon}</span>
                    ) : null}
                    {crumb.name}
                  </Button>
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* View Controls */}
          <div className='flex items-center space-x-2'>
          <div className="flex items-center space-x-2">

            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className={cn(
                viewMode === 'grid' 
                  ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                  : "border-border text-foreground hover:bg-secondary"
              )}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
              className={cn(
                viewMode === 'list' 
                  ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                  : "border-border text-foreground hover:bg-secondary"
              )}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          <Wallet
          />
          </div>
        </div>

        {/* Status */}
        <p className="text-sm text-muted-foreground">
          {currentItems.length} items
          {selectedItems.length > 0 && ` • ${selectedItems.length} selected`}
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 p-4">
        <ContextMenu>
          <ContextMenuTrigger asChild>
            <div className="w-full min-h-full">
              <DndContext
                sensors={sensors}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={currentItems.map(item => item.id)}
                  strategy={rectSortingStrategy}
                >
                  {currentItems.length > 0 ? (
                    viewMode === 'grid' ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                        {currentItems.map((item) => (
                          <ContextMenu key={item.id}>
                            <ContextMenuTrigger>
                              <FileItem
                                item={item}
                                isSelected={selectedItems.includes(item.id)}
                                viewMode={viewMode}
                                onSelect={handleSelect}
                                onDoubleClick={handleDoubleClick}
                              />
                            </ContextMenuTrigger>
                            {item.type === 'folder' && (
                              <ContextMenuContent>
                                <ContextMenuItem onClick={() => handleDoubleClick(item)}>
                                  <Folder className="h-4 w-4 mr-2" />
                                  Open Folder
                                </ContextMenuItem>
                                <ContextMenuSeparator />
                                <ContextMenuItem onClick={() => handleContextMenuSendFolder(item)}>
                                  <Send className="h-4 w-4 mr-2" />
                                  Send Folder
                                </ContextMenuItem>
                              </ContextMenuContent>
                            )}
                          </ContextMenu>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {currentItems.map((item) => (
                          <ContextMenu key={item.id}>
                            <ContextMenuTrigger>
                              <FileItem
                                item={item}
                                isSelected={selectedItems.includes(item.id)}
                                viewMode={viewMode}
                                onSelect={handleSelect}
                                onDoubleClick={handleDoubleClick}
                              />
                            </ContextMenuTrigger>
                            {item.type === 'folder' && (
                              <ContextMenuContent>
                                <ContextMenuItem onClick={() => handleDoubleClick(item)}>
                                  <Folder className="h-4 w-4 mr-2" />
                                  Open Folder
                                </ContextMenuItem>
                                <ContextMenuSeparator />
                                <ContextMenuItem onClick={() => handleContextMenuSendFolder(item)}>
                                  <Send className="h-4 w-4 mr-2" />
                                  Send Folder
                                </ContextMenuItem>
                              </ContextMenuContent>
                            )}
                          </ContextMenu>
                        ))}
                      </div>
                    )
                  ) : !currentChain ? (
                    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground min-h-[400px]">
                      <Wallet className="h-16 w-16 mb-4 text-primary" />
                      <p className="text-lg font-medium text-foreground">Select a blockchain network</p>
                      <p className="text-sm">Choose a chain from the sidebar to view your tokens</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground min-h-[400px]">
                      <Folder className="h-16 w-16 mb-4 text-primary" />
                      <p className="text-lg font-medium text-foreground">
                        {currentPath.length === 0 ? 'No tokens or folders on this chain' : 'This folder is empty'}
                      </p>
                      <p className="text-sm">
                        {currentPath.length === 0 
                          ? 'Right-click to create folders to organize your tokens' 
                          : 'Right-click to add tokens or create subfolders'}
                      </p>
                    </div>
                  )}
                </SortableContext>

                <DragOverlay>
                  {draggedItem ? (
                    <FileItem
                      item={draggedItem}
                      isSelected={false}
                      viewMode={viewMode}
                      onSelect={() => {}}
                      onDoubleClick={() => {}}
                      isDragging={true}
                    />
                  ) : null}
                </DragOverlay>
              </DndContext>
            </div>
          </ContextMenuTrigger>
          {currentChain && (
            <ContextMenuContent>
              <ContextMenuItem onClick={handleContextMenuCreateFolder}>
                <FolderPlus className="h-4 w-4 mr-2" />
                Create New Folder
              </ContextMenuItem>
            </ContextMenuContent>
          )}
        </ContextMenu>
      </div>

      {/* Dialogs */}
      <CreateFolderDialog
        isOpen={isCreateFolderOpen}
        onClose={() => setIsCreateFolderOpen(false)}
        onConfirm={handleCreateFolder}
      />
      
      <SendFolderDialog
        isOpen={isSendFolderOpen}
        onClose={() => {
          setIsSendFolderOpen(false)
          setSelectedFolderForSend(null)
        }}
        onConfirm={handleSendFolder}
        folderName={selectedFolderForSend?.name || ''}
      />
    </div>
  )
}
