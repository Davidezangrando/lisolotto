"use client"

import { ethers } from "ethers"
import { useState, useEffect } from "react"

export interface WalletState {
  isConnected: boolean
  address: string | null
  balance: string | null
  chainId: number | null
  provider: ethers.BrowserProvider | null
}

export class WalletService {
  private static instance: WalletService
  private state: WalletState = {
    isConnected: false,
    address: null,
    balance: null,
    chainId: null,
    provider: null,
  }
  private listeners: ((state: WalletState) => void)[] = []

  static getInstance(): WalletService {
    if (!WalletService.instance) {
      WalletService.instance = new WalletService()
    }
    return WalletService.instance
  }

  subscribe(listener: (state: WalletState) => void): () => void {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener)
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener(this.state))
  }

  async connectWallet(): Promise<{ success: boolean; error?: string }> {
    if (typeof window === "undefined" || !window.ethereum) {
      return { success: false, error: "MetaMask not installed" }
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const network = await provider.getNetwork()

      if (Number(network.chainId) !== 137) {
        // Try to switch to Polygon Mainnet
        const switchResult = await this.switchToPolygon()
        if (!switchResult.success) {
          return { success: false, error: "Please switch to Polygon Mainnet" }
        }
      }

      const accounts = await provider.send("eth_requestAccounts", [])

      if (accounts.length === 0) {
        return { success: false, error: "No accounts found" }
      }

      const signer = await provider.getSigner()
      const address = await signer.getAddress()
      const balance = await provider.getBalance(address)
      const updatedNetwork = await provider.getNetwork()

      this.state = {
        isConnected: true,
        address,
        balance: ethers.formatEther(balance),
        chainId: Number(updatedNetwork.chainId),
        provider,
      }

      this.notifyListeners()
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message || "Failed to connect wallet" }
    }
  }

  async disconnectWallet(): Promise<void> {
    this.state = {
      isConnected: false,
      address: null,
      balance: null,
      chainId: null,
      provider: null,
    }
    this.notifyListeners()
  }

  getState(): WalletState {
    return { ...this.state }
  }

  async switchToPolygon(): Promise<{ success: boolean; error?: string }> {
    if (!window.ethereum) {
      return { success: false, error: "MetaMask not available" }
    }

    try {
      // Try to switch to Polygon Mainnet
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x89" }], // 137 in hex
      })
      return { success: true }
    } catch (switchError: any) {
      // If the chain hasn't been added to MetaMask, add it
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: "0x89",
                chainName: "Polygon Mainnet",
                nativeCurrency: {
                  name: "MATIC",
                  symbol: "MATIC",
                  decimals: 18,
                },
                rpcUrls: ["https://polygon-rpc.com/"],
                blockExplorerUrls: ["https://polygonscan.com/"],
              },
            ],
          })
          return { success: true }
        } catch (addError: any) {
          return { success: false, error: "Failed to add Polygon network" }
        }
      }
      return { success: false, error: switchError.message || "Failed to switch to Polygon" }
    }
  }

  async switchNetwork(chainId: number): Promise<{ success: boolean; error?: string }> {
    if (!window.ethereum) {
      return { success: false, error: "MetaMask not available" }
    }

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      })
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message || "Failed to switch network" }
    }
  }

  async getBalance(address?: string): Promise<string | null> {
    if (!this.state.provider) return null

    try {
      const targetAddress = address || this.state.address
      if (!targetAddress) return null

      const balance = await this.state.provider.getBalance(targetAddress)
      return ethers.formatEther(balance)
    } catch {
      return null
    }
  }
}

// Global wallet instance
export const walletService = WalletService.getInstance()

export function useWallet() {
  const [walletState, setWalletState] = useState<WalletState>(() => walletService.getState())

  useEffect(() => {
    // Subscribe to wallet state changes
    const unsubscribe = walletService.subscribe((newState) => {
      setWalletState(newState)
    })

    // Check if wallet is already connected on mount
    const checkConnection = async () => {
      if (typeof window !== "undefined" && window.ethereum) {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum)
          const accounts = await provider.listAccounts()

          if (accounts.length > 0) {
            // Auto-connect if already authorized
            await walletService.connectWallet()
          }
        } catch (error) {
          console.log("[v0] Auto-connect failed:", error)
        }
      }
    }

    checkConnection()

    return unsubscribe
  }, [])

  const connectWallet = async () => {
    return await walletService.connectWallet()
  }

  const disconnectWallet = async () => {
    await walletService.disconnectWallet()
  }

  const switchToPolygon = async () => {
    return await walletService.switchToPolygon()
  }

  return {
    // State
    isConnected: walletState.isConnected,
    walletAddress: walletState.address,
    balance: walletState.balance,
    chainId: walletState.chainId,
    provider: walletState.provider,

    // Actions
    connectWallet,
    disconnectWallet,
    switchToPolygon,

    // Computed
    isPolygon: walletState.chainId === 137,
  }
}
