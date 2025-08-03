"use client"

import Image from "next/image"
import { Sparkles, Target, Clock, BarChart3, RefreshCw, Shield, Code, Zap } from "lucide-react"

const innovations = [
  {
    title: "Custom Predicate for Scheduled Operations",
    description: "Time-based swap execution, conditional portfolio transfers, and automated strategy triggers with bot-driven execution monitoring.",
    features: ["Scheduled portfolio swaps", "Time-based conditions", "Multi-step coordination", "Bot monitoring"]
  },
  {
    title: "ERC721Proxy Integration",
    description: "Revolutionary NFT portfolio transfers via 1inch Limit Order Protocol, enabling seamless portfolio trading through limit order infrastructure.",
    features: ["NFT transfers via LOP", "Portfolio trading", "Cross-protocol compatibility", "Secure mechanisms"]
  },
  {
    title: "Maker Asset Suffix Security",
    description: "Advanced security ensuring only intended recipients can claim portfolio NFTs, with anti-MEV protection and permission-based transfers.",
    features: ["Recipient validation", "Anti-MEV protection", "Secure gifting", "Access control"]
  }
]

export default function InnovationSection() {
  return (
    <section id="innovation" className="relative z-10 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center px-4 py-2 bg-primary/10 rounded-full mb-6 animate-pulse-custom">
            <Sparkles className="h-4 w-4 text-primary mr-2" />
            <span className="text-primary font-medium">1inch LOP Extensions</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold mb-6 gradient-text">
            Extending the Limit Order Protocol
          </h2>
          <p className="text-xl text-muted-foreground max-w-4xl mx-auto">
            bundl extends the 1inch Limit Order Protocol with novel NFT portfolio transfer mechanisms, custom predicates for scheduled operations, 
            and comprehensive API integration that revolutionizes how users manage and trade crypto portfolios.
          </p>
        </div>

        {/* Main Innovation Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
          {/* Left Column - Innovation Details */}
          <div className="space-y-10">
            {innovations.map((innovation, index) => (
              <div 
                key={innovation.title}
                className="border-l-4 border-primary pl-8 animate-slideInLeft"
                style={{animationDelay: `${index * 0.2}s`}}
              >
                <h3 className="text-2xl font-semibold mb-4 text-foreground">
                  {innovation.title}
                </h3>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  {innovation.description}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {innovation.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center space-x-2">
                      <Zap className="h-3 w-3 text-primary flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Right Column - Visual */}
          <div className="relative animate-float">
            <div className="relative bg-card border border-border rounded-2xl hover-glow hover:border-primary/30 transition-all duration-500">
              <Image
                src="/Diagram.jpeg"
                alt="Diagram of bundl's Innovations"
                width={600}
                height={400}
                className="w-full h-auto rounded-xl mb-4"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
