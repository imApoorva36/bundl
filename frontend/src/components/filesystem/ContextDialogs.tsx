'use client';

import React, { useState } from 'react';
import { OrganizationItem } from '@/types/filesystem';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CreateFolderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (name: string) => void;
  loading?: boolean;
}

export function CreateFolderDialog({ 
  open, 
  onOpenChange, 
  onConfirm, 
  loading = false 
}: CreateFolderDialogProps) {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onConfirm(name.trim());
      setName('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Folder</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid w-full items-center gap-1.5 mb-4">
            <Label htmlFor="folder-name">Folder Name</Label>
            <Input
              id="folder-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter folder name..."
              disabled={loading}
            />
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!name.trim() || loading}
            >
              {loading ? 'Creating...' : 'Create Folder'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: OrganizationItem | null;
  onConfirm: () => void;
  loading?: boolean;
}

export function DeleteConfirmDialog({ 
  open, 
  onOpenChange, 
  item, 
  onConfirm, 
  loading = false 
}: DeleteConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Delete</DialogTitle>
        </DialogHeader>
        <p>
          Are you sure you want to delete "{item?.name}"? This action cannot be undone.
        </p>
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface RenameDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: OrganizationItem | null;
  onConfirm: (newName: string) => void;
  loading?: boolean;
}

export function RenameDialog({ 
  open, 
  onOpenChange, 
  item, 
  onConfirm, 
  loading = false 
}: RenameDialogProps) {
  const [name, setName] = useState(item?.name || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && name.trim() !== item?.name) {
      onConfirm(name.trim());
      setName('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename {item?.type === 'folder' ? 'Folder' : 'File'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid w-full items-center gap-1.5 mb-4">
            <Label htmlFor="new-name">New Name</Label>
            <Input
              id="new-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={`Enter new ${item?.type === 'folder' ? 'folder' : 'file'} name...`}
              disabled={loading}
            />
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!name.trim() || name.trim() === item?.name || loading}
            >
              {loading ? 'Renaming...' : 'Rename'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface SendFolderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  folder: OrganizationItem | null;
  onConfirm: (toAddress: string) => void;
  loading?: boolean;
}

export function SendFolderDialog({ 
  open, 
  onOpenChange, 
  folder, 
  onConfirm, 
  loading = false 
}: SendFolderDialogProps) {
  const [toAddress, setToAddress] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (toAddress.trim()) {
      onConfirm(toAddress.trim());
      setToAddress('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send Folder</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-4">
              Send folder "{folder?.name}" to another address
            </p>
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="to-address">Recipient Address</Label>
              <Input
                id="to-address"
                value={toAddress}
                onChange={(e) => setToAddress(e.target.value)}
                placeholder="0x..."
                disabled={loading}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!toAddress.trim() || loading}
            >
              {loading ? 'Sending...' : 'Send Folder'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface CreateTokenDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (tokenData: {
    type: 'existing' | 'tracked';
    assetType?: 'erc20' | 'native';
    name: string;
    symbol?: string;
    address?: string;
    amount?: string;
  }) => void;
  loading?: boolean;
  folder?: OrganizationItem | null;
}

export function CreateTokenDialog({ 
  open, 
  onOpenChange, 
  onConfirm, 
  loading = false,
  folder
}: CreateTokenDialogProps) {
  const [tokenType, setTokenType] = useState<'existing' | 'tracked'>('existing');
  const [assetType, setAssetType] = useState<'erc20' | 'native'>('erc20');
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState('');

  // Auto-populate fields when asset type changes
  React.useEffect(() => {
    if (tokenType === 'existing' && assetType === 'native') {
      setName('Ethereum');
      setSymbol('ETH');
      setAddress(''); // Native ETH doesn't have a contract address
    } else if (tokenType === 'existing' && assetType === 'erc20') {
      // Clear fields for manual entry
      if (name === 'Ethereum') {
        setName('');
        setSymbol('');
      }
    }
  }, [assetType, tokenType, name]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!name.trim()) {
      alert('Please enter a token name');
      return;
    }
    
    if (tokenType === 'existing') {
      if (assetType === 'erc20' && !['0x036CbD53842c5426634e7929541eC2318f3dCF7e', '0x4200000000000000000000000000000000000006'].includes(address)) {
        if (!address.trim()) {
          alert('Please enter a contract address for custom ERC20 tokens');
          return;
        }
        
        // Basic address validation
        if (!address.trim().startsWith('0x') || address.trim().length !== 42) {
          alert('Please enter a valid Ethereum address (42 characters starting with 0x)');
          return;
        }
      }
      
      if (!amount.trim()) {
        alert('Please enter an amount');
        return;
      }
      
      // Basic amount validation
      if (isNaN(parseFloat(amount.trim())) || parseFloat(amount.trim()) <= 0) {
        alert('Please enter a valid positive amount');
        return;
      }
    }
    
    onConfirm({
      type: tokenType,
      assetType: assetType,
      name: name.trim(),
      symbol: symbol.trim() || undefined,
      address: assetType === 'erc20' ? address.trim() || undefined : undefined,
      amount: amount.trim() || undefined,
    });
    
    // Reset form
    setName('');
    setSymbol('');
    setAddress('');
    setAmount('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Token{folder ? ` to "${folder.name}"` : ''}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Token Type Selection */}
            <div className="grid w-full items-center gap-2">
              <Label>Action</Label>
              <div className="flex space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    value="existing"
                    checked={tokenType === 'existing'}
                    onChange={(e) => setTokenType(e.target.value as 'existing')}
                    disabled={loading}
                  />
                  <span className="text-sm">Transfer Token</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    value="tracked"
                    checked={tokenType === 'tracked'}
                    onChange={(e) => setTokenType(e.target.value as 'tracked')}
                    disabled={loading}
                  />
                  <span className="text-sm">Track Token</span>
                </label>
              </div>
            </div>

            {/* Token Selection for Transfer */}
            {tokenType === 'existing' && (
              <div className="grid w-full items-center gap-2">
                <Label>Select Token</Label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-3 p-2 border rounded cursor-pointer">
                    <input
                      type="radio"
                      value="native"
                      checked={assetType === 'native'}
                      onChange={(e) => setAssetType(e.target.value as 'native')}
                      disabled={loading}
                    />
                    <span className="text-sm">Ethereum (ETH) - Native</span>
                  </label>
                  
                  <label className="flex items-center space-x-3 p-2 border rounded cursor-pointer">
                    <input
                      type="radio"
                      value="erc20"
                      checked={assetType === 'erc20' && address === '0x036CbD53842c5426634e7929541eC2318f3dCF7e'}
                      onChange={() => {
                        setAssetType('erc20');
                        setAddress('0x036CbD53842c5426634e7929541eC2318f3dCF7e');
                        setName('USD Coin');
                        setSymbol('USDC');
                      }}
                      disabled={loading}
                    />
                    <span className="text-sm">USD Coin (USDC)</span>
                  </label>

                  <label className="flex items-center space-x-3 p-2 border rounded cursor-pointer">
                    <input
                      type="radio"
                      value="erc20"
                      checked={assetType === 'erc20' && address === '0x4200000000000000000000000000000000000006'}
                      onChange={() => {
                        setAssetType('erc20');
                        setAddress('0x4200000000000000000000000000000000000006');
                        setName('Wrapped Ether');
                        setSymbol('WETH');
                      }}
                      disabled={loading}
                    />
                    <span className="text-sm">Wrapped Ether (WETH)</span>
                  </label>

                  <label className="flex items-center space-x-3 p-2 border rounded cursor-pointer">
                    <input
                      type="radio"
                      value="erc20"
                      checked={assetType === 'erc20' && !['0x036CbD53842c5426634e7929541eC2318f3dCF7e', '0x4200000000000000000000000000000000000006'].includes(address)}
                      onChange={() => {
                        setAssetType('erc20');
                        setAddress('');
                        setName('');
                        setSymbol('');
                      }}
                      disabled={loading}
                    />
                    <span className="text-sm">Custom ERC20 Token</span>
                  </label>
                </div>
              </div>
            )}

            {/* Token Name */}
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="token-name">Token Name</Label>
              <Input
                id="token-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={
                  tokenType === 'existing' 
                    ? (assetType === 'native' ? "Ethereum" : "Token name")
                    : "e.g., My Custom Token"
                }
                disabled={loading || (tokenType === 'existing' && assetType === 'native')}
                required
              />
            </div>

            {/* Token Symbol */}
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="token-symbol">Symbol</Label>
              <Input
                id="token-symbol"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                placeholder={
                  tokenType === 'existing'
                    ? (assetType === 'native' ? "ETH" : "e.g., USDC")
                    : "e.g., MCT"
                }
                disabled={loading || (tokenType === 'existing' && assetType === 'native')}
              />
            </div>

            {/* Custom Contract Address - only show for custom ERC20 */}
            {tokenType === 'existing' && assetType === 'erc20' && !['0x036CbD53842c5426634e7929541eC2318f3dCF7e', '0x4200000000000000000000000000000000000006'].includes(address) && (
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="token-address">Contract Address</Label>
                <Input
                  id="token-address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="0x..."
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground">
                  Enter the ERC20 contract address on Base Sepolia
                </p>
              </div>
            )}

            {/* Amount - only for transfers */}
            {tokenType === 'existing' && (
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="token-amount">Amount</Label>
                <Input
                  id="token-amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.001"
                  type="number"
                  step="any"
                  disabled={loading}
                />
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setAmount('0.001')}
                    className="px-2 py-1 text-xs border rounded"
                  >
                    0.001
                  </button>
                  <button
                    type="button"
                    onClick={() => setAmount('0.01')}
                    className="px-2 py-1 text-xs border rounded"
                  >
                    0.01
                  </button>
                  <button
                    type="button"
                    onClick={() => setAmount('0.1')}
                    className="px-2 py-1 text-xs border rounded"
                  >
                    0.1
                  </button>
                </div>
              </div>
            )}

            {tokenType === 'tracked' && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-xs text-blue-700">
                  This will create a tracked token entry for organizational purposes. 
                  No blockchain transaction will be made.
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="mt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={
                !name.trim() || 
                loading || 
                (tokenType === 'existing' && (
                  (assetType === 'erc20' && !['0x036CbD53842c5426634e7929541eC2318f3dCF7e', '0x4200000000000000000000000000000000000006'].includes(address) && !address.trim()) || 
                  !amount.trim()
                ))
              }
            >
              {loading ? 'Adding...' : tokenType === 'existing' ? 'Transfer Token' : 'Track Token'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
