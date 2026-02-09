import { pugliaContract } from "./blockchain/puglia-contract"

export interface UserTokenInfo {
  tokenId: number
  ownerName: string
  totalVacations: number
  usedVacations: number
  availableVacations: number[]
  bookedVacations: number[]
  isActive: boolean
}

export interface VacationSlot {
  vacationId: number
  startDate: string
  endDate: string
  location: string
  isBooked: boolean
  bookedByToken: number
  bookingDate: string
}

export class NFTService {
  // Get all user tokens with their metadata
  static async getUserTokens(walletAddress: string): Promise<UserTokenInfo[]> {
    try {
      const tokenIds = await pugliaContract.getUserTokenIds(walletAddress)
      const tokens: UserTokenInfo[] = []

      for (const tokenId of tokenIds) {
        const meta = await pugliaContract.getTokenMetadata(tokenId)
        tokens.push({
          tokenId,
          ownerName: meta.ownerName,
          totalVacations: Number(meta.totalVacations),
          usedVacations: Number(meta.usedVacations),
          availableVacations: meta.availableVacations.map(Number),
          bookedVacations: meta.bookedVacations.map(Number),
          isActive: meta.isActive,
        })
      }

      return tokens
    } catch (error) {
      console.error("Error loading user tokens:", error)
      return []
    }
  }

  // Get vacation slot details for display
  static async getVacationSlot(vacationId: number): Promise<VacationSlot | null> {
    try {
      const vacation = await pugliaContract.getVacation(vacationId)
      return {
        vacationId,
        startDate: pugliaContract.formatDate(vacation.startDate),
        endDate: pugliaContract.formatDate(vacation.endDate),
        location: vacation.location,
        isBooked: vacation.isBooked,
        bookedByToken: Number(vacation.bookedByToken),
        bookingDate: vacation.bookingDate > BigInt(0)
          ? pugliaContract.formatDate(vacation.bookingDate)
          : "",
      }
    } catch (error) {
      console.error(`Error loading vacation ${vacationId}:`, error)
      return null
    }
  }

  // Get all booked vacation details for a token
  static async getBookedVacationDetails(
    bookedVacationIds: number[],
  ): Promise<VacationSlot[]> {
    const results: VacationSlot[] = []
    for (const id of bookedVacationIds) {
      const slot = await this.getVacationSlot(id)
      if (slot) results.push(slot)
    }
    return results
  }

  // Get all available vacation details for a token
  static async getAvailableVacationDetails(
    availableVacationIds: number[],
  ): Promise<VacationSlot[]> {
    const results: VacationSlot[] = []
    for (const id of availableVacationIds) {
      const slot = await this.getVacationSlot(id)
      if (slot) results.push(slot)
    }
    return results
  }

  // Aggregate credit info across all user tokens
  static async getUserCreditSummary(walletAddress: string): Promise<{
    totalWeeks: number
    usedWeeks: number
    bookedWeeks: number
    remainingWeeks: number
    tokens: UserTokenInfo[]
  }> {
    const tokens = await this.getUserTokens(walletAddress)

    let totalWeeks = 0
    let usedWeeks = 0
    let bookedWeeks = 0

    for (const token of tokens) {
      totalWeeks += token.totalVacations
      usedWeeks += token.usedVacations
      bookedWeeks += token.bookedVacations.length
    }

    return {
      totalWeeks,
      usedWeeks,
      bookedWeeks,
      remainingWeeks: totalWeeks - usedWeeks,
      tokens,
    }
  }
}
