"use client"

import React, { createContext, useContext, useState } from 'react'
import { OrganizationItem, ViewMode, Chain, Token } from '@/types/filesystem'

interface TokenOrganizerContextType {
  items: OrganizationItem[]
  setItems: React.Dispatch<React.SetStateAction<OrganizationItem[]>>
  currentChain: Chain | null
  setCurrentChain: React.Dispatch<React.SetStateAction<Chain | null>>
  currentPath: string[]
  setCurrentPath: React.Dispatch<React.SetStateAction<string[]>>
  viewMode: ViewMode
  setViewMode: React.Dispatch<React.SetStateAction<ViewMode>>
  selectedItems: string[]
  setSelectedItems: React.Dispatch<React.SetStateAction<string[]>>
  chains: Chain[]
}

const TokenOrganizerContext = createContext<TokenOrganizerContextType | undefined>(undefined)

export function useTokenOrganizer() {
  const context = useContext(TokenOrganizerContext)
  if (!context) {
    throw new Error('useTokenOrganizer must be used within a TokenOrganizerProvider')
  }
  return context
}

// Supported chains
const supportedChains: Chain[] = [
  {
    id: 8453,
    name: 'Base',
    shortName: 'BASE',
    icon: '🔵',
    color: '#0052FF',
  },
  {
    id: 59144,
    name: 'Linea',
    shortName: 'LINEA',
    icon: '🟡',
    color: '#121212',
  },
  {
    id: 42161,
    name: 'Arbitrum One',
    shortName: 'ARB',
    icon: '🔴',
    color: '#28A0F0',
  },
  {
    id: 10,
    name: 'Optimism',
    shortName: 'OP',
    icon: '🔴',
    color: '#FF0420',
  },
  {
    id: 1301,
    name: 'Unichain',
    shortName: 'UNI',
    icon: '🦄',
    color: '#FF007A',
  },
  {
    id: 324,
    name: 'zkSync Era',
    shortName: 'ZKSYNC',
    icon: '⚡',
    color: '#8C8DFC',
  },
]

// Sample tokens data
const sampleTokens: Token[] = [
  {
    id: 'eth-base',
    name: 'Ethereum',
    symbol: 'ETH',
    address: '0x0000000000000000000000000000000000000000',
    decimals: 18,
    balance: '2.5',
    value: '$6,250.00',
    chainId: 8453,
  },
  {
    id: 'usdc-base',
    name: 'USD Coin',
    symbol: 'USDC',
    address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    decimals: 6,
    balance: '1000.00',
    value: '$1,000.00',
    chainId: 8453,
  },
  {
    id: 'weth-arbitrum',
    name: 'Wrapped Ethereum',
    symbol: 'WETH',
    address: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
    decimals: 18,
    balance: '1.2',
    value: '$3,000.00',
    chainId: 42161,
  },
  {
    id: 'usdt-arbitrum',
    name: 'Tether USD',
    symbol: 'USDT',
    address: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
    decimals: 6,
    balance: '500.00',
    value: '$500.00',
    chainId: 42161,
  },
]

// Sample organization data
const sampleData: OrganizationItem[] = [
  // Base chain folders and tokens
  {
    id: 'defi-base',
    name: 'DeFi Tokens',
    type: 'folder',
    parentId: null,
    chainId: 8453,
    modified: new Date('2024-01-15'),
  },
  {
    id: 'stables-base',
    name: 'Stablecoins',
    type: 'folder',
    parentId: null,
    chainId: 8453,
    modified: new Date('2024-01-14'),
  },
  {
    id: 'eth-base-item',
    name: 'Ethereum',
    type: 'token',
    parentId: 'defi-base',
    chainId: 8453,
    token: sampleTokens[0],
    modified: new Date('2024-01-15'),
  },
  {
    id: 'usdc-base-item',
    name: 'USD Coin',
    type: 'token',
    parentId: 'stables-base',
    chainId: 8453,
    token: sampleTokens[1],
    modified: new Date('2024-01-14'),
  },
  // Arbitrum chain folders and tokens
  {
    id: 'main-arbitrum',
    name: 'Main Holdings',
    type: 'folder',
    parentId: null,
    chainId: 42161,
    modified: new Date('2024-01-13'),
  },
  {
    id: 'weth-arbitrum-item',
    name: 'Wrapped Ethereum',
    type: 'token',
    parentId: 'main-arbitrum',
    chainId: 42161,
    token: sampleTokens[2],
    modified: new Date('2024-01-13'),
  },
  {
    id: 'usdt-arbitrum-item',
    name: 'Tether USD',
    type: 'token',
    parentId: null,
    chainId: 42161,
    token: sampleTokens[3],
    modified: new Date('2024-01-12'),
  },
]

export function TokenOrganizerProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<OrganizationItem[]>(sampleData)
  const [currentChain, setCurrentChain] = useState<Chain | null>(supportedChains[0]) // Default to Base
  const [currentPath, setCurrentPath] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [selectedItems, setSelectedItems] = useState<string[]>([])

  const value = {
    items,
    setItems,
    currentChain,
    setCurrentChain,
    currentPath,
    setCurrentPath,
    viewMode,
    setViewMode,
    selectedItems,
    setSelectedItems,
    chains: supportedChains,
  }

  return (
    <TokenOrganizerContext.Provider value={value}>
      {children}
    </TokenOrganizerContext.Provider>
  )
}

// Legacy exports for compatibility
export const FileSystemContext = TokenOrganizerContext
export const useFileSystem = useTokenOrganizer
export const FileSystemProvider = TokenOrganizerProvider
