"use client"

import React, { useMemo, useState, useEffect } from 'react'
import { ethers } from 'ethers'
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
import { priceService } from '../../lib/priceService'
import { 
  Grid3X3, 
  List, 
  ArrowLeft,
  ChevronRight,
  Folder,
  FolderPlus,
  Send,
  Plus,
  RefreshCw
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import { OrganizationItem, Token } from '@/types/filesystem'
import { useFileSystem } from '@/contexts/FileSystemContext'
import { FileItem } from './FileItem'
import { CreateFolderDialog, SendFolderDialog, CreateTokenDialog } from './ContextDialogs'
import { useBundlContracts } from '@/hooks/useBundlContracts'
import { bundlContractUtils, BundlContractUtils } from '@/lib/contracts/BundlContractUtils'
import Image from 'next/image'

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

  const {
    createFolder: createFolderContract,
    getUserFolders,
    createToken,
    createWallet,
    getWalletAddress,
    sendFolder: sendFolderContract,
    mergeFolderContents,
    isConnected,
    address,
    account,
    loading,
    error,
    connectWallet,
    clearError
  } = useBundlContracts()

  const [draggedItem, setDraggedItem] = React.useState<OrganizationItem | null>(null)
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false)
  const [isCreateTokenOpen, setIsCreateTokenOpen] = useState(false)
  const [isSendFolderOpen, setIsSendFolderOpen] = useState(false)
  const [selectedFolderForSend, setSelectedFolderForSend] = useState<OrganizationItem | null>(null)
  const [selectedFolderForToken, setSelectedFolderForToken] = useState<OrganizationItem | null>(null)
  const [portfolioValue, setPortfolioValue] = useState<{ eth: string; usd: string }>({ eth: '0', usd: '$0.00' })

  const [bundlContractUtils] = useState(() => new BundlContractUtils());

  useEffect(() => {
    if (!isConnected) {
      connectWallet();
    }
  }, [isConnected, connectWallet]);

  useEffect(() => {
    if (isConnected) {
      loadUserFolders();
    }
  }, [isConnected]);

  useEffect(() => {
    if (isConnected && currentChain) {
      loadUserFolders();
    }
  }, [currentChain, isConnected]);

  // Set up event listener for folder transfers
  useEffect(() => {
    if (isConnected) {
      const handleFolderTransfer = (tokenId: number, from: string, to: string) => {
        // Refresh folders when a transfer happens involving this user
        if (address && (from.toLowerCase() === address.toLowerCase() || to.toLowerCase() === address.toLowerCase())) {
          loadUserFolders();
        }
      };

      bundlContractUtils.listenForFolderTransfers(handleFolderTransfer);

      return () => {
        bundlContractUtils.stopListeningForFolderTransfers();
      };
    }
  }, [isConnected, address]);

  // Calculate total portfolio value
  const calculatePortfolioValue = async () => {
    if (!isConnected || !address || !currentChain) {
      setPortfolioValue({ eth: '0', usd: '$0.00' });
      return;
    }

    try {
      // Get total ETH balance across all folders
      const totalETH = await bundlContractUtils.getUserTotalETHBalance();
      
      // Get all token balances
      const allTokens = await bundlContractUtils.getUserAllTokens();
      
      // Calculate total USD value
      let totalUSDValue = 0;
      
      // Add ETH value
      const ethPrice = await priceService.getPriceBySymbol('ETH');
      const ethUSDValue = parseFloat(totalETH) * ethPrice;
      totalUSDValue += ethUSDValue;
      
      // Add token values
      for (const token of allTokens) {
        // token.totalBalance is already formatted as a string, no need to format again
        const balance = token.totalBalance;
        const usdValue = await priceService.calculateUSDValue(
          balance,
          token.decimals,
          token.symbol,
          token.address === '0x0000000000000000000000000000000000000000' ? undefined : token.address,
          currentChain.chain_id
        );
        totalUSDValue += parseFloat(usdValue.toString());
      }
      
      setPortfolioValue({
        eth: parseFloat(totalETH).toFixed(4),
        usd: new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(totalUSDValue)
      });
    } catch (error) {
      console.error('Error calculating portfolio value:', error);
      setPortfolioValue({ eth: '0', usd: '$0.00' });
    }
  };

  // Update portfolio value when folders are loaded
  useEffect(() => {
    if (isConnected && address && currentChain) {
      calculatePortfolioValue();
    }
  }, [items, isConnected, address, currentChain]);

  const loadUserFolders = async () => {
    try {
      const blockchainFolders = await getUserFolders();
      
      if (currentChain) {
        // Convert blockchain folders to UI format and fetch wallet addresses
        const uiFolders: OrganizationItem[] = [];
        for (const folder of blockchainFolders) {
          try {
            // Get the wallet address for this folder
            const walletAddress = await bundlContractUtils.getFolderWallet(folder.tokenId);
            uiFolders.push({
              id: `folder-${folder.tokenId}`,
              name: folder.name,
              type: 'folder' as const,
              parentId: null, // Root level folders for now
              chainId: currentChain.chain_id,
              modified: new Date(),
              tokenId: folder.tokenId, // Store the blockchain token ID
              walletAddress: walletAddress, // Store the wallet address
            });
          } catch (error) {
            // If wallet fetch fails, still add folder without wallet address
            uiFolders.push({
              id: `folder-${folder.tokenId}`,
              name: folder.name,
              type: 'folder' as const,
              parentId: null,
              chainId: currentChain.chain_id,
              modified: new Date(),
              tokenId: folder.tokenId,
              walletAddress: 'Loading...',
            });
          }
        }

        const allTokens: OrganizationItem[] = [];
        for (const folder of blockchainFolders) {
          try {
            const folderTokens = await bundlContractUtils.getFolderTokens(folder.tokenId);
            const uiTokens: OrganizationItem[] = await Promise.all(
              folderTokens.map(async (token: any, index: number) => {
                const balance = ethers.formatUnits(token.totalAmount, token.decimals);
                const usdValue = await priceService.calculateUSDValue(
                  balance,
                  token.decimals,
                  token.symbol,
                  token.address === '0x0000000000000000000000000000000000000000' ? undefined : token.address,
                  currentChain.chain_id
                );

                return {
                  id: `token-${folder.tokenId}-${index}`,
                  name: token.name,
                  type: 'token' as const,
                  parentId: `folder-${folder.tokenId}`,
                  chainId: currentChain.chain_id,
                  modified: new Date(),
                  token: {
                    id: `${token.symbol || token.name.toLowerCase()}-${currentChain.chain_id}`,
                    name: token.name,
                    symbol: token.symbol,
                    address: token.address,
                    decimals: token.decimals,
                    balance,
                    value: usdValue,
                    chainId: currentChain.chain_id,
                  },
                };
              })
            );
            allTokens.push(...uiTokens);
          } catch (error) {
          }
        }

        setItems(prevItems => {
          const itemsFromOtherChains = prevItems.filter(item => item.chainId !== currentChain.chain_id);
          return [...itemsFromOtherChains, ...uiFolders, ...allTokens];
        });
      }
    } catch (error) {
      if (currentChain) {
        setItems(prevItems => prevItems.filter(item => item.chainId !== currentChain.chain_id));
      }
    }
  };

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
      return items.filter(item => item.parentId === null && item.chainId === currentChain.chain_id)
    } else {
      // Show items in the current folder for this chain
      const currentFolderId = currentPath[currentPath.length - 1]
      return items.filter(item => item.parentId === currentFolderId && item.chainId === currentChain.chain_id)
    }
  }, [items, currentPath, currentChain])

  // Get breadcrumb path
  const breadcrumbs = useMemo(() => {
    if (!currentChain) return []
    
    const crumbs = [{ id: 'chain-root', name: currentChain.chain_name, chainIcon: currentChain.chain_icon }]
    
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

  const handleCreateFolder = async (name: string) => {
    // Check if wallet is connected first
    if (!isConnected) {
      try {
        await connectWallet();
      } catch (error) {
        return;
      }
    }

    try {
      // Create folder on blockchain
      const result = await createFolderContract(name);
      
      if (result) {
        // Reload folders from blockchain to get the real data
        await loadUserFolders();
        // Close the dialog after successful creation
        setIsCreateFolderOpen(false);
      }
    } catch (error) {
      // Handle error silently or show user-friendly message
    }
  }

  const handleCreateToken = async (tokenData: {
    type: 'existing' | 'tracked';
    assetType?: 'erc20' | 'native';
    name: string;
    symbol?: string;
    address?: string;
    amount?: string;
  }) => {
    if (!selectedFolderForToken || !isConnected) {
      return;
    }

    try {
      let transactionHash = '';
      
      if (tokenData.type === 'existing' && tokenData.amount) {
        if (tokenData.assetType === 'native') {
          // Native ETH transfer
          transactionHash = await bundlContractUtils.addNativeETHToFolder(
            selectedFolderForToken.tokenId || 0,
            tokenData.amount
          );
        } else if (tokenData.assetType === 'erc20' && tokenData.address) {
          // ERC20 token transfer
          transactionHash = await bundlContractUtils.addTokensToFolder(
            selectedFolderForToken.tokenId || 0,
            tokenData.address,
            tokenData.amount
          );
        }
      } else {
        // Tracked token - no blockchain transaction
        transactionHash = `tracked_${Date.now()}`;
      }
      
      // Create token in UI
      if (currentChain) {
        const newToken: OrganizationItem = {
          id: `token-${Date.now()}`,
          name: tokenData.name,
          type: 'token',
          parentId: selectedFolderForToken.id,
          chainId: currentChain.chain_id,
          modified: new Date(),
          // Add token-specific properties
          token: {
            id: `${tokenData.symbol || tokenData.name.toLowerCase()}-${currentChain.chain_id}`,
            name: tokenData.name,
            symbol: tokenData.symbol || tokenData.name.substring(0, 4).toUpperCase(),
            address: tokenData.address || (tokenData.assetType === 'native' ? 'native' : '0x0000000000000000000000000000000000000000'),
            decimals: tokenData.assetType === 'native' ? 18 : 18, // Default to 18, will be updated for ERC20
            balance: tokenData.amount || '0',
            value: '$0.00',
            chainId: currentChain.chain_id,
          },
          transactionHash: transactionHash
        };

        setItems(prevItems => [...prevItems, newToken]);
      }
      
      // Close the dialog after successful creation
      setSelectedFolderForToken(null);
      setIsCreateTokenOpen(false);
    } catch (error) {
      // Handle error silently or show user-friendly message
    }
  };

  const handleSendFolder = async (targetInput: string, action: 'transfer' | 'merge') => {
    if (selectedFolderForSend) {
      try {
        console.log('Selected folder for send:', selectedFolderForSend);
        const fromTokenId = selectedFolderForSend.tokenId;
        console.log('Token ID:', fromTokenId, 'Type:', typeof fromTokenId);
        
        if (!fromTokenId && fromTokenId !== 0) {
          throw new Error('Invalid folder tokenId');
        }
        
        if (action === 'merge') {
          // Merge contents into another folder
          const toTokenId = parseInt(targetInput);
          if (isNaN(toTokenId)) {
            throw new Error('Invalid target folder ID');
          }
          
          console.log('Merging folder contents from:', fromTokenId, 'to:', toTokenId);
          const result = await mergeFolderContents(fromTokenId, toTokenId);
          
          if (result && result.success) {
            console.log('Folder contents successfully merged!');
            // Refresh the folder list to show updated contents
            await loadUserFolders();
            
            setSelectedFolderForSend(null);
            setIsSendFolderOpen(false);
          }
        } else {
          // Transfer folder ownership (NFT) to the recipient address
          console.log('Transferring folder ownership to:', targetInput);
          const result = await sendFolderContract(fromTokenId, targetInput);
          
          if (result && result.success) {
            console.log('Folder successfully transferred!');
            // Refresh the folder list to show updated ownership
            await loadUserFolders();
            
            setSelectedFolderForSend(null);
            setIsSendFolderOpen(false);
          }
        }
      } catch (error) {
        console.error('Error with folder operation:', error);
      }
    }
  }

  const handleContextMenuCreateFolder = () => {
    setIsCreateFolderOpen(true)
  }

  const handleContextMenuCreateToken = (folder: OrganizationItem) => {
    setSelectedFolderForToken(folder)
    setIsCreateTokenOpen(true)
  }

  const handleContextMenuSendFolder = (folder: OrganizationItem) => {
    setSelectedFolderForSend(folder)
    setIsSendFolderOpen(true)
  }

  return (
    <div className="flex-1 flex flex-col bg-background">
      {/* Header */}
      <div className="p-2 border-b border-border bg-card">
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
                      <Image src={crumb.chainIcon} alt={crumb.name} width={32} height={32} className="mr-1" />
                    ) : null}
                    {crumb.name}
                  </Button>
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* View Controls */}
          <div className='flex items-center space-x-2'>
            {/* Portfolio Value Display */}
            {isConnected && currentChain && (
              <div className="flex items-center space-x-3 px-3 py-2 bg-blue-50 text-blue-700 rounded-md text-sm border border-blue-200">
                <div className="flex flex-col items-end">
                  <span className="text-xs text-blue-600 font-medium">Total Portfolio</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold">{portfolioValue.eth} ETH</span>
                    <span className="text-blue-600">•</span>
                    <span className="font-semibold">{portfolioValue.usd}</span>
                  </div>
                </div>
              </div>
            )}
            
            {/* Wallet Connection Status */}
            <div className="flex items-center space-x-2">
              {!isConnected ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={connectWallet}
                  disabled={loading}
                  className="text-orange-500 border-orange-500 hover:bg-orange-50"
                >
                  {loading ? 'Connecting...' : 'Connect Wallet'}
                </Button>
              ) : (
                <div className="flex items-center space-x-2 px-2 py-1 bg-green-50 text-green-700 rounded-md text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>{address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Connected'}</span>
                </div>
              )}
              
              {error && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={clearError}
                  className="text-xs"
                >
                  {error} ✕
                </Button>
              )}
            </div>

            <Button
              size={'sm'}
              onClick={handleContextMenuCreateFolder}
              disabled={!isConnected}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Folder
            </Button>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={calculatePortfolioValue}
              disabled={!isConnected}
              className="border-border text-foreground hover:bg-secondary"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            
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
                                <ContextMenuItem onClick={() => handleContextMenuCreateToken(item)}>
                                  <Plus className="h-4 w-4 mr-2" />
                                  Create Token
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
                                <ContextMenuItem onClick={() => handleContextMenuCreateToken(item)}>
                                  <Plus className="h-4 w-4 mr-2" />
                                  Create Token
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
                      <p className="text-lg font-medium text-foreground">Select a blockchain network</p>
                      <p className="text-sm">Choose a chain from the sidebar to view your tokens</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground min-h-[400px]">
                      <Image src="/folder.png" alt="Folder Icon" width={64} height={64} className="m-4" />
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
                {currentPath.length > 0 && (
                  <>
                    <ContextMenuSeparator />
                    <ContextMenuItem onClick={() => {
                      // Find the current folder we're inside
                      const currentFolderId = currentPath[currentPath.length - 1];
                      const currentFolder = items.find(item => item.id === currentFolderId);
                      if (currentFolder) {
                        handleContextMenuCreateToken(currentFolder);
                      }
                    }}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Token
                    </ContextMenuItem>
                  </>
                )}
            </ContextMenuContent>
          )}
        </ContextMenu>
      </div>

      {/* Dialogs */}
      <CreateFolderDialog
        open={isCreateFolderOpen}
        onOpenChange={setIsCreateFolderOpen}
        onConfirm={handleCreateFolder}
        loading={loading}
      />

      <CreateTokenDialog
        open={isCreateTokenOpen}
        onOpenChange={(open) => {
          setIsCreateTokenOpen(open)
          if (!open) setSelectedFolderForToken(null)
        }}
        folder={selectedFolderForToken}
        onConfirm={handleCreateToken}
        loading={loading}
      />
      
      <SendFolderDialog
        open={isSendFolderOpen}
        onOpenChange={(open) => {
          setIsSendFolderOpen(open)
          if (!open) setSelectedFolderForSend(null)
        }}
        folder={selectedFolderForSend}
        onConfirm={handleSendFolder}
        loading={loading}
      />
    </div>
  )
}
