"use client"

import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, ChevronDown, Play, Star, GitFork } from "lucide-react"

interface HeroSectionProps {
  isLoaded: boolean
}

export default function HeroSection({ isLoaded }: HeroSectionProps) {
  // Animation classes for consistent transitions
  const fadeInUpClasses = (delay: number) => 
    `transition-all duration-1000 delay-${delay} ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`

  return (
    <section className="relative z-10 min-h-screen flex flex-col justify-center py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto w-full">
        {/* Hero Content Container */}
        <div className="text-center space-y-8 lg:space-y-12">

          {/* Main Heading Section */}
          <div className="space-y-6">
            <div className={`relative ${fadeInUpClasses(300)}`}>
              {/* Background glow effect */}
              <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-pulse-custom scale-110" />
              
              {/* Main heading */}
              <h1 className="relative text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight">
                <span className="gradient-text block">Own Your Portfolio.</span>
                <span className="text-primary block mt-2">Trade as NFTs.</span>
              </h1>
            </div>
          </div>
          
          {/* Subtitle Section */}
          <div className="flex justify-center">
            <p className={`text-lg sm:text-xl lg:text-xl text-muted-foreground max-w-4xl leading-relaxed ${fadeInUpClasses(500)}`}>
              Transform your crypto into tradable portfolio NFTs. Bundle, organize, and gift your digital assets like never before with bundl's revolutionary approach to portfolio management.
            </p>
          </div>

          {/* Action Buttons Section */}
          <div className="flex justify-center">
            <div className={`flex flex-col sm:flex-row gap-4 lg:gap-6 items-center ${fadeInUpClasses(700)}`}>
              {/* Primary CTA */}
              <Link href="/dashboard" className="order-1">
                <Button 
                  size="lg" 
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 text-lg font-semibold hover-glow hover:scale-105 transition-all duration-300 shadow-lg"
                >
                  Launch Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              
              {/* Secondary CTAs */}
              <div className="flex flex-col sm:flex-row gap-3 order-2">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="px-6 py-4 text-lg font-medium rounded-xl border-2 border-border hover:border-primary/50 hover:bg-primary/5 hover:scale-105 transition-all duration-300"
                >
                  <Play className="mr-2 h-5 w-5" />
                  Watch Demo
                </Button>
                
                <Link href="https://github.com/imApoorva36/bundl" target="_blank" rel="noopener noreferrer">
                  <Button 
                    variant="ghost" 
                    size="lg" 
                    className="px-6 py-4 text-lg font-medium rounded-xl hover:bg-primary/10 hover:scale-105 transition-all duration-300"
                  >
                    <GitFork className="mr-2 h-5 w-5" />
                    GitHub
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Hero Visual Section */}
          <div className="flex justify-center mt-16 lg:mt-20">
            <div className={`relative max-w-6xl w-full ${fadeInUpClasses(900)}`}>
              {/* Background glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-primary/20 blur-3xl animate-pulse-custom" />
              
              {/* Image container */}
              <div className="relative bg-card/50 border-2 border-border rounded-2xl p-2 backdrop-blur-sm hover:border-primary/30 transition-all duration-500 hover-glow group">
                <div className="overflow-hidden rounded-xl">
                  <Image
                    src="/Screen.png"
                    alt="bundl Portfolio Management Interface"
                    width={1200}
                    height={720}
                    className="w-full h-auto group-hover:scale-105 transition-transform duration-700"
                    priority
                  />
                </div>
              </div>
              
              {/* Additional visual enhancement */}
              <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 w-3/4 h-6 bg-primary/10 blur-xl rounded-full" />
            </div>
          </div>
        </div>

        {/* Scroll Indicator Section */}
        <div className="flex justify-center mt-20 lg:mt-24">
          <div className={`flex flex-col items-center space-y-3 ${fadeInUpClasses(1000)}`}>
            <span className="text-sm text-muted-foreground font-medium tracking-wide">Discover more</span>
            <div className="flex flex-col items-center">
              <ChevronDown className="h-6 w-6 text-primary animate-bounce" />
              <div className="w-px h-8 bg-gradient-to-b from-primary to-transparent mt-2" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
