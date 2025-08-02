"use client"

import BackgroundEffects from "@/components/landing/BackgroundEffects"
import CTASection from "@/components/landing/CTASection"
import FeaturesSection from "@/components/landing/FeaturesSection"
import HeroSection from "@/components/landing/HeroSection"
import InnovationSection from "@/components/landing/InnovationSection"
import Navigation from "@/components/landing/Navigation"
import { useEffect, useState } from "react"

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      <BackgroundEffects isLoaded={isLoaded} />
      <Navigation isLoaded={isLoaded} />
      <HeroSection isLoaded={isLoaded} />
      <FeaturesSection />
      <InnovationSection />
      <CTASection />
    </div>
  )
}
