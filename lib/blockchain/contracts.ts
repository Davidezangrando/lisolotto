import { ethers } from "ethers"
import { BlockchainConfigService } from "./config"
import { walletService } from "./wallet"

export interface VacationNFT {
  tokenId: string
  owner: string
  ownerName: string
  totalVacations: number
  usedVacations: number
  availableVacations: number[]
  bookedVacations: number[]
  isActive: boolean
  metadata: {
    name: string
    description: string
    image: string
    attributes: any[]
  }
}

export interface Vacation {
  vacationId: string
  startDate: number
  endDate: number
  location: string
  isBooked: boolean
  bookedByToken?: string
  bookingDate?: number
}

export interface MarketListing {
  listingId: string
  tokenId: string
  seller: string
  price: string // in wei
  isActive: boolean
  listingDate: number
}

export interface ContractTransaction {
  hash: string
  status: "pending" | "confirmed" | "failed"
  gasUsed?: string
  blockNumber?: number
}

export class PugliaVacationContractService {
  private static contract: ethers.Contract | null = null

  private static getContract(): ethers.Contract | null {
    const config = BlockchainConfigService.getConfig()
    const walletState = walletService.getState()

    if (!config.contracts.nftContract.isDeployed || !walletState.provider) {
      return null
    }

    if (!this.contract) {
      this.contract = new ethers.Contract(
        config.contracts.nftContract.address,
        config.contracts.nftContract.abi,
        walletState.provider,
      )
    }

    return this.contract
  }

  static async getUserNFTs(userAddress: string): Promise<VacationNFT[]> {
    const config = BlockchainConfigService.getConfig()

    if (!config.contracts.nftContract.isDeployed) {
      return [] // Return empty array in mock mode
    }

    try {
      const contract = this.getContract()
      if (!contract) return []

      const balance = await contract.balanceOf(userAddress)
      const nfts: VacationNFT[] = []

      // Get all token IDs owned by user (we'll need to iterate through possible token IDs)
      // This is a simplified approach - in production you might want to use events or indexing
      for (let i = 1; i <= 1000; i++) {
        // Assuming max 1000 tokens
        try {
          const owner = await contract.ownerOf(i)
          if (owner.toLowerCase() === userAddress.toLowerCase()) {
            const metadata = await contract.getTokenMetadata(i)
            const tokenURI = await contract.tokenURI(i)

            nfts.push({
              tokenId: i.toString(),
              owner: userAddress,
              ownerName: metadata.ownerName,
              totalVacations: metadata.totalVacations.toNumber(),
              usedVacations: metadata.usedVacations.toNumber(),
              availableVacations: metadata.availableVacations.map((v: any) => v.toNumber()),
              bookedVacations: metadata.bookedVacations.map((v: any) => v.toNumber()),
              isActive: metadata.isActive,
              metadata: {
                name: `Puglia Luxury Vacation NFT #${i}`,
                description: "Villa luxury in Puglia - NFT per vacanze esclusive",
                image: tokenURI,
                attributes: [],
              },
            })
          }
        } catch {
          // Token doesn't exist or not owned by user, continue
          continue
        }
      }

      return nfts
    } catch (error) {
      console.error("Error fetching user NFTs:", error)
      return []
    }
  }

  static async getAvailableVacations(tokenId: string): Promise<Vacation[]> {
    const config = BlockchainConfigService.getConfig()

    if (!config.contracts.nftContract.isDeployed) {
      return []
    }

    try {
      const contract = this.getContract()
      if (!contract) return []

      const vacationIds = await contract.getAvailableVacationsForToken(tokenId)
      const vacations: Vacation[] = []

      for (const vacationId of vacationIds) {
        const vacation = await contract.getVacation(vacationId)
        vacations.push({
          vacationId: vacationId.toString(),
          startDate: vacation.startDate.toNumber(),
          endDate: vacation.endDate.toNumber(),
          location: vacation.location,
          isBooked: vacation.isBooked,
          bookedByToken: vacation.bookedByToken.toString(),
          bookingDate: vacation.bookingDate.toNumber(),
        })
      }

      return vacations
    } catch (error) {
      console.error("Error fetching available vacations:", error)
      return []
    }
  }

  static async bookVacation(
    tokenId: string,
    vacationId: string,
  ): Promise<{ success: boolean; transaction?: ContractTransaction; error?: string }> {
    const config = BlockchainConfigService.getConfig()

    if (!config.contracts.nftContract.isDeployed) {
      // Mock transaction for development
      await new Promise((resolve) => setTimeout(resolve, 2000))
      return {
        success: true,
        transaction: {
          hash: `0x${Math.random().toString(16).substr(2, 64)}`,
          status: "confirmed",
          gasUsed: "150000",
          blockNumber: Math.floor(Math.random() * 1000000),
        },
      }
    }

    try {
      const contract = this.getContract()
      if (!contract) {
        return { success: false, error: "Contract not available" }
      }

      const walletState = walletService.getState()
      const signer = await walletState.provider!.getSigner()
      const contractWithSigner = contract.connect(signer)

      const tx = await contractWithSigner.bookVacation(tokenId, vacationId)
      const receipt = await tx.wait()

      return {
        success: true,
        transaction: {
          hash: tx.hash,
          status: "confirmed",
          gasUsed: receipt.gasUsed.toString(),
          blockNumber: receipt.blockNumber,
        },
      }
    } catch (error: any) {
      return { success: false, error: error.message || "Booking failed" }
    }
  }

  static async listTokenForSale(
    tokenId: string,
    priceInEth: number,
  ): Promise<{ success: boolean; transaction?: ContractTransaction; error?: string }> {
    const config = BlockchainConfigService.getConfig()

    if (!config.contracts.marketplaceContract.isDeployed) {
      // Mock transaction
      await new Promise((resolve) => setTimeout(resolve, 1500))
      return {
        success: true,
        transaction: {
          hash: `0x${Math.random().toString(16).substr(2, 64)}`,
          status: "confirmed",
        },
      }
    }

    try {
      const contract = this.getContract()
      if (!contract) {
        return { success: false, error: "Contract not available" }
      }

      const walletState = walletService.getState()
      const signer = await walletState.provider!.getSigner()
      const contractWithSigner = contract.connect(signer)

      const priceInWei = ethers.parseEther(priceInEth.toString())
      const tx = await contractWithSigner.listTokenForSale(tokenId, priceInWei)
      const receipt = await tx.wait()

      return {
        success: true,
        transaction: {
          hash: tx.hash,
          status: "confirmed",
          gasUsed: receipt.gasUsed.toString(),
          blockNumber: receipt.blockNumber,
        },
      }
    } catch (error: any) {
      return { success: false, error: error.message || "Listing failed" }
    }
  }

  static async buyToken(
    listingId: string,
    priceInEth: number,
  ): Promise<{ success: boolean; transaction?: ContractTransaction; error?: string }> {
    const config = BlockchainConfigService.getConfig()

    if (!config.contracts.marketplaceContract.isDeployed) {
      // Mock transaction for development
      await new Promise((resolve) => setTimeout(resolve, 2000))
      return {
        success: true,
        transaction: {
          hash: `0x${Math.random().toString(16).substr(2, 64)}`,
          status: "confirmed",
          gasUsed: "200000",
          blockNumber: Math.floor(Math.random() * 1000000),
        },
      }
    }

    try {
      const contract = this.getContract()
      if (!contract) {
        return { success: false, error: "Contract not available" }
      }

      const walletState = walletService.getState()
      const signer = await walletState.provider!.getSigner()
      const contractWithSigner = contract.connect(signer)

      const priceInWei = ethers.parseEther(priceInEth.toString())
      const tx = await contractWithSigner.buyToken(listingId, { value: priceInWei })
      const receipt = await tx.wait()

      return {
        success: true,
        transaction: {
          hash: tx.hash,
          status: "confirmed",
          gasUsed: receipt.gasUsed.toString(),
          blockNumber: receipt.blockNumber,
        },
      }
    } catch (error: any) {
      return { success: false, error: error.message || "Purchase failed" }
    }
  }

  static async mintVacationNFT(
    recipientAddress: string,
    ownerName: string,
    availableVacationIds: number[],
  ): Promise<{ success: boolean; transaction?: ContractTransaction; error?: string }> {
    const config = BlockchainConfigService.getConfig()

    if (!config.contracts.nftContract.isDeployed) {
      // Mock transaction
      await new Promise((resolve) => setTimeout(resolve, 2000))
      return {
        success: true,
        transaction: {
          hash: `0x${Math.random().toString(16).substr(2, 64)}`,
          status: "confirmed",
        },
      }
    }

    try {
      const contract = this.getContract()
      if (!contract) {
        return { success: false, error: "Contract not available" }
      }

      const walletState = walletService.getState()
      const signer = await walletState.provider!.getSigner()
      const contractWithSigner = contract.connect(signer)

      const tx = await contractWithSigner.mintVacationNFT(recipientAddress, ownerName, availableVacationIds)
      const receipt = await tx.wait()

      return {
        success: true,
        transaction: {
          hash: tx.hash,
          status: "confirmed",
          gasUsed: receipt.gasUsed.toString(),
          blockNumber: receipt.blockNumber,
        },
      }
    } catch (error: any) {
      return { success: false, error: error.message || "Minting failed" }
    }
  }

  static async createVacation(
    startDate: number,
    endDate: number,
    location: string,
  ): Promise<{ success: boolean; transaction?: ContractTransaction; error?: string }> {
    const config = BlockchainConfigService.getConfig()

    if (!config.contracts.nftContract.isDeployed) {
      // Mock transaction
      await new Promise((resolve) => setTimeout(resolve, 1500))
      return {
        success: true,
        transaction: {
          hash: `0x${Math.random().toString(16).substr(2, 64)}`,
          status: "confirmed",
        },
      }
    }

    try {
      const contract = this.getContract()
      if (!contract) {
        return { success: false, error: "Contract not available" }
      }

      const walletState = walletService.getState()
      const signer = await walletState.provider!.getSigner()
      const contractWithSigner = contract.connect(signer)

      const tx = await contractWithSigner.createVacation(startDate, endDate, location)
      const receipt = await tx.wait()

      return {
        success: true,
        transaction: {
          hash: tx.hash,
          status: "confirmed",
          gasUsed: receipt.gasUsed.toString(),
          blockNumber: receipt.blockNumber,
        },
      }
    } catch (error: any) {
      return { success: false, error: error.message || "Vacation creation failed" }
    }
  }
}

export { PugliaVacationContractService as NFTContractService }
export { PugliaVacationContractService as MarketplaceContractService }
