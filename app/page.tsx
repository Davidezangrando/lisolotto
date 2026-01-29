"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  const { isAuthenticated, user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      // Redirect authenticated users to their dashboard
      if (user.role === "admin") {
        router.push("/admin")
      } else {
        router.push("/dashboard")
      }
    }
  }, [isAuthenticated, user, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-accent/10">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-6xl font-bold text-primary mb-6">⚓ NFT Catamaran</h1>
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            Discover exclusive NFT collections tied to luxury catamaran experiences. Own seasonal tokens and unlock
            premium maritime adventures.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => router.push("/auth")} className="text-lg px-8 py-3">
              Get Started
            </Button>
            <Button variant="outline" size="lg" onClick={() => router.push("/auth")} className="text-lg px-8 py-3">
              Learn More
            </Button>
          </div>
        </div>

        {/* Features Preview */}
        <div className="grid md:grid-cols-3 gap-8 mt-16 max-w-6xl mx-auto">
          <div className="text-center p-6 rounded-lg bg-card border">
            <div className="text-4xl mb-4">🏝️</div>
            <h3 className="text-xl font-semibold text-primary mb-2">Seasonal NFTs</h3>
            <p className="text-muted-foreground">
              Collect exclusive NFTs for low, medium, and high seasons with unique benefits.
            </p>
          </div>

          <div className="text-center p-6 rounded-lg bg-card border">
            <div className="text-4xl mb-4">⛵</div>
            <h3 className="text-xl font-semibold text-primary mb-2">Catamaran Access</h3>
            <p className="text-muted-foreground">
              Book premium catamaran experiences with your NFT ownership privileges.
            </p>
          </div>

          <div className="text-center p-6 rounded-lg bg-card border">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-primary mb-2">Investment Tracking</h3>
            <p className="text-muted-foreground">
              Monitor your NFT portfolio and catamaran booking history in one place.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
