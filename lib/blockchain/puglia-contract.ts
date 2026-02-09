import { ethers } from "ethers"
import PUGLIA_VACATION_ABI from "./puglia-vacation-abi.json"

// Contract address on Polygon Mainnet
export const PUGLIA_CONTRACT_ADDRESS = "0x7e25b679935F8516BF1F8fC490D07F41F06d2945"

// V2 ABI imported from JSON
export const PUGLIA_CONTRACT_ABI = PUGLIA_VACATION_ABI

// ─── Types based on V2 smart contract structs ───

export interface TokenMetadata {
  availableVacations: bigint[]
  bookedVacations: bigint[]
  totalVacations: bigint
  usedVacations: bigint
  ownerName: string
  isActive: boolean
}

export interface Vacation {
  startDate: bigint
  endDate: bigint
  location: string
  isBooked: boolean
  bookedByToken: bigint
  bookingDate: bigint
}

export interface MarketListing {
  tokenId: bigint
  seller: string
  price: bigint
  isActive: boolean
  listingDate: bigint
}

// ─── Service class for V2 PugliaVacationNFT contract ───

export class PugliaContractService {
  private contract: ethers.Contract | null = null
  private provider: ethers.BrowserProvider | null = null

  // ─── Contract initialization ───

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
    if (!window.ethereum) {
      throw new Error("MetaMask non installato")
    }
    const provider = new ethers.BrowserProvider(window.ethereum)
    return new ethers.Contract(PUGLIA_CONTRACT_ADDRESS, PUGLIA_CONTRACT_ABI, provider)
  }

  // ─── Read-only: Token & Metadata ───

  async getTokenMetadata(tokenId: number): Promise<TokenMetadata> {
    const contract = await this.getReadOnlyContract()
    const result = await contract.getTokenMetadata(tokenId)

    return {
      availableVacations: [...result.availableVacations],
      bookedVacations: [...result.bookedVacations],
      totalVacations: result.totalVacations,
      usedVacations: result.usedVacations,
      ownerName: result.ownerName,
      isActive: result.isActive,
    }
  }

  async getTokenMetadataBasic(tokenId: number): Promise<{
    totalVacations: bigint
    usedVacations: bigint
    ownerName: string
    isActive: boolean
  }> {
    const contract = await this.getReadOnlyContract()
    const result = await contract.tokenMetadata(tokenId)

    return {
      totalVacations: result.totalVacations,
      usedVacations: result.usedVacations,
      ownerName: result.ownerName,
      isActive: result.isActive,
    }
  }

  async balanceOf(owner: string): Promise<bigint> {
    const contract = await this.getReadOnlyContract()
    return await contract.balanceOf(owner)
  }

  async ownerOf(tokenId: number): Promise<string> {
    const contract = await this.getReadOnlyContract()
    return await contract.ownerOf(tokenId)
  }

  async tokenURI(tokenId: number): Promise<string> {
    const contract = await this.getReadOnlyContract()
    return await contract.tokenURI(tokenId)
  }

  // ─── Read-only: Vacations ───

  async getVacation(vacationId: number): Promise<Vacation> {
    const contract = await this.getReadOnlyContract()
    const result = await contract.vacations(vacationId)

    return {
      startDate: result.startDate,
      endDate: result.endDate,
      location: result.location,
      isBooked: result.isBooked,
      bookedByToken: result.bookedByToken,
      bookingDate: result.bookingDate,
    }
  }

  async vacationExists(vacationId: number): Promise<boolean> {
    const contract = await this.getReadOnlyContract()
    return await contract.vacationExists(vacationId)
  }

  // ─── Read-only: Marketplace ───

  async getMarketListing(listingId: number): Promise<MarketListing> {
    const contract = await this.getReadOnlyContract()
    const result = await contract.marketListings(listingId)

    return {
      tokenId: result.tokenId,
      seller: result.seller,
      price: result.price,
      isActive: result.isActive,
      listingDate: result.listingDate,
    }
  }

  async getMarketplaceFee(): Promise<bigint> {
    const contract = await this.getReadOnlyContract()
    return await contract.marketplaceFee()
  }

  // ─── Read-only: Other ───

  async getCancellationDeadline(): Promise<bigint> {
    const contract = await this.getReadOnlyContract()
    return await contract.CANCELLATION_DEADLINE()
  }

  async getContractOwner(): Promise<string> {
    const contract = await this.getReadOnlyContract()
    return await contract.owner()
  }

  async getBaseMetadataURI(): Promise<string> {
    const contract = await this.getReadOnlyContract()
    return await contract.baseMetadataURI()
  }

  // ─── Write: User Actions ───

  async bookVacation(
    tokenId: number,
    vacationId: number,
  ): Promise<ethers.ContractTransactionResponse> {
    const contract = await this.initializeContract()
    return await contract.bookVacation(tokenId, vacationId)
  }

  async cancelBooking(
    tokenId: number,
    vacationId: number,
  ): Promise<ethers.ContractTransactionResponse> {
    const contract = await this.initializeContract()
    return await contract.cancelBooking(tokenId, vacationId)
  }

  // ─── Write: Marketplace ───

  async listTokenForSale(
    tokenId: number,
    price: bigint,
  ): Promise<ethers.ContractTransactionResponse> {
    const contract = await this.initializeContract()
    return await contract.listTokenForSale(tokenId, price)
  }

  async buyToken(
    listingId: number,
    value: bigint,
  ): Promise<ethers.ContractTransactionResponse> {
    const contract = await this.initializeContract()
    return await contract.buyToken(listingId, { value })
  }

  // ─── Write: ERC721 ───

  async approve(
    to: string,
    tokenId: number,
  ): Promise<ethers.ContractTransactionResponse> {
    const contract = await this.initializeContract()
    return await contract.approve(to, tokenId)
  }

  async setApprovalForAll(
    operator: string,
    approved: boolean,
  ): Promise<ethers.ContractTransactionResponse> {
    const contract = await this.initializeContract()
    return await contract.setApprovalForAll(operator, approved)
  }

  async transferFrom(
    from: string,
    to: string,
    tokenId: number,
  ): Promise<ethers.ContractTransactionResponse> {
    const contract = await this.initializeContract()
    return await contract.transferFrom(from, to, tokenId)
  }

  // ─── Write: Admin Actions ───

  async createVacation(
    startDate: number,
    endDate: number,
    location: string,
  ): Promise<ethers.ContractTransactionResponse> {
    const contract = await this.initializeContract()
    return await contract.createVacation(startDate, endDate, location)
  }

  async batchCreateVacations(
    startDates: number[],
    endDates: number[],
    locations: string[],
  ): Promise<ethers.ContractTransactionResponse> {
    const contract = await this.initializeContract()
    return await contract.batchCreateVacations(startDates, endDates, locations)
  }

  async mintVacationNFT(
    to: string,
    ownerName: string,
    availableVacationIds: number[],
  ): Promise<ethers.ContractTransactionResponse> {
    const contract = await this.initializeContract()
    return await contract.mintVacationNFT(to, ownerName, availableVacationIds)
  }

  async adminCancelBooking(
    vacationId: number,
  ): Promise<ethers.ContractTransactionResponse> {
    const contract = await this.initializeContract()
    return await contract.adminCancelBooking(vacationId)
  }

  async markVacationAsUsed(
    tokenId: number,
    vacationId: number,
  ): Promise<ethers.ContractTransactionResponse> {
    const contract = await this.initializeContract()
    return await contract.markVacationAsUsed(tokenId, vacationId)
  }

  async setBaseURI(
    newURI: string,
  ): Promise<ethers.ContractTransactionResponse> {
    const contract = await this.initializeContract()
    return await contract.setBaseURI(newURI)
  }

  async withdrawFees(): Promise<ethers.ContractTransactionResponse> {
    const contract = await this.initializeContract()
    return await contract.withdrawFees()
  }

  async transferOwnership(
    newOwner: string,
  ): Promise<ethers.ContractTransactionResponse> {
    const contract = await this.initializeContract()
    return await contract.transferOwnership(newOwner)
  }

  // ─── Helper: fetch multiple vacation details at once ───

  async getVacationDetails(vacationIds: bigint[]): Promise<Array<Vacation & { vacationId: number }>> {
    const results: Array<Vacation & { vacationId: number }> = []

    for (const id of vacationIds) {
      try {
        const vacation = await this.getVacation(Number(id))
        results.push({ ...vacation, vacationId: Number(id) })
      } catch (error) {
        console.error(`Error fetching vacation ${id}:`, error)
      }
    }

    return results
  }

  // ─── Helper: find all user tokens by scanning ───

  async getUserTokenIds(walletAddress: string): Promise<number[]> {
    const balance = await this.balanceOf(walletAddress)
    const tokenIds: number[] = []

    // Scan token IDs starting from 0
    let found = 0
    let tokenId = 0
    const maxScan = 1000

    while (found < Number(balance) && tokenId <= maxScan) {
      try {
        const owner = await this.ownerOf(tokenId)
        if (owner.toLowerCase() === walletAddress.toLowerCase()) {
          tokenIds.push(tokenId)
          found++
        }
      } catch {
        // Token doesn't exist, continue
      }
      tokenId++
    }

    return tokenIds
  }

  // ─── Helper: get full user portfolio with metadata ───

  async getUserPortfolio(walletAddress: string): Promise<{
    tokenIds: number[]
    metadata: Map<number, TokenMetadata>
    totalAvailableWeeks: number
    totalBookedWeeks: number
    totalUsedWeeks: number
  }> {
    const tokenIds = await this.getUserTokenIds(walletAddress)
    const metadata = new Map<number, TokenMetadata>()
    let totalAvailableWeeks = 0
    let totalBookedWeeks = 0
    let totalUsedWeeks = 0

    for (const tokenId of tokenIds) {
      const meta = await this.getTokenMetadata(tokenId)
      metadata.set(tokenId, meta)
      totalAvailableWeeks += meta.availableVacations.length
      totalBookedWeeks += meta.bookedVacations.length
      totalUsedWeeks += Number(meta.usedVacations)
    }

    return {
      tokenIds,
      metadata,
      totalAvailableWeeks,
      totalBookedWeeks,
      totalUsedWeeks,
    }
  }

  // ─── Helper: format helpers ───

  formatDate(timestamp: bigint): string {
    return new Date(Number(timestamp) * 1000).toLocaleDateString("it-IT")
  }

  formatDateLong(timestamp: bigint): string {
    return new Date(Number(timestamp) * 1000).toLocaleDateString("it-IT", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }
}

// Export singleton instance
export const pugliaContract = new PugliaContractService()
