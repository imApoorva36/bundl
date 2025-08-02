"use client"

import Image from "next/image"
import { Sparkles, Target, Clock, BarChart3, RefreshCw, Shield, Code, Zap } from "lucide-react"

const innovations = [
  {
    title: "Custom Predicate Logic",
    description: "Execute orders based on portfolio composition, performance thresholds, and multi-asset strategies with our advanced conditional logic system.",
    features: ["Portfolio-based conditions", "Performance triggers", "Multi-asset logic", "Time-based execution"]
  },
  {
    title: "Automated Order Management",
    description: "Our sophisticated bot system monitors and executes orders every hour, providing intelligent matching and real-time monitoring capabilities.",
    features: ["Hourly execution cycles", "Smart order matching", "Real-time monitoring", "Automatic retry logic"]
  },
  {
    title: "Advanced Trading Strategies",
    description: "Implement portfolio rebalancing, TWAP execution, dollar-cost averaging, and conditional swapping with institutional-grade precision.",
    features: ["Portfolio rebalancing", "TWAP implementation", "DCA strategies", "Conditional swapping"]
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
            bundl significantly expands the 1inch Limit Order Protocol with innovative portfolio-centric features, 
            automated execution infrastructure, and sophisticated trading strategies that revolutionize DeFi portfolio management.
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
