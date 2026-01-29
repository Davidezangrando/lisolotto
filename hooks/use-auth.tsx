"use client"

import { useState, useEffect, createContext, useContext, type ReactNode } from "react"
import { AuthService, type User } from "@/lib/auth"

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing auth on mount
    const currentUser = AuthService.getCurrentUser()
    setUser(currentUser)
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    const result = await AuthService.login(email, password)

    if (result.success && result.user) {
      setUser(result.user)
    }

    setIsLoading(false)
    return { success: result.success, error: result.error }
  }

  const register = async (email: string, password: string, name: string) => {
    setIsLoading(true)
    const result = await AuthService.register(email, password, name)

    if (result.success && result.user) {
      setUser(result.user)
    }

    setIsLoading(false)
    return { success: result.success, error: result.error }
  }

  const logout = () => {
    AuthService.logout()
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
