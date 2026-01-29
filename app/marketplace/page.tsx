"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { NFTCard } from "@/components/nft/nft-card"
import { NFTFilters } from "@/components/nft/nft-filters"
import { Button } from "@/components/ui/button"
import { type NFT, NFTService, type Season } from "@/lib/nft"
import { useAuth } from "@/hooks/use-auth"

export default function MarketplacePage() {
  const [nfts, setNfts] = useState<NFT[]>([])
  const [filteredNfts, setFilteredNfts] = useState<NFT[]>([])
  const [selectedSeason, setSelectedSeason] = useState<Season | "all">("all")
  const [selectedRarity, setSelectedRarity] = useState<string | "all">("all")
  const { isAuthenticated, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const allNfts = NFTService.getAllNFTs()
    setNfts(allNfts)
    setFilteredNfts(allNfts)
  }, [])

  useEffect(() => {
    let filtered = nfts

    if (selectedSeason !== "all") {
      filtered = filtered.filter((nft) => nft.season === selectedSeason)
    }

    if (selectedRarity !== "all") {
      filtered = filtered.filter((nft) => nft.metadata.rarity === selectedRarity)
    }

    setFilteredNfts(filtered)
  }, [nfts, selectedSeason, selectedRarity])

  const handlePurchaseSuccess = () => {
    const allNfts = NFTService.getAllNFTs()
    setNfts(allNfts)
    setFilteredNfts(
      allNfts.filter((nft) => {
        if (selectedSeason !== "all" && nft.season !== selectedSeason) return false
        if (selectedRarity !== "all" && nft.metadata.rarity !== selectedRarity) return false
        return true
      }),
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-primary mb-4">Access Required</h1>
          <p className="text-muted-foreground mb-6">Please log in to view the NFT marketplace</p>
          <Button onClick={() => router.push("/auth")}>Sign In</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-primary">NFT Marketplace</h1>
              <p className="text-muted-foreground mt-1">Discover exclusive catamaran NFT collections</p>
            </div>
            <div className="flex gap-4">
              <Button variant="outline" onClick={() => router.push("/dashboard")}>
                My Dashboard
              </Button>
              {user?.role === "admin" && (
                <Button variant="outline" onClick={() => router.push("/admin")}>
                  Admin Panel
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <NFTFilters
              selectedSeason={selectedSeason}
              onSeasonChange={setSelectedSeason}
              selectedRarity={selectedRarity}
              onRarityChange={setSelectedRarity}
            />
          </div>

          {/* NFT Grid */}
          <div className="lg:col-span-3">
            <div className="flex justify-between items-center mb-6">
              <p className="text-muted-foreground">
                Showing {filteredNfts.length} of {nfts.length} NFTs
              </p>
            </div>

            {filteredNfts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No NFTs match your current filters</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredNfts.map((nft) => (
                  <NFTCard key={nft.id} nft={nft} onPurchaseSuccess={handlePurchaseSuccess} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
