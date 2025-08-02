"use client"

import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Menu, X } from "lucide-react"
import { useState } from "react"

interface NavigationProps {
  isLoaded: boolean
}

export default function Navigation({ isLoaded }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navigationItems = [
    { href: "#features", label: "Features" },
    { href: "#innovation", label: "Innovation" },
    { href: "https://github.com/imApoorva36/bundl", label: "GitHub", external: true },
  ]

  return (
    <nav className={`relative z-10 border-b border-border/50 backdrop-blur-sm transition-all duration-1000 ${isLoaded ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Image
              src="/bundl3.png"
              alt="bundl"
              width={120}
              height={40}
              className="h-14 w-auto hover:scale-105 transition-transform duration-300"
            />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-muted-foreground hover:text-primary transition-colors duration-300 font-medium"
                {...(item.external && { target: "_blank", rel: "noopener noreferrer" })}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Desktop Action Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/dashboard">
              <Button className="text-muted-foreground hover:text-foreground transition-colors duration-300">
                Launch App
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-md hover:bg-muted/50 transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-background/95 backdrop-blur-sm border-b border-border/50 py-4">
            <div className="flex flex-col space-y-4 px-4">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-muted-foreground hover:text-foreground transition-colors duration-300 font-medium py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                  {...(item.external && { target: "_blank", rel: "noopener noreferrer" })}
                >
                  {item.label}
                </Link>
              ))}
              <div className="flex flex-col space-y-2 pt-4 border-t border-border/50">
                <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button className="w-full justify-start">
                    Launch App
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
