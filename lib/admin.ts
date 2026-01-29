import type { User } from "./auth"
import type { Season } from "./nft"
import type { Booking } from "./booking"
import { BookingService } from "./booking"

export interface SeasonConfig {
  season: Season
  name: string
  startDate: string
  endDate: string
  maxNFTs: number
  currentNFTs: number
  priceETH: number
  isActive: boolean
}

export interface UserStats {
  totalUsers: number
  investorUsers: number
  adminUsers: number
  newUsersThisMonth: number
}

export interface SalesReport {
  season: Season
  totalSales: number
  totalRevenue: number
  averagePrice: number
  nftsRemaining: number
}

export interface ProjectStats {
  totalNFTsSold: number
  totalRevenue: number
  totalBookings: number
  activeUsers: number
  catamaranUtilization: number
}

export class AdminService {
  private static readonly SEASONS_KEY = "admin_seasons_config"
  private static readonly USERS_KEY = "admin_all_users"

  // Season Management
  static getSeasonConfigs(): SeasonConfig[] {
    if (typeof window === "undefined") return []

    try {
      const stored = localStorage.getItem(this.SEASONS_KEY)
      if (!stored) {
        // Initialize with default seasons
        const defaultSeasons = this.getDefaultSeasons()
        this.saveSeasonConfigs(defaultSeasons)
        return defaultSeasons
      }
      return JSON.parse(stored)
    } catch {
      return this.getDefaultSeasons()
    }
  }

  private static getDefaultSeasons(): SeasonConfig[] {
    return [
      {
        season: "low",
        name: "Low Season",
        startDate: "2024-11-01",
        endDate: "2025-03-31",
        maxNFTs: 100,
        currentNFTs: 45,
        priceETH: 0.05,
        isActive: true,
      },
      {
        season: "medium",
        name: "Medium Season",
        startDate: "2025-04-01",
        endDate: "2025-05-31",
        maxNFTs: 75,
        currentNFTs: 28,
        priceETH: 0.08,
        isActive: true,
      },
      {
        season: "high",
        name: "High Season",
        startDate: "2025-06-01",
        endDate: "2025-10-31",
        maxNFTs: 50,
        currentNFTs: 12,
        priceETH: 0.12,
        isActive: true,
      },
    ]
  }

  static saveSeasonConfigs(seasons: SeasonConfig[]): void {
    if (typeof window === "undefined") return
    localStorage.setItem(this.SEASONS_KEY, JSON.stringify(seasons))
  }

  static updateSeasonConfig(season: Season, updates: Partial<SeasonConfig>): boolean {
    const seasons = this.getSeasonConfigs()
    const index = seasons.findIndex((s) => s.season === season)

    if (index === -1) return false

    seasons[index] = { ...seasons[index], ...updates }
    this.saveSeasonConfigs(seasons)
    return true
  }

  // User Management
  static getAllUsers(): User[] {
    if (typeof window === "undefined") return []

    // In a real app, this would fetch from API
    // For MVP, we'll simulate with localStorage
    try {
      const stored = localStorage.getItem(this.USERS_KEY)
      if (!stored) {
        const mockUsers = [
          {
            id: "1",
            email: "admin@example.com",
            role: "admin" as const,
            name: "Admin User",
            createdAt: new Date().toISOString(),
          },
          {
            id: "2",
            email: "investor@example.com",
            role: "investor" as const,
            name: "John Investor",
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: "3",
            email: "alice@example.com",
            role: "investor" as const,
            name: "Alice Cooper",
            createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: "4",
            email: "bob@example.com",
            role: "investor" as const,
            name: "Bob Wilson",
            createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ]
        localStorage.setItem(this.USERS_KEY, JSON.stringify(mockUsers))
        return mockUsers
      }
      return JSON.parse(stored)
    } catch {
      return []
    }
  }

  static getUserStats(): UserStats {
    const users = this.getAllUsers()
    const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

    return {
      totalUsers: users.length,
      investorUsers: users.filter((u) => u.role === "investor").length,
      adminUsers: users.filter((u) => u.role === "admin").length,
      newUsersThisMonth: users.filter((u) => new Date(u.createdAt) > oneMonthAgo).length,
    }
  }

  // Sales Reports
  static getSalesReports(): SalesReport[] {
    const seasons = this.getSeasonConfigs()

    return seasons.map((season) => ({
      season: season.season,
      totalSales: season.currentNFTs,
      totalRevenue: season.currentNFTs * season.priceETH,
      averagePrice: season.priceETH,
      nftsRemaining: season.maxNFTs - season.currentNFTs,
    }))
  }

  // Project Overview
  static getProjectStats(): ProjectStats {
    const salesReports = this.getSalesReports()
    const bookingStats = BookingService.getBookingStats()
    const users = this.getAllUsers()

    const totalNFTsSold = salesReports.reduce((sum, report) => sum + report.totalSales, 0)
    const totalRevenue = salesReports.reduce((sum, report) => sum + report.totalRevenue, 0)

    // Calculate catamaran utilization (mock calculation)
    const totalPossibleBookingDays = 365 * 3 // 3 catamarans * 365 days
    const bookedDays = bookingStats.confirmedBookings * 3 // Average 3 days per booking
    const catamaranUtilization = Math.min((bookedDays / totalPossibleBookingDays) * 100, 100)

    return {
      totalNFTsSold,
      totalRevenue,
      totalBookings: bookingStats.totalBookings,
      activeUsers: users.filter((u) => u.role === "investor").length,
      catamaranUtilization,
    }
  }

  // Booking Management
  static getAllBookingsWithDetails() {
    const allBookings = BookingService.getAllBookings()
    const users = this.getAllUsers()
    const catamarans = BookingService.getCatamarans()

    return allBookings.map((booking) => {
      const user = users.find((u) => u.id === booking.userId)
      const catamaran = catamarans.find((c) => c.id === booking.catamaranId)

      return {
        ...booking,
        userName: user?.name || "Unknown User",
        userEmail: user?.email || "Unknown Email",
        catamaranName: catamaran?.name || "Unknown Catamaran",
      }
    })
  }

  static async updateBookingStatus(bookingId: string, status: Booking["status"]) {
    return await BookingService.updateBookingStatus(bookingId, status)
  }
}
