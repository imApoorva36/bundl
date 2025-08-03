"use client"

import { Folder, Gift, Zap, Shield, TrendingUp, Users, Wallet, Bot, Lock, Globe } from "lucide-react"

const features = [
  {
    icon: Folder,
    title: "Portfolio NFTs",
    description: "Create folders as ERC-721 NFTs with unique wallet addresses. Bundle multiple assets into tradable containers with complete ownership control.",
    benefits: ["Unique wallet addresses", "ERC-721 standard", "Multi-asset bundling"],
    delay: "0s"
  },
  {
    icon: Zap,
    title: "1inch LOP Extensions",
    description: "Custom predicates for scheduled swaps, ERC721Proxy for NFT transfers via limit orders, and maker asset suffix for secure recipient validation.",
    benefits: ["Custom predicates", "ERC721Proxy integration", "Secure transfers"],
    delay: "0.1s"
  },
  {
    icon: Gift,
    title: "Secure Portfolio Gifting",
    description: "Send entire portfolio collections as NFT gifts with maker asset suffix ensuring only intended recipients can claim your curated bundles.",
    benefits: ["Secure gifting", "Portfolio sharing", "Anti-MEV protection"],
    delay: "0.2s"
  },
  {
    icon: Shield,
    title: "Automated Execution",
    description: "Django-powered orderbook backend with intelligent bot system that monitors conditions and executes scheduled portfolio operations.",
    benefits: ["Order management", "Bot execution", "Real-time monitoring"],
    delay: "0.3s"
  },
  {
    icon: Wallet,
    title: "Token-Bound Portfolios",
    description: "Each portfolio NFT has its own wallet address, enabling direct asset transfers and seamless integration with DeFi protocols.",
    benefits: ["Token-bound accounts", "Direct transfers", "DeFi integration"],
    delay: "0.6s"
  },
  {
    icon: Bot,
    title: "Comprehensive 1inch APIs",
    description: "Full integration with 1inch swap, price feeds, and balance APIs for optimal routing and real-time portfolio valuation.",
    benefits: ["Swap integration", "Price feeds", "Balance tracking"],
    delay: "0.7s"
  }
]

export default function FeaturesSection() {
  return (
    <section id="features" className="relative z-10 py-24 px-4 sm:px-6 lg:px-8 bg-muted/20">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center px-4 py-2 bg-primary/10 rounded-full mb-6">
            <Globe className="h-4 w-4 text-primary mr-2" />
            <span className="text-primary font-medium">Revolutionary Features</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold mb-6 gradient-text">
            Portfolio Management Reimagined
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Experience the future of crypto portfolio management with our comprehensive suite of innovative features designed for both individual investors and institutions.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon
            return (
              <div 
                key={feature.title}
                className="group p-8 bg-card border border-border rounded-2xl hover:border-primary/50 transition-all duration-500 hover:scale-105 hover-glow animate-fadeInUp"
                style={{animationDelay: feature.delay}}
              >
                <div className="mb-6">
                  <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors duration-300">
                    <IconComponent className="h-7 w-7 text-primary group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground mb-4 leading-relaxed">
                    {feature.description}
                  </p>
                  
                  {/* Feature Benefits */}
                  <div className="space-y-2">
                    {feature.benefits.map((benefit, benefitIndex) => (
                      <div key={benefitIndex} className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                        <span className="text-sm text-muted-foreground">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
