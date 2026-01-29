"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { walletService, type WalletState } from "@/lib/blockchain/wallet"
import { BlockchainConfigService } from "@/lib/blockchain/config"

export function WalletConnect() {
  const [walletState, setWalletState] = useState<WalletState>(walletService.getState())
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribe = walletService.subscribe(setWalletState)
    return unsubscribe
  }, [])

  const handleConnect = async () => {
    setIsConnecting(true)
    setError(null)

    const result = await walletService.connectWallet()

    if (!result.success) {
      setError(result.error || "Failed to connect wallet")
    }

    setIsConnecting(false)
  }

  const handleDisconnect = async () => {
    await walletService.disconnectWallet()
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const blockchainStatus = BlockchainConfigService.getConnectionStatus()

  if (walletState.isConnected) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Wallet Connected
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Connected
            </Badge>
          </CardTitle>
          <CardDescription>Your Web3 wallet is connected and ready</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Address:</span>
              <span className="font-mono">{formatAddress(walletState.address!)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Balance:</span>
              <span className="font-semibold">{Number.parseFloat(walletState.balance!).toFixed(4)} ETH</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Network:</span>
              <span>Chain ID {walletState.chainId}</span>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Blockchain Status</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${blockchainStatus.hasNFTContract ? "bg-green-500" : "bg-red-500"}`}
                />
                NFT Contract
              </div>
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    blockchainStatus.hasMarketplaceContract ? "bg-green-500" : "bg-red-500"
                  }`}
                />
                Marketplace
              </div>
            </div>
          </div>

          {!blockchainStatus.isReady && (
            <Alert>
              <AlertDescription className="text-xs">
                Smart contracts not configured. The platform is running in mock mode.
              </AlertDescription>
            </Alert>
          )}

          <Button variant="outline" onClick={handleDisconnect} className="w-full bg-transparent">
            Disconnect Wallet
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Connect Wallet</CardTitle>
        <CardDescription>Connect your Web3 wallet to interact with NFTs</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Alert>
          <AlertDescription className="text-xs">
            {blockchainStatus.isReady
              ? "Smart contracts are configured and ready for blockchain interactions."
              : "Platform is running in mock mode. Connect wallet to prepare for blockchain integration."}
          </AlertDescription>
        </Alert>

        <Button onClick={handleConnect} disabled={isConnecting} className="w-full">
          {isConnecting ? "Connecting..." : "Connect MetaMask"}
        </Button>

        <div className="text-xs text-muted-foreground text-center">
          Make sure you have MetaMask installed and are on the correct network
        </div>
      </CardContent>
    </Card>
  )
}
