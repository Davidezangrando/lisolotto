"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { NFTService, type PugliaVacationNFT } from "@/lib/nft"
import { useAuth } from "@/hooks/use-auth"
import { WalletConnect } from "@/components/blockchain/wallet-connect"
import { useWallet } from "@/lib/blockchain/wallet"

export default function DashboardPage() {
  const [ownedNfts, setOwnedNfts] = useState<PugliaVacationNFT[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user, logout } = useAuth()
  const { walletAddress, isConnected } = useWallet()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push("/auth")
    }
  }, [user, router])

  useEffect(() => {
    async function loadUserNFTs() {
      if (!isConnected || !walletAddress) {
        console.log("[v0] Wallet not connected, skipping NFT load")
        setOwnedNfts([])
        setLoading(false)
        return
      }

      try {
        console.log("[v0] Loading NFTs for wallet:", walletAddress)
        setLoading(true)
        setError(null)

        const nfts = await NFTService.getUserAvailableNFTs(walletAddress)
        console.log("[v0] Loaded NFTs:", nfts)

        setOwnedNfts(nfts)
      } catch (err) {
        console.error("[v0] Error loading NFTs:", err)
        setError("Errore nel caricamento degli NFT")
        setOwnedNfts([])
      } finally {
        setLoading(false)
      }
    }

    loadUserNFTs()
  }, [walletAddress, isConnected])

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Redirecting to login...</p>
      </div>
    )
  }

  const totalNFTs = ownedNfts.length
  const activeNFTs = ownedNfts.filter((nft) => nft.isActive && !nft.isUsed).length
  const usedNFTs = ownedNfts.filter((nft) => nft.isUsed).length

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-primary">Welcome back, {user.name}</h1>
              <p className="text-muted-foreground mt-1">Manage your Puglia Vacation NFT portfolio</p>
            </div>
            <div className="flex gap-4">
              <Button variant="outline" onClick={() => router.push("/marketplace")}>
                Browse Marketplace
              </Button>
              <Button variant="outline" onClick={() => router.push("/bookings")}>
                Book Vacations
              </Button>
              <Button variant="outline" onClick={() => router.push("/manage-booking")}>
                Manage My Bookings
              </Button>
              <Button variant="outline" onClick={logout}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="nfts">My NFTs ({totalNFTs})</TabsTrigger>
            <TabsTrigger value="bookings">Vacation Access</TabsTrigger>
            <TabsTrigger value="wallet">Wallet</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Total NFTs</CardDescription>
                  <CardTitle className="text-2xl text-primary">{totalNFTs}/8</CardTitle>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Available NFTs</CardDescription>
                  <CardTitle className="text-2xl text-primary">{activeNFTs}</CardTitle>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Used NFTs</CardDescription>
                  <CardTitle className="text-2xl text-primary">{usedNFTs}</CardTitle>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Wallet Status</CardDescription>
                  <CardTitle className="text-lg">
                    <Badge variant={isConnected ? "default" : "secondary"}>
                      {isConnected ? "Connected" : "Disconnected"}
                    </Badge>
                  </CardTitle>
                </CardHeader>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Your NFT Portfolio</CardTitle>
                <CardDescription>Your Puglia Vacation NFTs and their status</CardDescription>
              </CardHeader>
              <CardContent>
                {!isConnected ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">Connect your wallet to view your NFTs</p>
                    <WalletConnect />
                  </div>
                ) : loading ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Loading your NFTs...</p>
                  </div>
                ) : error ? (
                  <div className="text-center py-8">
                    <p className="text-red-500 mb-4">{error}</p>
                    <Button onClick={() => window.location.reload()}>Retry</Button>
                  </div>
                ) : totalNFTs === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">No NFTs found for this wallet</p>
                    <p className="text-sm text-muted-foreground mb-4">Contact admin if you should have NFTs assigned</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {ownedNfts.slice(0, 3).map((nft) => (
                      <div key={nft.tokenId} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">NFT #{nft.nftNumber}</p>
                          <p className="text-sm text-muted-foreground">
                            {nft.accommodationType} • Issued: {nft.issueDate}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge variant={nft.isUsed ? "secondary" : nft.isActive ? "default" : "outline"}>
                            {nft.isUsed ? "Used" : nft.isActive ? "Available" : "Inactive"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                    {totalNFTs > 3 && (
                      <p className="text-sm text-muted-foreground text-center">And {totalNFTs - 3} more NFTs...</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="nfts" className="space-y-6">
            {!isConnected ? (
              <Card>
                <CardContent className="text-center py-12">
                  <p className="text-muted-foreground mb-4">Connect your wallet to view your NFTs</p>
                  <WalletConnect />
                </CardContent>
              </Card>
            ) : loading ? (
              <Card>
                <CardContent className="text-center py-12">
                  <p className="text-muted-foreground">Loading your NFTs...</p>
                </CardContent>
              </Card>
            ) : error ? (
              <Card>
                <CardContent className="text-center py-12">
                  <p className="text-red-500 mb-4">{error}</p>
                  <Button onClick={() => window.location.reload()}>Retry</Button>
                </CardContent>
              </Card>
            ) : totalNFTs === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <p className="text-muted-foreground mb-4">No NFTs found for this wallet</p>
                  <p className="text-sm text-muted-foreground">Contact admin if you should have NFTs assigned</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ownedNfts.map((nft) => (
                  <Card key={nft.tokenId}>
                    <CardHeader>
                      <CardTitle className="flex justify-between items-center">
                        <span>NFT #{nft.nftNumber}</span>
                        <Badge variant={nft.isUsed ? "secondary" : nft.isActive ? "default" : "outline"}>
                          {nft.isUsed ? "Used" : nft.isActive ? "Available" : "Inactive"}
                        </Badge>
                      </CardTitle>
                      <CardDescription>{nft.accommodationType}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Token ID:</span>
                          <span>{nft.tokenId}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Issue Date:</span>
                          <span>{nft.issueDate}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Investor ID:</span>
                          <span>{nft.investorId}</span>
                        </div>
                        {nft.assignedWeekId && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Assigned Week:</span>
                            <span>{nft.assignedWeekId}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="bookings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Vacation Access Summary</CardTitle>
                <CardDescription>Your available NFTs for booking luxury vacations in Puglia</CardDescription>
              </CardHeader>
              <CardContent>
                {!isConnected ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">Connect your wallet to view vacation access</p>
                    <WalletConnect />
                  </div>
                ) : totalNFTs === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">No vacation access available</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Contact admin to get your investor NFTs assigned
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="text-center p-4 border rounded-lg">
                        <p className="text-2xl font-bold text-primary">{activeNFTs}</p>
                        <p className="text-sm text-muted-foreground">Available for Booking</p>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <p className="text-2xl font-bold text-primary">{usedNFTs}</p>
                        <p className="text-sm text-muted-foreground">Already Used</p>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <p className="text-2xl font-bold text-primary">{totalNFTs}</p>
                        <p className="text-sm text-muted-foreground">Total NFTs</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="font-semibold">Season Booking Power</h4>
                        <div className="flex gap-2">
                          <Button onClick={() => router.push("/bookings")}>Book Now</Button>
                          <Button variant="outline" onClick={() => router.push("/manage-booking")}>
                            Manage Bookings
                          </Button>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="p-4 border rounded-lg">
                          <h5 className="font-medium mb-2">Stagione Bassa (1 NFT)</h5>
                          <p className="text-sm text-muted-foreground mb-2">Novembre - Marzo</p>
                          <Badge variant={activeNFTs >= 1 ? "default" : "secondary"}>
                            {activeNFTs >= 1 ? "Available" : "Not Available"}
                          </Badge>
                        </div>

                        <div className="p-4 border rounded-lg">
                          <h5 className="font-medium mb-2">Stagione Bassa-Media (2 NFT)</h5>
                          <p className="text-sm text-muted-foreground mb-2">Fine Maggio, Settembre</p>
                          <Badge variant={activeNFTs >= 2 ? "default" : "secondary"}>
                            {activeNFTs >= 2 ? "Available" : "Not Available"}
                          </Badge>
                        </div>

                        <div className="p-4 border rounded-lg">
                          <h5 className="font-medium mb-2">Stagione Media (3 NFT)</h5>
                          <p className="text-sm text-muted-foreground mb-2">Giugno, Settembre</p>
                          <Badge variant={activeNFTs >= 3 ? "default" : "secondary"}>
                            {activeNFTs >= 3 ? "Available" : "Not Available"}
                          </Badge>
                        </div>

                        <div className="p-4 border rounded-lg">
                          <h5 className="font-medium mb-2">Stagione Alta (4 NFT)</h5>
                          <p className="text-sm text-muted-foreground mb-2">Luglio - Agosto</p>
                          <Badge variant={activeNFTs >= 4 ? "default" : "secondary"}>
                            {activeNFTs >= 4 ? "Available" : "Not Available"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="wallet" className="space-y-6">
            <div className="flex justify-center">
              <WalletConnect />
            </div>
            {isConnected && walletAddress && (
              <Card>
                <CardHeader>
                  <CardTitle>Wallet Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Address:</span>
                      <span className="font-mono text-sm">{walletAddress}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Network:</span>
                      <span>Polygon Mainnet</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">NFTs Found:</span>
                      <span>{totalNFTs}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
