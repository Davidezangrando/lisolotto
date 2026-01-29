export interface Catamaran {
  id: string
  name: string
  description: string
  image: string
  capacity: number
  amenities: string[]
  location: string
  pricePerDay: number // Base price in ETH
  availableSeasons: Season[]
}

export interface Booking {
  id: string
  userId: string
  catamaranId: string
  nftTokenId: string
  startDate: string
  endDate: string
  guests: number
  totalDays: number
  status: "pending" | "confirmed" | "cancelled" | "completed"
  createdAt: string
  specialRequests?: string
  totalCost: number
  checkIn?: {
    code: string
    generatedAt: string
    expiresAt: string
    usedAt?: string
  }
}

export interface BookingRequest {
  catamaranId: string
  nftTokenId: string
  startDate: string
  endDate: string
  guests: number
  specialRequests?: string
}

import type { Season } from "./nft"

// Mock catamaran fleet
const MOCK_CATAMARANS: Catamaran[] = [
  {
    id: "cat-1",
    name: "Ocean Serenity",
    description: "A luxurious 45-foot catamaran perfect for peaceful sailing and relaxation.",
    image: "/catamaran-ocean-serenity-luxury-deck.png",
    capacity: 8,
    amenities: ["Full kitchen", "3 bedrooms", "2 bathrooms", "Solar panels", "WiFi", "Snorkeling gear"],
    location: "Marina del Rey",
    pricePerDay: 0.1,
    availableSeasons: ["low", "medium"],
  },
  {
    id: "cat-2",
    name: "Azure Explorer",
    description: "Modern catamaran designed for adventure and exploration in all conditions.",
    image: "/catamaran-azure-explorer-sailing-action.png",
    capacity: 10,
    amenities: ["Gourmet kitchen", "4 bedrooms", "3 bathrooms", "Water sports equipment", "Entertainment system"],
    location: "Newport Harbor",
    pricePerDay: 0.15,
    availableSeasons: ["medium", "high"],
  },
  {
    id: "cat-3",
    name: "Platinum Majesty",
    description: "The ultimate luxury catamaran experience with premium amenities and service.",
    image: "/catamaran-platinum-majesty-sunset-luxury.png",
    capacity: 12,
    amenities: [
      "Professional chef",
      "5 bedrooms",
      "4 bathrooms",
      "Jacuzzi",
      "Helicopter pad",
      "Concierge service",
      "Premium bar",
    ],
    location: "Exclusive Marina",
    pricePerDay: 0.3,
    availableSeasons: ["high"],
  },
]

export class BookingService {
  private static readonly BOOKINGS_KEY = "catamaran_bookings"

  static getCatamarans(): Catamaran[] {
    return MOCK_CATAMARANS
  }

  static getCatamaranById(id: string): Catamaran | undefined {
    return MOCK_CATAMARANS.find((cat) => cat.id === id)
  }

  static getCatamaransBySeason(season: Season): Catamaran[] {
    return MOCK_CATAMARANS.filter((cat) => cat.availableSeasons.includes(season))
  }

  static getUserBookings(userId: string): Booking[] {
    if (typeof window === "undefined") return []

    try {
      const stored = localStorage.getItem(`${this.BOOKINGS_KEY}_${userId}`)
      if (!stored) return []
      return JSON.parse(stored)
    } catch {
      return []
    }
  }

  static getAllBookings(): Booking[] {
    if (typeof window === "undefined") return []

    try {
      const stored = localStorage.getItem(this.BOOKINGS_KEY)
      if (!stored) return []
      return JSON.parse(stored)
    } catch {
      return []
    }
  }

  static async createBooking(
    userId: string,
    bookingRequest: BookingRequest,
  ): Promise<{ success: boolean; booking?: Booking; error?: string }> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const catamaran = this.getCatamaranById(bookingRequest.catamaranId)
    if (!catamaran) {
      return { success: false, error: "Catamaran not found" }
    }

    // Validate dates
    const startDate = new Date(bookingRequest.startDate)
    const endDate = new Date(bookingRequest.endDate)
    const today = new Date()

    if (startDate < today) {
      return { success: false, error: "Start date cannot be in the past" }
    }

    if (endDate <= startDate) {
      return { success: false, error: "End date must be after start date" }
    }

    // Calculate total days
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))

    // Validate guest capacity
    if (bookingRequest.guests > catamaran.capacity) {
      return { success: false, error: `Maximum capacity is ${catamaran.capacity} guests` }
    }

    // Check for conflicts (simplified - in real app would check actual availability)
    const existingBookings = this.getUserBookings(userId)
    const hasConflict = existingBookings.some((booking) => {
      const existingStart = new Date(booking.startDate)
      const existingEnd = new Date(booking.endDate)
      return (
        booking.status !== "cancelled" &&
        ((startDate >= existingStart && startDate < existingEnd) ||
          (endDate > existingStart && endDate <= existingEnd) ||
          (startDate <= existingStart && endDate >= existingEnd))
      )
    })

    if (hasConflict) {
      return { success: false, error: "You have a conflicting booking during this period" }
    }

    // Calculate total cost
    const totalCost = totalDays * catamaran.pricePerDay

    // Create booking
    const booking: Booking = {
      id: `booking_${Date.now()}`,
      userId,
      catamaranId: bookingRequest.catamaranId,
      nftTokenId: bookingRequest.nftTokenId,
      startDate: bookingRequest.startDate,
      endDate: bookingRequest.endDate,
      guests: bookingRequest.guests,
      totalDays,
      status: "pending",
      createdAt: new Date().toISOString(),
      specialRequests: bookingRequest.specialRequests,
      totalCost,
    }

    // Save user booking
    const userBookings = [...existingBookings, booking]
    localStorage.setItem(`${this.BOOKINGS_KEY}_${userId}`, JSON.stringify(userBookings))

    // Save to global bookings (for admin)
    const allBookings = this.getAllBookings()
    const updatedAllBookings = [...allBookings, booking]
    localStorage.setItem(this.BOOKINGS_KEY, JSON.stringify(updatedAllBookings))

    return { success: true, booking }
  }

  static async updateBookingStatus(
    bookingId: string,
    status: Booking["status"],
  ): Promise<{ success: boolean; error?: string }> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Update in global bookings
    const allBookings = this.getAllBookings()
    const bookingIndex = allBookings.findIndex((b) => b.id === bookingId)

    if (bookingIndex === -1) {
      return { success: false, error: "Booking not found" }
    }

    allBookings[bookingIndex].status = status
    localStorage.setItem(this.BOOKINGS_KEY, JSON.stringify(allBookings))

    // Update in user bookings
    const booking = allBookings[bookingIndex]
    const userBookings = this.getUserBookings(booking.userId)
    const userBookingIndex = userBookings.findIndex((b) => b.id === bookingId)

    if (userBookingIndex !== -1) {
      userBookings[userBookingIndex].status = status
      localStorage.setItem(`${this.BOOKINGS_KEY}_${booking.userId}`, JSON.stringify(userBookings))
    }

    return { success: true }
  }

  static updateBookingCheckIn(
    bookingId: string,
    checkInData: { code: string; generatedAt: string; expiresAt: string },
  ): { success: boolean; error?: string } {
    // Update in global bookings
    const allBookings = this.getAllBookings()
    const bookingIndex = allBookings.findIndex((b) => b.id === bookingId)

    if (bookingIndex === -1) {
      return { success: false, error: "Booking not found" }
    }

    allBookings[bookingIndex].checkIn = checkInData
    localStorage.setItem(this.BOOKINGS_KEY, JSON.stringify(allBookings))

    // Update in user bookings
    const booking = allBookings[bookingIndex]
    const userBookings = this.getUserBookings(booking.userId)
    const userBookingIndex = userBookings.findIndex((b) => b.id === bookingId)

    if (userBookingIndex !== -1) {
      userBookings[userBookingIndex].checkIn = checkInData
      localStorage.setItem(`${this.BOOKINGS_KEY}_${booking.userId}`, JSON.stringify(userBookings))
    }

    return { success: true }
  }

  static updateBooking(
    bookingId: string,
    updates: { guests?: number; specialRequests?: string },
  ): { success: boolean; error?: string } {
    // Update in global bookings
    const allBookings = this.getAllBookings()
    const bookingIndex = allBookings.findIndex((b) => b.id === bookingId)

    if (bookingIndex === -1) {
      return { success: false, error: "Booking not found" }
    }

    const booking = allBookings[bookingIndex]

    // Validate guest capacity if updating guests
    if (updates.guests) {
      const catamaran = this.getCatamaranById(booking.catamaranId)
      if (catamaran && updates.guests > catamaran.capacity) {
        return { success: false, error: `Maximum capacity is ${catamaran.capacity} guests` }
      }
    }

    // Apply updates
    if (updates.guests !== undefined) {
      allBookings[bookingIndex].guests = updates.guests
    }
    if (updates.specialRequests !== undefined) {
      allBookings[bookingIndex].specialRequests = updates.specialRequests
    }

    localStorage.setItem(this.BOOKINGS_KEY, JSON.stringify(allBookings))

    // Update in user bookings
    const userBookings = this.getUserBookings(booking.userId)
    const userBookingIndex = userBookings.findIndex((b) => b.id === bookingId)

    if (userBookingIndex !== -1) {
      if (updates.guests !== undefined) {
        userBookings[userBookingIndex].guests = updates.guests
      }
      if (updates.specialRequests !== undefined) {
        userBookings[userBookingIndex].specialRequests = updates.specialRequests
      }
      localStorage.setItem(`${this.BOOKINGS_KEY}_${booking.userId}`, JSON.stringify(userBookings))
    }

    return { success: true }
  }

  static useCheckInCode(bookingId: string, code: string): { success: boolean; error?: string; booking?: Booking } {
    const allBookings = this.getAllBookings()
    const booking = allBookings.find((b) => b.id === bookingId)

    if (!booking) {
      return { success: false, error: "Booking not found" }
    }

    if (!booking.checkIn) {
      return { success: false, error: "No check-in code generated for this booking" }
    }

    if (booking.checkIn.code !== code) {
      return { success: false, error: "Invalid check-in code" }
    }

    if (new Date() > new Date(booking.checkIn.expiresAt)) {
      return { success: false, error: "Check-in code has expired" }
    }

    if (booking.checkIn.usedAt) {
      return { success: false, error: "Check-in code has already been used" }
    }

    // Mark code as used
    booking.checkIn.usedAt = new Date().toISOString()

    // Update booking status to confirmed if it was pending
    if (booking.status === "pending") {
      booking.status = "confirmed"
    }

    // Save updates
    localStorage.setItem(this.BOOKINGS_KEY, JSON.stringify(allBookings))

    // Update user bookings
    const userBookings = this.getUserBookings(booking.userId)
    const userBookingIndex = userBookings.findIndex((b) => b.id === bookingId)
    if (userBookingIndex !== -1) {
      userBookings[userBookingIndex] = booking
      localStorage.setItem(`${this.BOOKINGS_KEY}_${booking.userId}`, JSON.stringify(userBookings))
    }

    return { success: true, booking }
  }

  static isDateAvailable(catamaranId: string, date: string): boolean {
    // Simplified availability check
    const allBookings = this.getAllBookings()
    const checkDate = new Date(date)

    const conflicts = allBookings.filter((booking) => {
      if (booking.catamaranId !== catamaranId || booking.status === "cancelled") {
        return false
      }

      const startDate = new Date(booking.startDate)
      const endDate = new Date(booking.endDate)
      return checkDate >= startDate && checkDate < endDate
    })

    return conflicts.length === 0
  }

  static getBookingStats() {
    const allBookings = this.getAllBookings()
    const totalBookings = allBookings.length
    const confirmedBookings = allBookings.filter((b) => b.status === "confirmed").length
    const pendingBookings = allBookings.filter((b) => b.status === "pending").length
    const totalRevenue = allBookings.filter((b) => b.status === "confirmed").reduce((sum, b) => sum + b.totalCost, 0)

    return {
      totalBookings,
      confirmedBookings,
      pendingBookings,
      totalRevenue,
    }
  }
}
