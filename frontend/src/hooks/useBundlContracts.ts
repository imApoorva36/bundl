"use client"

import { useState, useCallback } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { bundlContractUtils } from '@/lib/contracts/BundlContractUtils';

export function useBundlContracts() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connectWallet = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!isConnected && connectors.length > 0) {
        await connect({ connector: connectors[0] });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet');
    } finally {
      setLoading(false);
    }
  }, [connect, connectors, isConnected]);

  const createFolderContract = useCallback(async (name: string) => {
    if (!isConnected || !address) {
      throw new Error("Wallet not connected");
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await bundlContractUtils.createFolder(name);
      setLoading(false);
      return result;
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  }, [isConnected, address]);

  const sendFolderContract = useCallback(async (tokenId: number, to: string) => {
    if (!isConnected || !address) {
      throw new Error("Wallet not connected");
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await bundlContractUtils.sendFolder(tokenId, to);
      setLoading(false);
      return result;
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  }, [isConnected, address]);

  const mergeFolderContents = useCallback(async (fromTokenId: number, toTokenId: number) => {
    if (!isConnected || !address) {
      throw new Error("Wallet not connected");
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await bundlContractUtils.mergeFolderContents(fromTokenId, toTokenId);
      setLoading(false);
      return result;
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  }, [isConnected, address]);

  const getUserFoldersContract = useCallback(async () => {
    if (!isConnected || !address) {
      throw new Error("Wallet not connected");
    }
    
    try {
      return await bundlContractUtils.getUserFolders();
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, [isConnected, address]);

  const createToken = useCallback(async (folderTokenId: number, tokenName: string) => {
    if (!isConnected || !address) {
      throw new Error("Wallet not connected");
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // This is deprecated - use addTokensToFolder for real tokens
      console.warn("createToken is deprecated - use addTokensToFolder for real ERC20 tokens");
      setLoading(false);
      return { success: true, message: "Use addTokensToFolder for real tokens" };
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  }, [isConnected, address]);

  const addTokensToFolder = useCallback(async (tokenId: number, tokenAddress: string, amount: string) => {
    if (!isConnected || !address) {
      throw new Error("Wallet not connected");
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await bundlContractUtils.addTokensToFolder(tokenId, tokenAddress, amount);
      setLoading(false);
      return result;
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  }, [isConnected, address]);

  const transferTokensBetweenFolders = useCallback(async (
    fromTokenId: number, 
    toTokenId: number, 
    tokenAddress: string, 
    amount: string
  ) => {
    if (!isConnected || !address) {
      throw new Error("Wallet not connected");
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await bundlContractUtils.transferTokensBetweenFolders(fromTokenId, toTokenId, tokenAddress, amount);
      setLoading(false);
      return result;
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  }, [isConnected, address]);

  const getFolderWallet = useCallback(async (tokenId: number) => {
    if (!isConnected || !address) {
      throw new Error("Wallet not connected");
    }
    
    try {
      return await bundlContractUtils.getFolderWallet(tokenId);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, [isConnected, address]);

  const getFolderTokenBalance = useCallback(async (tokenId: number, tokenAddress: string) => {
    if (!isConnected || !address) {
      throw new Error("Wallet not connected");
    }
    
    try {
      return await bundlContractUtils.getFolderTokenBalance(tokenId, tokenAddress);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, [isConnected, address]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const createWallet = useCallback(async () => {
    // This functionality is handled by createFolder - each folder creates a wallet
    throw new Error("Use createFolder to create a wallet");
  }, []);

  const getWalletAddress = useCallback(async (tokenId: number) => {
    return await getFolderWallet(tokenId);
  }, [getFolderWallet]);

  return {
    createFolder: createFolderContract,
    getFolders: getUserFoldersContract,
    getUserFolders: getUserFoldersContract,
    sendFolder: sendFolderContract,
    mergeFolderContents,
    createToken,
    createWallet,
    getWalletAddress,
    addTokensToFolder,
    transferTokensBetweenFolders,
    getFolderWallet,
    getFolderTokenBalance,
    connectWallet,
    clearError,
    isConnected,
    address,
    account: { address, isConnected },
    loading,
    error
  };
}

// Default export for compatibility
export default useBundlContracts;
