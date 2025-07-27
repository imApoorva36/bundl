"use client"

import { TokenOrganizerProvider } from '@/contexts/FileSystemContext'
import { FileSystemSidebar } from '@/components/filesystem/FileSystemSidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <TokenOrganizerProvider>
      <div className="h-screen flex">
        <FileSystemSidebar />
        <div className="flex-1 flex">
          {children}
        </div>
      </div>
    </TokenOrganizerProvider>
  )
}
