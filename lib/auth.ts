export interface User {
  id: string
  email: string
  role: "investor" | "admin"
  name: string
  createdAt: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
}

// Mock users for development
const MOCK_USERS: User[] = [
  {
    id: "1",
    email: "admin@example.com",
    role: "admin",
    name: "Admin User",
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    email: "investor@example.com",
    role: "investor",
    name: "John Investor",
    createdAt: new Date().toISOString(),
  },
]

// Demo password for all users (MVP only)
const DEMO_PASSWORD = "demo123"

export class AuthService {
  private static readonly STORAGE_KEY = "nft_catamaran_auth"

  static getCurrentUser(): User | null {
    if (typeof window === "undefined") return null

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (!stored) return null

      const authState: AuthState = JSON.parse(stored)
      return authState.user
    } catch {
      return null
    }
  }

  static async login(email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    if (password !== DEMO_PASSWORD) {
      return { success: false, error: "Invalid password" }
    }

    const user = MOCK_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase())
    if (!user) {
      return { success: false, error: "User not found" }
    }

    const authState: AuthState = {
      user,
      isAuthenticated: true,
    }

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(authState))
    return { success: true, user }
  }

  static async register(
    email: string,
    password: string,
    name: string,
  ): Promise<{ success: boolean; user?: User; error?: string }> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    if (password !== DEMO_PASSWORD) {
      return { success: false, error: "For MVP demo, use password: demo123" }
    }

    // Check if user already exists
    const existingUser = MOCK_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase())
    if (existingUser) {
      return { success: false, error: "User already exists" }
    }

    const newUser: User = {
      id: Date.now().toString(),
      email: email.toLowerCase(),
      role: "investor", // New users are investors by default
      name,
      createdAt: new Date().toISOString(),
    }

    // Add to mock users (in real app, this would be API call)
    MOCK_USERS.push(newUser)

    const authState: AuthState = {
      user: newUser,
      isAuthenticated: true,
    }

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(authState))
    return { success: true, user: newUser }
  }

  static logout(): void {
    localStorage.removeItem(this.STORAGE_KEY)
  }

  static isAuthenticated(): boolean {
    return this.getCurrentUser() !== null
  }

  static hasRole(role: "investor" | "admin"): boolean {
    const user = this.getCurrentUser()
    return user?.role === role
  }
}
