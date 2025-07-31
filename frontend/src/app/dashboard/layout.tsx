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
      <div className="h-screen flex overflow-hidden">
        <FileSystemSidebar className="hidden lg:flex" />
        <div className="flex-1 flex min-w-0">
          {children}
        </div>
      </div>
    </TokenOrganizerProvider>
  )
}
