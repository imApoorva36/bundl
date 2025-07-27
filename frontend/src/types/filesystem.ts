export interface Token {
  id: string
  name: string
  symbol: string
  address: string
  decimals: number
  balance: string
  value?: string
  logo?: string
  chainId: number
}

export interface OrganizationItem {
  id: string
  name: string
  type: 'token' | 'folder'
  parentId: string | null
  chainId: number
  modified?: Date
  // For folders
  children?: OrganizationItem[]
  // For tokens
  token?: Token
}

export interface Chain {
  chain_id: number
  chain_name: string
  chain_icon: string
}

export type ViewMode = 'grid' | 'list'

export interface DragData {
  id: string
  type: 'token' | 'folder'
  name: string
  chainId: number
}
