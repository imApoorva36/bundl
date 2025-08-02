"use client"

import { useMemo } from "react"

interface BackgroundEffectsProps {
  isLoaded: boolean
}

export default function BackgroundEffects({ isLoaded }: BackgroundEffectsProps) {
  // Generate consistent particle positions using useMemo for performance
  const particlePositions = useMemo(() => [
    { x: "15%", y: "20%", size: "w-2 h-2", opacity: "bg-primary/25", delay: "0s" },
    { x: "75%", y: "25%", size: "w-1 h-1", opacity: "bg-primary/20", delay: "1.5s" },
    { x: "35%", y: "65%", size: "w-1.5 h-1.5", opacity: "bg-primary/30", delay: "3s" },
    { x: "85%", y: "45%", size: "w-1 h-1", opacity: "bg-primary/15", delay: "4.5s" },
    { x: "65%", y: "75%", size: "w-1.5 h-1.5", opacity: "bg-primary/25", delay: "6s" },
    { x: "25%", y: "45%", size: "w-0.5 h-0.5", opacity: "bg-primary/35", delay: "7.5s" },
    { x: "55%", y: "15%", size: "w-1 h-1", opacity: "bg-primary/20", delay: "9s" },
    { x: "10%", y: "70%", size: "w-1.5 h-1.5", opacity: "bg-primary/25", delay: "10.5s" },
  ], [])

  return (
    <div className={`fixed inset-0 pointer-events-none transition-opacity duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
      {/* Enhanced Animated Dither Background Pattern */}
      <div className="absolute inset-0 opacity-[0.04]">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" className="mix-blend-overlay">
          <defs>
            <pattern id="dither-primary" x="0" y="0" width="6" height="6" patternUnits="userSpaceOnUse">
              <rect width="1" height="1" fill="currentColor" className="animate-pulse-custom" />
              <rect x="3" y="3" width="1" height="1" fill="currentColor" className="animate-pulse-custom" style={{animationDelay: "1s"}} />
              <rect x="1" y="4" width="1" height="1" fill="currentColor" className="animate-pulse-custom" style={{animationDelay: "2s"}} />
              <rect x="4" y="1" width="1" height="1" fill="currentColor" className="animate-pulse-custom" style={{animationDelay: "3s"}} />
            </pattern>
            <pattern id="dither-secondary" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
              <rect x="2" y="2" width="1" height="1" fill="currentColor" className="animate-pulse-custom opacity-60" style={{animationDelay: "0.5s"}} />
              <rect x="6" y="6" width="1" height="1" fill="currentColor" className="animate-pulse-custom opacity-60" style={{animationDelay: "1.5s"}} />
              <rect x="1" y="6" width="1" height="1" fill="currentColor" className="animate-pulse-custom opacity-60" style={{animationDelay: "2.5s"}} />
              <rect x="5" y="2" width="1" height="1" fill="currentColor" className="animate-pulse-custom opacity-60" style={{animationDelay: "3.5s"}} />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dither-primary)" />
          <rect width="100%" height="100%" fill="url(#dither-secondary)" opacity="0.5" />
        </svg>
      </div>

      {/* Coordinated Floating Particles */}
      <div className="absolute inset-0">
        {particlePositions.map((particle, index) => (
          <div
            key={index}
            className={`absolute ${particle.size} ${particle.opacity} rounded-full animate-float blur-[0.5px]`}
            style={{
              left: particle.x,
              top: particle.y,
              animationDelay: particle.delay,
              animationDuration: `${6 + (index % 3)}s`,
            }}
          />
        ))}
      </div>



      {/* Subtle Radial Gradient Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(20, 130, 77, 0.3) 0%, transparent 70%)'
        }}
      />

      {/* Dynamic Corner Accents */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-primary/[0.03] rounded-full blur-2xl animate-float" style={{animationDelay: "2s", animationDuration: "7s"}} />
      <div className="absolute top-0 right-0 w-24 h-24 bg-primary/[0.04] rounded-full blur-2xl animate-float" style={{animationDelay: "5s", animationDuration: "9s"}} />
      <div className="absolute bottom-0 left-0 w-28 h-28 bg-primary/[0.03] rounded-full blur-2xl animate-float" style={{animationDelay: "8s", animationDuration: "6s"}} />
      <div className="absolute bottom-0 right-0 w-20 h-20 bg-primary/[0.05] rounded-full blur-2xl animate-float" style={{animationDelay: "11s", animationDuration: "8s"}} />
    </div>
  )
}
