import { ethers } from "ethers"

// Contract address on Polygon Mainnet
export const PUGLIA_CONTRACT_ADDRESS = "0x8bAcFBA121157C87C846c435a2fdFD6dAE7a9432"

// ABI for the key functions we need
export const PUGLIA_CONTRACT_ABI = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_wallet",
        type: "address",
      },
    ],
    name: "getInvestorAvailableNFTs",
    outputs: [
      {
        internalType: "uint256[]",
        name: "",
        type: "uint256[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_wallet",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_weekId",
        type: "uint256",
      },
    ],
    name: "canBookWeek",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_tokenId",
        type: "uint256",
      },
    ],
    name: "getVacationNFT",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "investorId",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "nftNumber",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "issueDate",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "assignedWeekId",
            type: "uint256",
          },
          {
            internalType: "string",
            name: "accommodationType",
            type: "string",
          },
          {
            internalType: "bool",
            name: "isUsed",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "isActive",
            type: "bool",
          },
        ],
        internalType: "struct PugliaVacationNFTSystem.VacationNFT",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_weekId",
        type: "uint256",
      },
    ],
    name: "getVacationWeek",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "startDate",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "endDate",
            type: "uint256",
          },
          {
            internalType: "uint8",
            name: "season",
            type: "uint8",
          },
          {
            internalType: "uint256",
            name: "villaSlots",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "luxurySlots",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "villaValue",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "luxuryValue",
            type: "uint256",
          },
          {
            internalType: "string",
            name: "catamaranDays",
            type: "string",
          },
          {
            internalType: "bool",
            name: "isActive",
            type: "bool",
          },
        ],
        internalType: "struct PugliaVacationNFTSystem.VacationWeek",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint8",
        name: "_season",
        type: "uint8",
      },
    ],
    name: "getSeasonCost",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_weekId",
        type: "uint256",
      },
      {
        internalType: "uint256[]",
        name: "_tokenIds",
        type: "uint256[]",
      },
      {
        internalType: "string",
        name: "_guestName",
        type: "string",
      },
      {
        internalType: "string",
        name: "_contactInfo",
        type: "string",
      },
    ],
    name: "bookVacationWeek",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256[]",
        name: "_tokenIds",
        type: "uint256[]",
      },
      {
        internalType: "uint256",
        name: "_price",
        type: "uint256",
      },
      {
        internalType: "string",
        name: "_description",
        type: "string",
      },
    ],
    name: "listNFTsForSale",
    outputs: [
      {
        internalType: "uint256",
        name: "listingId",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_listingId",
        type: "uint256",
      },
    ],
    name: "buyNFTsFromMarketplace",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_listingId",
        type: "uint256",
      },
    ],
    name: "removeFromMarketplace",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_weekId",
        type: "uint256",
      },
      {
        internalType: "uint256[]",
        name: "_tokenIds",
        type: "uint256[]",
      },
      {
        internalType: "string",
        name: "_guestName",
        type: "string",
      },
      {
        internalType: "string",
        name: "_contactInfo",
        type: "string",
      },
    ],
    name: "bookVacationWeek",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_startDate",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_endDate",
        type: "uint256",
      },
      {
        internalType: "uint8",
        name: "_season",
        type: "uint8",
      },
      {
        internalType: "uint256",
        name: "_villaSlots",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_luxurySlots",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_villaValue",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_luxuryValue",
        type: "uint256",
      },
      {
        internalType: "string",
        name: "_catamaranDays",
        type: "string",
      },
    ],
    name: "createVacationWeek",
    outputs: [
      {
        internalType: "uint256",
        name: "weekId",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_wallet",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_investmentAmount",
        type: "uint256",
      },
      {
        internalType: "string",
        name: "_investorName",
        type: "string",
      },
    ],
    name: "registerInvestorAndMintNFTs",
    outputs: [
      {
        internalType: "uint256[]",
        name: "tokenIds",
        type: "uint256[]",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_weekId",
        type: "uint256",
      },
    ],
    name: "removeVacationWeek",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint8",
        name: "_season",
        type: "uint8",
      },
      {
        internalType: "uint256",
        name: "_nftCost",
        type: "uint256",
      },
    ],
    name: "updateSeasonCost",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "approve",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint8",
        name: "_season",
        type: "uint8",
      },
      {
        internalType: "uint256",
        name: "_nftCost",
        type: "uint256",
      },
    ],
    name: "updateSeasonCost",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "approve",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "bookings",
    outputs: [
      {
        internalType: "uint256",
        name: "weekId",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "booker",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "bookingDate",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "isUsed",
        type: "bool",
      },
      {
        internalType: "string",
        name: "guestName",
        type: "string",
      },
      {
        internalType: "string",
        name: "contactInfo",
        type: "string",
      },
      {
        internalType: "string",
        name: "accommodationType",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_bookingId",
        type: "uint256",
      },
    ],
    name: "getBooking",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "weekId",
            type: "uint256",
          },
          {
            internalType: "address",
            name: "booker",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "bookingDate",
            type: "uint256",
          },
          {
            internalType: "bool",
            name: "isUsed",
            type: "bool",
          },
          {
            internalType: "string",
            name: "guestName",
            type: "string",
          },
          {
            internalType: "string",
            name: "contactInfo",
            type: "string",
          },
          {
            internalType: "string",
            name: "accommodationType",
            type: "string",
          },
        ],
        internalType: "struct PugliaVacationNFTSystem.Booking",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_bookingId",
        type: "uint256",
      },
    ],
    name: "cancelBooking",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
]

// Types based on smart contract structs
export interface VacationNFT {
  investorId: bigint
  nftNumber: bigint
  issueDate: bigint
  assignedWeekId: bigint
  accommodationType: string
  isUsed: boolean
  isActive: boolean
}

export interface VacationWeek {
  startDate: bigint
  endDate: bigint
  season: number // 0=Bassa, 1=Bassa-Media, 2=Media, 3=Alta
  villaSlots: bigint
  luxurySlots: bigint
  villaValue: bigint
  luxuryValue: bigint
  catamaranDays: string
  isActive: boolean
}

export interface Booking {
  weekId: bigint
  booker: string
  bookingDate: bigint
  isUsed: boolean
  guestName: string
  contactInfo: string
  accommodationType: string
}

export enum Season {
  Bassa = 0,
  BassaMedia = 1,
  Media = 2,
  Alta = 3,
}

// Service class for interacting with the Puglia Vacation NFT contract
export class PugliaContractService {
  private contract: ethers.Contract | null = null
  private provider: ethers.BrowserProvider | null = null

  async initializeContract(): Promise<ethers.Contract> {
    if (!window.ethereum) {
      throw new Error("MetaMask non installato")
    }

    this.provider = new ethers.BrowserProvider(window.ethereum)
    const signer = await this.provider.getSigner()

    this.contract = new ethers.Contract(PUGLIA_CONTRACT_ADDRESS, PUGLIA_CONTRACT_ABI, signer)

    return this.contract
  }

  async getReadOnlyContract(): Promise<ethers.Contract> {
    // Use Polygon mainnet public RPC for read-only calls
    const provider = new ethers.JsonRpcProvider("https://polygon-rpc.com/")
    return new ethers.Contract(PUGLIA_CONTRACT_ADDRESS, PUGLIA_CONTRACT_ABI, provider)
  }

  // Get available NFTs for an investor
  async getInvestorAvailableNFTs(walletAddress: string): Promise<bigint[]> {
    const contract = await this.getReadOnlyContract()
    return await contract.getInvestorAvailableNFTs(walletAddress)
  }

  // Check if user can book a specific week
  async canBookWeek(walletAddress: string, weekId: number): Promise<[boolean, string]> {
    const contract = await this.getReadOnlyContract()
    return await contract.canBookWeek(walletAddress, weekId)
  }

  // Get NFT details
  async getVacationNFT(tokenId: bigint): Promise<VacationNFT> {
    const contract = await this.getReadOnlyContract()
    const result = await contract.getVacationNFT(tokenId)

    return {
      investorId: result.investorId,
      nftNumber: result.nftNumber,
      issueDate: result.issueDate,
      assignedWeekId: result.assignedWeekId,
      accommodationType: result.accommodationType,
      isUsed: result.isUsed,
      isActive: result.isActive,
    }
  }

  // Get vacation week details
  async getVacationWeek(weekId: number): Promise<VacationWeek> {
    const contract = await this.getReadOnlyContract()
    const result = await contract.getVacationWeek(weekId)

    return {
      startDate: result.startDate,
      endDate: result.endDate,
      season: result.season,
      villaSlots: result.villaSlots,
      luxurySlots: result.luxurySlots,
      villaValue: result.villaValue,
      luxuryValue: result.luxuryValue,
      catamaranDays: result.catamaranDays,
      isActive: result.isActive,
    }
  }

  // Get cost in NFTs for a season
  async getSeasonCost(season: Season): Promise<bigint> {
    const contract = await this.getReadOnlyContract()
    return await contract.getSeasonCost(season)
  }

  // Book a vacation week using NFTs
  async bookVacationWeek(
    weekId: number,
    tokenIds: bigint[],
    guestName: string,
    contactInfo: string,
  ): Promise<ethers.ContractTransactionResponse> {
    const contract = await this.initializeContract()
    return await contract.bookVacationWeek(weekId, tokenIds, guestName, contactInfo)
  }

  // List NFTs for sale in marketplace
  async listNFTsForSale(
    tokenIds: bigint[],
    price: bigint,
    description: string,
  ): Promise<ethers.ContractTransactionResponse> {
    const contract = await this.initializeContract()
    return await contract.listNFTsForSale(tokenIds, price, description)
  }

  // Buy NFTs from marketplace
  async buyNFTsFromMarketplace(listingId: number, value: bigint): Promise<ethers.ContractTransactionResponse> {
    const contract = await this.initializeContract()
    return await contract.buyNFTsFromMarketplace(listingId, { value })
  }

  // Remove listing from marketplace
  async removeFromMarketplace(listingId: number): Promise<ethers.ContractTransactionResponse> {
    const contract = await this.initializeContract()
    return await contract.removeFromMarketplace(listingId)
  }

  // Admin: Create vacation week
  async createVacationWeek(
    startDate: number,
    endDate: number,
    season: Season,
    villaSlots: number,
    luxurySlots: number,
    villaValue: bigint,
    luxuryValue: bigint,
    catamaranDays: string,
  ): Promise<ethers.ContractTransactionResponse> {
    const contract = await this.initializeContract()
    return await contract.createVacationWeek(
      startDate,
      endDate,
      season,
      villaSlots,
      luxurySlots,
      villaValue,
      luxuryValue,
      catamaranDays,
    )
  }

  // Admin: Register investor and mint NFTs
  async registerInvestorAndMintNFTs(
    walletAddress: string,
    investmentAmount: bigint,
    investorName: string,
  ): Promise<ethers.ContractTransactionResponse> {
    const contract = await this.initializeContract()
    return await contract.registerInvestorAndMintNFTs(walletAddress, investmentAmount, investorName)
  }

  // Admin: Remove vacation week
  async removeVacationWeek(weekId: number): Promise<ethers.ContractTransactionResponse> {
    const contract = await this.initializeContract()
    return await contract.removeVacationWeek(weekId)
  }

  // Admin: Update season cost
  async updateSeasonCost(season: Season, nftCost: number): Promise<ethers.ContractTransactionResponse> {
    const contract = await this.initializeContract()
    return await contract.updateSeasonCost(season, nftCost)
  }

  // Helper function to get user's complete NFT portfolio
  async getUserNFTPortfolio(walletAddress: string): Promise<{
    availableNFTs: bigint[]
    nftDetails: VacationNFT[]
    totalNFTs: number
  }> {
    const availableNFTs = await this.getInvestorAvailableNFTs(walletAddress)
    const nftDetails: VacationNFT[] = []

    for (const tokenId of availableNFTs) {
      const details = await this.getVacationNFT(tokenId)
      nftDetails.push(details)
    }

    return {
      availableNFTs,
      nftDetails,
      totalNFTs: availableNFTs.length,
    }
  }

  // Helper function to check booking eligibility and get required info
  async checkBookingEligibility(
    walletAddress: string,
    weekId: number,
  ): Promise<{
    canBook: boolean
    message: string
    weekDetails: VacationWeek | null
    requiredNFTs: bigint | null
    availableNFTs: bigint[]
  }> {
    try {
      const [canBook, message] = await this.canBookWeek(walletAddress, weekId)

      if (!canBook) {
        return {
          canBook: false,
          message,
          weekDetails: null,
          requiredNFTs: null,
          availableNFTs: [],
        }
      }

      const weekDetails = await this.getVacationWeek(weekId)
      const requiredNFTs = await this.getSeasonCost(weekDetails.season)
      const availableNFTs = await this.getInvestorAvailableNFTs(walletAddress)

      return {
        canBook: true,
        message: "Prenotazione disponibile",
        weekDetails,
        requiredNFTs,
        availableNFTs,
      }
    } catch (error) {
      console.error("Errore nel controllo eligibilità:", error)
      return {
        canBook: false,
        message: "Errore nel controllo eligibilità",
        weekDetails: null,
        requiredNFTs: null,
        availableNFTs: [],
      }
    }
  }

  // Helper to get season name
  getSeasonName(season: number): string {
    switch (season) {
      case Season.Bassa:
        return "Bassa"
      case Season.BassaMedia:
        return "Bassa-Media"
      case Season.Media:
        return "Media"
      case Season.Alta:
        return "Alta"
      default:
        return "Sconosciuta"
    }
  }

  // Helper to format dates
  formatDate(timestamp: bigint): string {
    return new Date(Number(timestamp) * 1000).toLocaleDateString("it-IT")
  }

  // Helper to get all active vacation weeks from contract
  async getAllActiveVacationWeeks(): Promise<Array<VacationWeek & { weekId: number }>> {
    const activeWeeks: Array<VacationWeek & { weekId: number }> = []

    let weekId = 1
    let foundWeek = true

    while (foundWeek) {
      try {
        console.log(`[v0] Checking vacation week ${weekId}`)
        const weekDetails = await this.getVacationWeek(weekId)

        console.log(`weekdetails start date: ${weekDetails.startDate}`)

        // Check if this is an empty/non-existent week (startDate = 0)
        if (weekDetails.startDate === BigInt(0)) {
          console.log(`[v0] Week ${weekId} is empty (startDate = 0), stopping search`)
          foundWeek = false
          break
        }

        // Only include active weeks
        if (weekDetails.isActive) {
          console.log(`[v0] Found active vacation week ${weekId}:`, weekDetails)
          activeWeeks.push({
            ...weekDetails,
            weekId,
          })
        } else {
          console.log(`[v0] Week ${weekId} exists but is inactive`)
        }

        weekId++
      } catch (error) {
        // Week doesn't exist, stop the loop
        console.log(`[v0] Week ${weekId} not found, stopping search. Error:`, error)
        foundWeek = false
      }
    }

    console.log(`[v0] Found ${activeWeeks.length} active vacation weeks`)
    return activeWeeks
  }

  async approveNFT(tokenId: bigint): Promise<ethers.ContractTransactionResponse> {
    const contract = await this.initializeContract()
    return await contract.approve(PUGLIA_CONTRACT_ADDRESS, tokenId)
  }

  async approveMultipleNFTs(tokenIds: bigint[]): Promise<ethers.ContractTransactionResponse[]> {
    const transactions: ethers.ContractTransactionResponse[] = []

    for (const tokenId of tokenIds) {
      console.log(`[v0] Approving NFT ${tokenId}...`)
      const tx = await this.approveNFT(tokenId)
      transactions.push(tx)

      // Wait for each approval to be confirmed before proceeding
      await tx.wait()
      console.log(`[v0] NFT ${tokenId} approved successfully`)
    }

    return transactions
  }

  // Get booking by ID from bookings mapping
  async getBookingFromMapping(bookingId: number): Promise<{
    weekId: bigint
    booker: string
    bookingDate: bigint
    isUsed: boolean
    guestName: string
    contactInfo: string
    accommodationType: string
  }> {
    const contract = await this.getReadOnlyContract()
    const result = await contract.bookings(bookingId)

    return {
      weekId: result.weekId,
      booker: result.booker,
      bookingDate: result.bookingDate,
      isUsed: result.isUsed,
      guestName: result.guestName,
      contactInfo: result.contactInfo,
      accommodationType: result.accommodationType,
    }
  }

  // Get detailed booking information
  async getBooking(bookingId: number): Promise<Booking> {
    const contract = await this.getReadOnlyContract()
    const result = await contract.getBooking(bookingId)

    return {
      weekId: result.weekId,
      booker: result.booker,
      bookingDate: result.bookingDate,
      isUsed: result.isUsed,
      guestName: result.guestName,
      contactInfo: result.contactInfo,
      accommodationType: result.accommodationType,
    }
  }

  // Cancel a booking
  async cancelBooking(bookingId: number): Promise<ethers.ContractTransactionResponse> {
    const contract = await this.initializeContract()
    return await contract.cancelBooking(bookingId)
  }

  // Get all bookings for a specific user
  async getUserBookings(walletAddress: string): Promise<Array<Booking & { bookingId: number }>> {
    const userBookings: Array<Booking & { bookingId: number }> = []

    let bookingId = 1
    let foundBooking = true

    while (foundBooking) {
      try {
        console.log(`[v0] Checking booking ${bookingId}`)
        const booking = await this.getBookingFromMapping(bookingId)

        // Check if this is an empty booking (all values are 0/empty)
        if (
          booking.weekId === BigInt(0) &&
          booking.booker === "0x0000000000000000000000000000000000000000" &&
          booking.bookingDate === BigInt(0) &&
          !booking.isUsed &&
          booking.guestName === "" &&
          booking.contactInfo === "" &&
          booking.accommodationType === ""
        ) {
          console.log(`[v0] Booking ${bookingId} is empty, stopping search`)
          foundBooking = false
          break
        }

        // Only include bookings for this user
        if (booking.booker.toLowerCase() === walletAddress.toLowerCase()) {
          console.log(`[v0] Found user booking ${bookingId}:`, booking)

          // Get detailed booking info
          const detailedBooking = await this.getBooking(bookingId)
          userBookings.push({
            ...detailedBooking,
            bookingId,
          })
        }

        bookingId++
      } catch (error) {
        console.log(`[v0] Booking ${bookingId} not found, stopping search. Error:`, error)
        foundBooking = false
      }
    }

    console.log(`[v0] Found ${userBookings.length} bookings for user ${walletAddress}`)
    return userBookings
  }
}

// Export singleton instance
export const pugliaContract = new PugliaContractService()
