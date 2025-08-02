"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, Rocket, Star, Users, TrendingUp } from "lucide-react"

export default function CTASection() {
  return (
    <section className="relative z-10 py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Main CTA */}
        <div className="relative overflow-hidden bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-3xl border border-border/50 p-12 text-center">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 opacity-50"></div>
          <div className="relative z-10">
            <div className="inline-flex items-center px-4 py-2 bg-primary/20 rounded-full mb-8">
              <Rocket className="h-4 w-4 text-primary mr-2" />
              <span className="text-primary font-medium">Ready to Launch</span>
            </div>
            
            <h2 className="text-3xl sm:text-5xl font-bold mb-6 gradient-text">
              Ready to Bundle Your Assets?
            </h2>
            <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
              Join the future of portfolio management. Start organizing your crypto like never before with bundl's revolutionary portfolio NFTs and automated trading strategies.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="/dashboard">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-12 py-4 text-lg rounded-xl hover-glow hover:scale-105 transition-all duration-300">
                  Launch Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="https://github.com/imApoorva36/bundl" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="lg" className="px-12 py-4 text-lg rounded-xl border-border hover:border-primary/50 hover:scale-105 transition-all duration-300">
                  View on GitHub
                </Button>
              </Link>
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}
