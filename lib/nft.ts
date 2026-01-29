import { pugliaContract } from "./blockchain/puglia-contract"

export type PugliaSeason = "Bassa" | "Bassa-Media" | "Media" | "Alta"

export interface PugliaVacationNFT {
  tokenId: string
  investorId: string
  nftNumber: string
  issueDate: string
  accommodationType: string
  isUsed: boolean
  isActive: boolean
  assignedWeekId?: string
}

export interface VacationWeekData {
  weekId: string
  startDate: string
  endDate: string
  season: PugliaSeason
  villaSlots: number
  luxurySlots: number
  villaValue: string
  luxuryValue: string
  catamaranDays: string
  isActive: boolean
  requiredNFTs: number
}

export class NFTService {
  private static readonly OWNED_NFTS_KEY = "owned_nfts"

  // Get user's available NFTs from smart contract
  static async getUserAvailableNFTs(walletAddress: string): Promise<PugliaVacationNFT[]> {
    try {
      const portfolio = await pugliaContract.getUserNFTPortfolio(walletAddress)

      return portfolio.nftDetails.map((nft, index) => ({
        tokenId: portfolio.availableNFTs[index].toString(),
        investorId: nft.investorId.toString(),
        nftNumber: nft.nftNumber.toString(),
        issueDate: new Date(Number(nft.issueDate) * 1000).toLocaleDateString("it-IT"),
        accommodationType: nft.accommodationType,
        isUsed: nft.isUsed,
        isActive: nft.isActive,
        assignedWeekId: nft.assignedWeekId > 0 ? nft.assignedWeekId.toString() : undefined,
      }))
    } catch (error) {
      console.error("Errore nel caricamento NFT:", error)
      return []
    }
  }

  // Get vacation week details
  static async getVacationWeek(weekId: number): Promise<VacationWeekData | null> {
    try {
      const weekDetails = await pugliaContract.getVacationWeek(weekId)
      const requiredNFTs = await pugliaContract.getSeasonCost(weekDetails.season)

      return {
        weekId: weekId.toString(),
        startDate: pugliaContract.formatDate(weekDetails.startDate),
        endDate: pugliaContract.formatDate(weekDetails.endDate),
        season: pugliaContract.getSeasonName(weekDetails.season) as PugliaSeason,
        villaSlots: Number(weekDetails.villaSlots),
        luxurySlots: Number(weekDetails.luxurySlots),
        villaValue: weekDetails.villaValue.toString(),
        luxuryValue: weekDetails.luxuryValue.toString(),
        catamaranDays: weekDetails.catamaranDays,
        isActive: weekDetails.isActive,
        requiredNFTs: Number(requiredNFTs),
      }
    } catch (error) {
      console.error("Errore nel caricamento settimana:", error)
      return null
    }
  }

  // Get all available vacation weeks
  static async getAvailableVacationWeeks(): Promise<VacationWeekData[]> {
    try {
      const weeks: VacationWeekData[] = []

      // Try to load weeks 1-52 (assuming yearly weeks)
      for (let weekId = 1; weekId <= 52; weekId++) {
        try {
          const weekData = await this.getVacationWeek(weekId)
          if (weekData && weekData.isActive) {
            weeks.push(weekData)
          }
        } catch {
          // Week doesn't exist, continue
          continue
        }
      }

      return weeks
    } catch (error) {
      console.error("Errore nel caricamento settimane disponibili:", error)
      return []
    }
  }

  // Check if user can book a specific week
  static async canUserBookWeek(
    walletAddress: string,
    weekId: number,
  ): Promise<{
    canBook: boolean
    message: string
    weekDetails?: VacationWeekData
    requiredNFTs?: number
    availableNFTs?: PugliaVacationNFT[]
  }> {
    try {
      const eligibility = await pugliaContract.checkBookingEligibility(walletAddress, weekId)

      if (!eligibility.canBook) {
        return {
          canBook: false,
          message: eligibility.message,
        }
      }

      const weekDetails = eligibility.weekDetails
        ? {
            weekId: weekId.toString(),
            startDate: pugliaContract.formatDate(eligibility.weekDetails.startDate),
            endDate: pugliaContract.formatDate(eligibility.weekDetails.endDate),
            season: pugliaContract.getSeasonName(eligibility.weekDetails.season) as PugliaSeason,
            villaSlots: Number(eligibility.weekDetails.villaSlots),
            luxurySlots: Number(eligibility.weekDetails.luxurySlots),
            villaValue: eligibility.weekDetails.villaValue.toString(),
            luxuryValue: eligibility.weekDetails.luxuryValue.toString(),
            catamaranDays: eligibility.weekDetails.catamaranDays,
            isActive: eligibility.weekDetails.isActive,
            requiredNFTs: Number(eligibility.requiredNFTs || 0),
          }
        : undefined

      const availableNFTs = await this.getUserAvailableNFTs(walletAddress)

      return {
        canBook: true,
        message: eligibility.message,
        weekDetails,
        requiredNFTs: Number(eligibility.requiredNFTs || 0),
        availableNFTs,
      }
    } catch (error) {
      console.error("Errore nel controllo prenotazione:", error)
      return {
        canBook: false,
        message: "Errore nel controllo eligibilità",
      }
    }
  }

  // Book vacation week using NFTs
  static async bookVacationWeek(
    weekId: number,
    selectedNFTIds: string[],
    guestName: string,
    contactInfo: string,
  ): Promise<{ success: boolean; error?: string; txHash?: string }> {
    try {
      const tokenIds = selectedNFTIds.map((id) => BigInt(id))

      const tx = await pugliaContract.bookVacationWeek(weekId, tokenIds, guestName, contactInfo)

      // Wait for transaction confirmation
      await tx.wait()

      return {
        success: true,
        txHash: tx.hash,
      }
    } catch (error: any) {
      console.error("Errore nella prenotazione:", error)
      return {
        success: false,
        error: error.message || "Errore nella prenotazione",
      }
    }
  }

  // Get season information
  static getSeasonInfo(season: PugliaSeason) {
    const seasonData = {
      Bassa: {
        name: "Stagione Bassa",
        period: "Novembre - Marzo",
        description: "Periodo tranquillo con meno affollamento",
        color: "text-blue-600",
        bgColor: "bg-blue-50",
        nftsRequired: 1,
      },
      "Bassa-Media": {
        name: "Stagione Bassa-Media",
        period: "Fine Maggio, Settembre",
        description: "Periodo di transizione con condizioni moderate",
        color: "text-cyan-600",
        bgColor: "bg-cyan-50",
        nftsRequired: 2,
      },
      Media: {
        name: "Stagione Media",
        period: "Giugno, Settembre",
        description: "Inizio estate con buone condizioni",
        color: "text-amber-600",
        bgColor: "bg-amber-50",
        nftsRequired: 3,
      },
      Alta: {
        name: "Stagione Alta",
        period: "Luglio - Agosto",
        description: "Picco estivo con servizi premium",
        color: "text-emerald-600",
        bgColor: "bg-emerald-50",
        nftsRequired: 4,
      },
    }
    return seasonData[season]
  }

  // Helper to get user's NFT count
  static async getUserNFTCount(walletAddress: string): Promise<number> {
    try {
      const nfts = await this.getUserAvailableNFTs(walletAddress)
      return nfts.length
    } catch {
      return 0
    }
  }

  // Legacy methods for backward compatibility (now return empty/mock data)
  static getAllNFTs(): any[] {
    return []
  }

  static getNFTById(id: string): any {
    return null
  }

  static getNFTsBySeason(season: any): any[] {
    return []
  }

  static getOwnedNFTs(userId: string): any[] {
    // This is now handled by getUserAvailableNFTs with wallet address
    return []
  }

  static async purchaseNFT(): Promise<{ success: boolean; error?: string }> {
    // NFT purchase is now handled by the admin minting process
    return { success: false, error: "NFT purchase handled by admin minting" }
  }
}
