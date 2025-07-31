import { ethers } from 'ethers';
import { 
  BUNDL_CORE_ABI, 
  BUNDL_EXECUTOR_ABI, 
  BUNDL_REGISTRY_ABI, 
  PREDICATE_ABI 
} from './abis';

export interface FolderCreationResult {
  tokenId: number;
  walletAddress: string;
  transactionHash: string;
}

export interface TransferResult {
  success: boolean;
  transactionHash: string;
}

// Web3 types for ethereum provider
declare global {
  interface Window {
    ethereum?: any;
  }
}

export class BundlContractUtils {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.JsonRpcSigner | null = null;
  
  // Contract addresses - will be loaded from environment variables
  private readonly BUNDL_CORE_ADDRESS: string;
  private readonly BUNDL_REGISTRY_ADDRESS: string;
  private readonly BUNDL_EXECUTOR_ADDRESS: string;
  private readonly PREDICATE_ADDRESS: string;

  constructor() {
    try {
      // Get addresses from environment variables and ensure proper checksum
      this.BUNDL_CORE_ADDRESS = ethers.getAddress(
        process.env.NEXT_PUBLIC_BUNDL_CORE_ADDRESS || '0xE5a0abF0b4b7a12D19DCE4b9E9F65c3E0F12a1e3'
      );
      this.BUNDL_REGISTRY_ADDRESS = ethers.getAddress(
        process.env.NEXT_PUBLIC_BUNDL_REGISTRY_ADDRESS || '0x7a0E35c73b9EE4e4C5A3dB3c7B2b6f8d9b5F3e2A'
      );
      this.BUNDL_EXECUTOR_ADDRESS = ethers.getAddress(
        process.env.NEXT_PUBLIC_BUNDL_EXECUTOR_ADDRESS || '0x2a7b8c9d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b'
      );
      this.PREDICATE_ADDRESS = ethers.getAddress(
        process.env.NEXT_PUBLIC_PREDICATE_ADDRESS || '0x8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c'
      );
      
    } catch (error) {
      throw new Error('Invalid contract address format. Please check your environment variables.');
    }
  }

  private async initializeProvider() {
    if (typeof window !== 'undefined' && window.ethereum) {
      
      // Force MetaMask specifically (not Coinbase)
      let ethereumProvider;
      if (window.ethereum.providers) {
        // Multiple providers - find MetaMask specifically
        const metaMaskProvider = window.ethereum.providers.find((p: any) => p.isMetaMask && !p.isCoinbaseWallet);
        if (metaMaskProvider) {
          ethereumProvider = metaMaskProvider;
        } else {
          throw new Error('MetaMask not found among wallet providers');
        }
      } else if (window.ethereum.isMetaMask && !window.ethereum.isCoinbaseWallet) {
      // Single provider - ensure it's MetaMask
      ethereumProvider = window.ethereum;
    } else {
      throw new Error('MetaMask is required for this application');
    }      this.provider = new ethers.BrowserProvider(ethereumProvider);
      
      // Check and switch to Base Sepolia
      const network = await this.provider.getNetwork();

      const baseSepoliaChainId = 84532;
      if (network.chainId !== BigInt(baseSepoliaChainId)) {
        try {
          await this.provider.send('wallet_switchEthereumChain', [
            { chainId: `0x${baseSepoliaChainId.toString(16)}` } // 0x14a34
          ]);
        } catch (switchError: any) {
          // Chain not added to MetaMask
          if (switchError.code === 4902) {
            await this.provider.send('wallet_addEthereumChain', [
              {
                chainId: `0x${baseSepoliaChainId.toString(16)}`,
                chainName: 'Base Sepolia',
                nativeCurrency: {
                  name: 'Ethereum',
                  symbol: 'ETH',
                  decimals: 18,
                },
                rpcUrls: ['https://sepolia.base.org'],
                blockExplorerUrls: ['https://sepolia-explorer.base.org'],
              },
            ]);
          } else {
            throw switchError;
          }
        }
      }

      this.signer = await this.provider.getSigner();
    }
  }

  async ensureConnection(): Promise<void> {
    if (!this.provider || !this.signer) {
      await this.initializeProvider();
    }
    
    if (!this.provider || !this.signer) {
      throw new Error('No Web3 provider available. Please connect your wallet.');
    }
  }

  private getBundlCoreContract(): ethers.Contract {
    if (!this.signer) {
      throw new Error('Signer not available');
    }
    return new ethers.Contract(this.BUNDL_CORE_ADDRESS, BUNDL_CORE_ABI, this.signer);
  }

  private getBundlRegistryContract(): ethers.Contract {
    if (!this.signer) {
      throw new Error('Signer not available');
    }
    return new ethers.Contract(this.BUNDL_REGISTRY_ADDRESS, BUNDL_REGISTRY_ABI, this.signer);
  }

  private getPredicateContract(): ethers.Contract {
    if (!this.signer) {
      throw new Error('Signer not available');
    }
    return new ethers.Contract(this.PREDICATE_ADDRESS, PREDICATE_ABI, this.signer);
  }

  async connectWallet(): Promise<string> {
    if (!window.ethereum) {
      throw new Error('No wallet found! Please install MetaMask.');
    }

    try {
      
      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      await this.initializeProvider();
      
      if (!this.provider || !this.signer) {
        throw new Error('No provider available');
      }

      const address = await this.signer.getAddress();
      return address;
    } catch (error: any) {
      throw error;
    }
  }

  async getCurrentAccount(): Promise<string | null> {
    try {
      await this.ensureConnection();
      if (!this.signer) return null;
      return await this.signer.getAddress();
    } catch (error) {
      return null;
    }
  }

  async isConnected(): Promise<boolean> {
    try {
      const account = await this.getCurrentAccount();
      return !!account;
    } catch {
      return false;
    }
  }

  async getNetworkId(): Promise<number> {
    await this.ensureConnection();
    if (!this.provider) throw new Error('Provider not available');
    const network = await this.provider.getNetwork();
    return Number(network.chainId);
  }

  // This is the main function that gets called when you click "Create Folder"
  async createFolder(folderName: string): Promise<string> {
    await this.ensureConnection();
    
    try {
      const bundlCore = this.getBundlCoreContract();
      
      // Call the contract's createFolder function with name
      const tx = await bundlCore.createFolder(folderName);

      const receipt = await tx.wait(1);
      
      return receipt.hash;
    } catch (error: any) {
      throw new Error(`Failed to create folder: ${error.message}`);
    }
  }

  async getUserFolders(): Promise<{id: number, name: string, tokenId: number}[]> {
    await this.ensureConnection();
    
    try {
      const bundlCore = this.getBundlCoreContract();
      const currentAccount = await this.getCurrentAccount();
      
      if (!currentAccount) {
        throw new Error('No account connected');
      }
      
      // Get user's folders from contract
      const folderIds = await bundlCore.getUserFolders(currentAccount);
      
      const folders: {id: number, name: string, tokenId: number}[] = [];
      
      // Get detailed info for each folder
      for (const tokenId of folderIds) {
        try {
          const folderInfo = await bundlCore.getFolderInfo(tokenId);
          folders.push({
            id: Number(tokenId),
            name: folderInfo.name || `Folder #${Number(tokenId) + 1}`,
            tokenId: Number(tokenId)
          });
        } catch (error) {
          // Folder might not exist or be inaccessible
          console.warn(`Could not get info for folder ${tokenId}:`, error);
        }
      }
      
      return folders;
    } catch (error: any) {
      throw new Error(`Failed to get user folders: ${error.message}`);
    }
  }

  async sendFolder(tokenId: number, toAddress: string): Promise<TransferResult> {
    await this.ensureConnection();
    
    try {
      const bundlCore = this.getBundlCoreContract();
      const currentAccount = await this.getCurrentAccount();
      
      if (!currentAccount) {
        throw new Error('No account connected');
      }

      // This calls the smart contract transferFrom function
      const tx = await bundlCore.transferFrom(currentAccount, toAddress, tokenId);

      const receipt = await tx.wait(1);
      
      return {
        success: true,
        transactionHash: receipt.hash,
      };
    } catch (error: any) {
      console.error('Error sending folder:', error.message);
      throw new Error(`Failed to send folder: ${error.message}`);
    }
  }

  // Transfer all contents from one folder to another
  async mergeFolderContents(fromTokenId: number, toTokenId: number): Promise<TransferResult> {
    await this.ensureConnection();
    
    try {
      const bundlCore = this.getBundlCoreContract();
      const currentAccount = await this.getCurrentAccount();
      
      if (!currentAccount) {
        throw new Error('No account connected');
      }

      console.log(`Starting merge from folder ${fromTokenId} to folder ${toTokenId}`);

      // Get all tokens in the source folder
      const tokenAddresses = await bundlCore.getFolderTokenAddresses(fromTokenId);
      console.log('Token addresses in source folder:', tokenAddresses);
      
      let transactionHashes: string[] = [];
      
      // Transfer all ERC20 tokens (skip ETH for now as it's more complex)
      for (const tokenAddress of tokenAddresses) {
        if (tokenAddress !== '0x0000000000000000000000000000000000000000') {
          const balance = await bundlCore.getFolderTokenBalance(fromTokenId, tokenAddress);
          console.log(`Token ${tokenAddress} balance: ${balance.toString()}`);
          
          if (balance > 0) {
            console.log(`Transferring ${balance.toString()} of token ${tokenAddress} from folder ${fromTokenId} to folder ${toTokenId}`);
            const tx = await bundlCore.transferTokens(fromTokenId, toTokenId, tokenAddress, balance);
            const receipt = await tx.wait(1);
            transactionHashes.push(receipt.hash);
            console.log(`Token transfer successful, tx: ${receipt.hash}`);
          }
        }
      }
      
      // For ETH, we'll skip it for now since executeFromFolder is causing issues
      // Users can manually withdraw ETH from the source folder and deposit to target folder
      const ethBalance = await bundlCore.getFolderETHBalance(fromTokenId);
      if (ethBalance > 0) {
        console.log(`Note: Folder ${fromTokenId} has ${ethers.formatEther(ethBalance)} ETH that needs to be manually transferred`);
        // TODO: Implement ETH transfer when we figure out the right approach
      }
      
      return {
        success: true,
        transactionHash: transactionHashes.length > 0 ? transactionHashes.join(', ') : 'No tokens to transfer',
      };
    } catch (error: any) {
      console.error('Error merging folder contents:', error.message);
      throw new Error(`Failed to merge folder contents: ${error.message}`);
    }
  }

  // Listen for folder transfer events to update UI
  async listenForFolderTransfers(callback: (tokenId: number, from: string, to: string) => void) {
    await this.ensureConnection();
    
    try {
      const bundlCore = this.getBundlCoreContract();
      
      // Listen for FolderTransferred events
      bundlCore.on('FolderTransferred', (tokenId, from, to, event) => {
        console.log('Folder transferred:', { tokenId: Number(tokenId), from, to });
        callback(Number(tokenId), from, to);
      });
      
    } catch (error) {
      console.error('Error setting up folder transfer listener:', error);
    }
  }

  // Stop listening for events
  async stopListeningForFolderTransfers() {
    try {
      const bundlCore = this.getBundlCoreContract();
      bundlCore.removeAllListeners('FolderTransferred');
    } catch (error) {
      console.error('Error removing folder transfer listeners:', error);
    }
  }

  // Get user's total ETH balance across all folders
  async getUserTotalETHBalance(): Promise<string> {
    await this.ensureConnection();
    
    try {
      const bundlCore = this.getBundlCoreContract();
      const currentAccount = await this.getCurrentAccount();
      
      if (!currentAccount) {
        throw new Error('No account connected');
      }

      const totalBalance = await bundlCore.getUserTotalETHBalance(currentAccount);
      return ethers.formatEther(totalBalance);
    } catch (error: any) {
      console.error('Error getting user total ETH balance:', error.message);
      return '0';
    }
  }

  // Get user's total balance for a specific token across all folders
  async getUserTotalTokenBalance(tokenAddress: string): Promise<string> {
    await this.ensureConnection();
    
    try {
      const bundlCore = this.getBundlCoreContract();
      const currentAccount = await this.getCurrentAccount();
      
      if (!currentAccount) {
        throw new Error('No account connected');
      }

      const totalBalance = await bundlCore.getUserAllTokenBalances(currentAccount, tokenAddress);
      
      // Get token decimals to format properly
      const erc20Abi = ["function decimals() external view returns (uint8)"];
      const tokenContract = new ethers.Contract(tokenAddress, erc20Abi, this.signer);
      const decimals = await tokenContract.decimals();
      
      return ethers.formatUnits(totalBalance, decimals);
    } catch (error: any) {
      console.error('Error getting user total token balance:', error.message);
      return '0';
    }
  }

  // Get all unique tokens across user's folders for portfolio calculation
  async getUserAllTokens(): Promise<{address: string, symbol: string, totalBalance: string, decimals: number}[]> {
    await this.ensureConnection();
    
    try {
      const bundlCore = this.getBundlCoreContract();
      const currentAccount = await this.getCurrentAccount();
      
      if (!currentAccount) {
        throw new Error('No account connected');
      }

      const folderIds = await bundlCore.getUserFolders(currentAccount);
      const uniqueTokens = new Set<string>();
      
      // Collect all unique token addresses
      for (const folderId of folderIds) {
        const tokenAddresses = await bundlCore.getFolderTokenAddresses(folderId);
        tokenAddresses.forEach((addr: string) => uniqueTokens.add(addr));
      }

      const tokens: {address: string, symbol: string, totalBalance: string, decimals: number}[] = [];

      // Get details for each unique token (excluding ETH)
      for (const tokenAddress of uniqueTokens) {
        try {
          // Skip ETH as it's handled separately in portfolio calculation
          if (tokenAddress === '0x0000000000000000000000000000000000000000') {
            continue;
          }
          
          // Handle ERC20 tokens
          const erc20Abi = [
            "function symbol() external view returns (string)",
            "function decimals() external view returns (uint8)"
          ];
          
          const tokenContract = new ethers.Contract(tokenAddress, erc20Abi, this.signer);
          const [symbol, decimals] = await Promise.all([
            tokenContract.symbol().catch(() => 'UNKNOWN'),
            tokenContract.decimals().catch(() => 18)
          ]);
          
          const totalBalance = await this.getUserTotalTokenBalance(tokenAddress);
          
          if (parseFloat(totalBalance) > 0) {
            tokens.push({
              address: tokenAddress,
              symbol,
              totalBalance,
              decimals
            });
          }
        } catch (error) {
          console.error(`Error processing token ${tokenAddress}:`, error);
        }
      }

      return tokens;
    } catch (error: any) {
      console.error('Error getting user all tokens:', error.message);
      return [];
    }
  }

  // Get tokens in a folder by fetching from contract storage
  async getFolderTokens(folderTokenId: number): Promise<any[]> {
    await this.ensureConnection();
    
    try {
      const bundlCore = this.getBundlCoreContract();
      
      // Get all token addresses tracked for this folder
      const tokenAddresses = await bundlCore.getFolderTokenAddresses(folderTokenId);
      
      const tokens: any[] = [];
      
      for (const tokenAddress of tokenAddresses) {
        try {
          if (tokenAddress === '0x0000000000000000000000000000000000000000') {
            // Handle ETH
            const balance = await bundlCore.getFolderETHBalance(folderTokenId);
            if (balance > 0) {
              tokens.push({
                address: tokenAddress,
                symbol: 'ETH',
                name: 'Ethereum',
                decimals: 18,
                totalAmount: balance.toString(),
                type: 'NATIVE'
              });
            }
          } else {
            // Handle ERC20 tokens
            const erc20Abi = [
              "function symbol() external view returns (string)",
              "function name() external view returns (string)",
              "function decimals() external view returns (uint8)"
            ];
            
            const tokenContract = new ethers.Contract(tokenAddress, erc20Abi, this.signer);
            const balance = await bundlCore.getFolderTokenBalance(folderTokenId, tokenAddress);
            
            if (balance > 0) {
              const [symbol, name, decimals] = await Promise.all([
                tokenContract.symbol().catch(() => 'UNKNOWN'),
                tokenContract.name().catch(() => 'Unknown Token'),
                tokenContract.decimals().catch(() => 18)
              ]);
              
              tokens.push({
                address: tokenAddress,
                symbol,
                name,
                decimals,
                totalAmount: balance.toString(),
                type: 'ERC20'
              });
            }
          }
        } catch (error) {
          console.error(`Error fetching data for token ${tokenAddress}:`, error);
        }
      }
      
      return tokens;
    } catch (error) {
      console.error('Error fetching folder tokens:', error);
      throw error;
    }
  }

  // Alternative method: Get folder token balances for known tokens
  async getFolderTokenBalances(folderTokenId: number, knownTokenAddresses: string[]): Promise<any[]> {
    await this.ensureConnection();
    
    try {
      const folderWallet = await this.getFolderWallet(folderTokenId);
      const tokens: any[] = [];
      
      // Check ETH balance
      try {
        const ethBalance = await this.provider!.getBalance(folderWallet);
        if (ethBalance > 0) {
          tokens.push({
            address: 'ETH',
            symbol: 'ETH',
            name: 'Ethereum',
            decimals: 18,
            totalAmount: ethBalance.toString(),
            type: 'NATIVE'
          });
        }
      } catch (ethError) {
        console.warn('Failed to get ETH balance:', ethError);
      }
      
      // Check ERC20 token balances
      for (const tokenAddress of knownTokenAddresses) {
        try {
          const erc20Abi = [
            "function balanceOf(address account) external view returns (uint256)",
            "function symbol() external view returns (string)",
            "function name() external view returns (string)",
            "function decimals() external view returns (uint8)"
          ];
          
          const tokenContract = new ethers.Contract(tokenAddress, erc20Abi, this.signer);
          const balance = await tokenContract.balanceOf(folderWallet);
          
          if (balance > 0) {
            const [symbol, name, decimals] = await Promise.all([
              tokenContract.symbol().catch(() => 'UNKNOWN'),
              tokenContract.name().catch(() => 'Unknown Token'),
              tokenContract.decimals().catch(() => 18)
            ]);
            
            tokens.push({
              address: tokenAddress,
              symbol,
              name,
              decimals,
              totalAmount: balance.toString(),
              type: 'ERC20'
            });
          }
        } catch (tokenError) {
          console.warn(`Failed to check balance for token ${tokenAddress}:`, tokenError);
        }
      }
      
      return tokens;
    } catch (error) {
      console.error('Error checking folder token balances:', error);
      return [];
    }
  }
  async getFolderWallet(tokenId: number): Promise<string> {
    await this.ensureConnection();
    
    try {
      const bundlCore = this.getBundlCoreContract();
      
      const walletAddress = await bundlCore.getWallet(tokenId);
      
      // Check if walletAddress is valid before normalizing
      if (!walletAddress) {
        throw new Error(`No wallet address returned for token ID ${tokenId}`);
      }
      
      // Check if it's a valid address format (starts with 0x and has 42 characters)
      if (typeof walletAddress !== 'string' || !walletAddress.startsWith('0x') || walletAddress.length !== 42) {
        throw new Error(`Invalid wallet address format: ${walletAddress}`);
      }
      
      // Only normalize if it looks like a valid address
      try {
        const normalizedWalletAddress = ethers.getAddress(walletAddress);
        return normalizedWalletAddress;
      } catch (addressError) {
        // Return the raw address if normalization fails
        return walletAddress;
      }
    } catch (error: any) {
      throw new Error(`Failed to get folder wallet: ${error.message}`);
    }
  }

  // Transfer ERC20 tokens to a folder using the BundlCore contract
  async addTokensToFolder(tokenId: number, tokenAddress: string, amount: string): Promise<string> {
    await this.ensureConnection();
    
    try {
      const bundlCore = this.getBundlCoreContract();
      const normalizedTokenAddress = ethers.getAddress(tokenAddress);
      
      // Create ERC20 contract instance to get decimals and validate
      const erc20Abi = [
        "function approve(address spender, uint256 amount) external returns (bool)",
        "function balanceOf(address account) external view returns (uint256)",
        "function decimals() external view returns (uint8)",
        "function symbol() external view returns (string)"
      ];
      
      const tokenContract = new ethers.Contract(normalizedTokenAddress, erc20Abi, this.signer);
      
      // Get token info
      const decimals = await tokenContract.decimals();
      const symbol = await tokenContract.symbol();
      const amountWei = ethers.parseUnits(amount, decimals);
      
      // Check user balance
      const userBalance = await tokenContract.balanceOf(this.signer!.address);
      if (userBalance < amountWei) {
        const userBalanceFormatted = ethers.formatUnits(userBalance, decimals);
        throw new Error(`Insufficient ${symbol} balance. You have ${userBalanceFormatted} ${symbol}, but trying to transfer ${amount} ${symbol}`);
      }
      
      // Step 1: Approve the BundlCore contract to spend tokens
      const approveTx = await tokenContract.approve(this.BUNDL_CORE_ADDRESS, amountWei);
      await approveTx.wait(1);
      
      // Step 2: Call addTokensToFolder on the contract
      const tx = await bundlCore.addTokensToFolder(tokenId, normalizedTokenAddress, amountWei);
      
      const receipt = await tx.wait(1);
      
      return receipt.hash;
    } catch (error: any) {
      console.error('Error adding tokens:', error.message);
      throw new Error(`Failed to add tokens to folder: ${error.message}`);
    }
  }

  // Transfer native ETH to a folder using the BundlCore contract
  async addNativeETHToFolder(tokenId: number, amount: string): Promise<string> {
    await this.ensureConnection();
    
    try {
      const bundlCore = this.getBundlCoreContract();
      const amountWei = ethers.parseEther(amount);
      
      // Check user's ETH balance
      const userBalance = await this.provider!.getBalance(this.signer!.address);
      if (userBalance < amountWei) {
        const userBalanceFormatted = ethers.formatEther(userBalance);
        throw new Error(`Insufficient ETH balance. You have ${userBalanceFormatted} ETH, but trying to transfer ${amount} ETH`);
      }
      
      // Call addETHToFolder on the contract
      const tx = await bundlCore.addETHToFolder(tokenId, { value: amountWei });
      
      const receipt = await tx.wait(1);
      
      return receipt.hash;
    } catch (error: any) {
      console.error('Error adding ETH:', error.message);
      throw new Error(`Failed to add ETH to folder: ${error.message}`);
    }
  }

  // Transfer tokens between folders using the contract
  async transferTokensBetweenFolders(
    fromTokenId: number, 
    toTokenId: number, 
    tokenAddress: string, 
    amount: string
  ): Promise<string> {
    await this.ensureConnection();
    
    try {
      const bundlCore = this.getBundlCoreContract();
      
      // Create ERC20 contract instance to get decimals
      const erc20Abi = ["function decimals() external view returns (uint8)", "function symbol() external view returns (string)"];
      const tokenContract = new ethers.Contract(tokenAddress, erc20Abi, this.signer);
      const decimals = await tokenContract.decimals();
      const symbol = await tokenContract.symbol();
      const amountWei = ethers.parseUnits(amount, decimals);
      
      // Use the contract's transferTokens function
      const tx = await bundlCore.transferTokens(fromTokenId, toTokenId, tokenAddress, amountWei);
      console.log('📝 Transfer tx:', tx.hash);

      const receipt = await tx.wait(1);
      console.log('✅ Tokens transferred - Gas used:', receipt?.gasUsed?.toString());
      
      return receipt.hash;
    } catch (error: any) {
      console.error('❌ Error transferring tokens:', error.message);
      throw new Error(`Failed to transfer tokens: ${error.message}`);
    }
  }

  // Get ERC20 token balance in a folder's wallet
  async getFolderTokenBalance(tokenId: number, tokenAddress: string): Promise<string> {
    await this.ensureConnection();
    
    try {
      // Get the folder's wallet address
      const folderWallet = await this.getFolderWallet(tokenId);
      
      // Create ERC20 contract instance
      const erc20Abi = [
        "function balanceOf(address account) external view returns (uint256)",
        "function decimals() external view returns (uint8)"
      ];
      
      const tokenContract = new ethers.Contract(tokenAddress, erc20Abi, this.signer);
      
      // Get balance and decimals
      const balance = await tokenContract.balanceOf(folderWallet);
      const decimals = await tokenContract.decimals();
      
      // Convert to human readable format
      const formattedBalance = ethers.formatUnits(balance, decimals);
      
      return formattedBalance;
    } catch (error: any) {
      return '0';
    }
  }

  // Get ERC20 token balance using contract function (RECOMMENDED)
  async getFolderTokenBalanceViaContract(tokenId: number, tokenAddress: string): Promise<string> {
    await this.ensureConnection();
    
    try {
      const bundlCore = this.getBundlCoreContract();
      const balance = await bundlCore.getFolderTokenBalance(tokenId, tokenAddress);
      
      // Get token decimals to format the balance
      const erc20Abi = ["function decimals() external view returns (uint8)"];
      const tokenContract = new ethers.Contract(tokenAddress, erc20Abi, this.signer);
      const decimals = await tokenContract.decimals();
      
      return ethers.formatUnits(balance, decimals);
    } catch (error: any) {
      return '0';
    }
  }

  // Get native ETH balance using contract function (RECOMMENDED)
  async getFolderETHBalanceViaContract(tokenId: number): Promise<string> {
    await this.ensureConnection();
    
    try {
      const bundlCore = this.getBundlCoreContract();
      const balance = await bundlCore.getFolderETHBalance(tokenId);
      
      return ethers.formatEther(balance);
    } catch (error: any) {
      return '0';
    }
  }
}

// Create a singleton instance
export const bundlContractUtils = new BundlContractUtils();
