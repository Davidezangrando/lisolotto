"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { LoginForm } from "@/components/auth/login-form"
import { RegisterForm } from "@/components/auth/register-form"
import { useAuth } from "@/hooks/use-auth"

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const { isAuthenticated, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isAuthenticated && user) {
      // Redirect based on user role
      if (user.role === "admin") {
        router.push("/admin")
      } else {
        router.push("/dashboard")
      }
    }
  }, [isAuthenticated, user, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-accent/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Maritime themed header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">⚓ NFT Catamaran</h1>
          <p className="text-muted-foreground">Luxury Maritime NFT Marketplace</p>
        </div>

        {isLogin ? (
          <LoginForm onToggleMode={() => setIsLogin(false)} />
        ) : (
          <RegisterForm onToggleMode={() => setIsLogin(true)} />
        )}
      </div>
    </div>
  )
}
