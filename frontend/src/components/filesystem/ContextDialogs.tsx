"use client"

import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Folder, Send } from 'lucide-react'

interface CreateFolderDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (name: string) => void
}

export function CreateFolderDialog({ isOpen, onClose, onConfirm }: CreateFolderDialogProps) {
  const [folderName, setFolderName] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (folderName.trim()) {
      onConfirm(folderName.trim())
      setFolderName('')
      onClose()
    }
  }

  const handleClose = () => {
    setFolderName('')
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Folder className="h-5 w-5 text-primary" />
            Create New Folder
          </DialogTitle>
          <DialogDescription>
            Enter a name for your new folder. This will help you organize your tokens.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="folder-name" className="text-right">
                Name
              </Label>
              <Input
                id="folder-name"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                placeholder="e.g., DeFi Tokens, Stablecoins..."
                className="col-span-3"
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!folderName.trim()}>
              Create Folder
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

interface SendFolderDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (address: string) => void
  folderName: string
}

export function SendFolderDialog({ isOpen, onClose, onConfirm, folderName }: SendFolderDialogProps) {
  const [address, setAddress] = useState('')
  const [isValidAddress, setIsValidAddress] = useState(false)

  const validateAddress = (addr: string) => {
    // Basic Ethereum address validation
    const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/
    return ethAddressRegex.test(addr)
  }

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAddress = e.target.value
    setAddress(newAddress)
    setIsValidAddress(validateAddress(newAddress))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isValidAddress) {
      onConfirm(address)
      setAddress('')
      onClose()
    }
  }

  const handleClose = () => {
    setAddress('')
    setIsValidAddress(false)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5 text-primary" />
            Send Folder: {folderName}
          </DialogTitle>
          <DialogDescription>
            Enter the recipient's wallet address to send this folder and all its tokens.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="wallet-address" className="text-right">
                Address
              </Label>
              <Input
                id="wallet-address"
                value={address}
                onChange={handleAddressChange}
                placeholder="0x..."
                className="col-span-3"
                autoFocus
              />
            </div>
            {address && !isValidAddress && (
              <p className="text-sm text-destructive mt-1">
                Please enter a valid Ethereum address
              </p>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!isValidAddress}>
              Send Folder
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
