// Contract ABIs exports
export { 
  BUNDL_CORE_ABI, 
  BUNDL_EXECUTOR_ABI, 
  BUNDL_REGISTRY_ABI, 
  PREDICATE_ABI 
} from './abis';

// Type definitions
export interface FolderCreationResult {
  tokenId: number;
  walletAddress: string;
  transactionHash: string;
}

export interface TransferResult {
  success: boolean;
  transactionHash: string;
}
