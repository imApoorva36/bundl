"use client"

import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"

export default function Home() {



  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-background to-background via-primary/30">
      <div className="text-center">
        <Image
          src="/bundl3.png"
          alt="Logo"
          width={450}
          height={150}
          className="mx-auto mb-4"
        />
        <Link href="/dashboard">
          <Button>
            Go to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  )
}
