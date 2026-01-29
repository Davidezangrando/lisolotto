"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { PurchaseModal } from "./purchase-modal"
import { type NFT, NFTService } from "@/lib/nft"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"

interface NFTCardProps {
  nft: NFT
  showPurchaseButton?: boolean
  isOwned?: boolean
  onPurchaseSuccess?: () => void
}

export function NFTCard({ nft, showPurchaseButton = true, isOwned = false, onPurchaseSuccess }: NFTCardProps) {
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()

  const seasonInfo = NFTService.getSeasonInfo(nft.season)

  const handlePurchaseClick = () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to purchase NFTs",
        variant: "destructive",
      })
      return
    }
    setShowPurchaseModal(true)
  }

  const handlePurchaseSuccess = () => {
    setShowPurchaseModal(false)
    onPurchaseSuccess?.()
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "legendary":
        return "bg-gradient-to-r from-yellow-400 to-orange-500"
      case "rare":
        return "bg-gradient-to-r from-purple-400 to-pink-500"
      default:
        return "bg-gradient-to-r from-blue-400 to-cyan-500"
    }
  }

  return (
    <>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        <div className="relative">
          <Image
            src={nft.image || "/placeholder.svg"}
            alt={nft.title}
            width={400}
            height={300}
            className="w-full h-48 object-cover"
          />
          <div className="absolute top-2 left-2">
            <Badge className={seasonInfo.color + " " + seasonInfo.bgColor}>{seasonInfo.name}</Badge>
          </div>
          <div className="absolute top-2 right-2">
            <Badge className={`text-white ${getRarityColor(nft.metadata.rarity)}`}>{nft.metadata.rarity}</Badge>
          </div>
          {isOwned && (
            <div className="absolute bottom-2 right-2">
              <Badge variant="secondary">Owned</Badge>
            </div>
          )}
        </div>

        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg">{nft.title}</CardTitle>
              <CardDescription className="text-sm mt-1">{nft.description}</CardDescription>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary">{nft.price} ETH</p>
              <p className="text-xs text-muted-foreground">
                {nft.availableSupply}/{nft.totalSupply} available
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold text-sm mb-2">Catamaran Access</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Days:</span> {nft.catamaranAccess.daysIncluded}
              </div>
              <div>
                <span className="text-muted-foreground">Max Guests:</span> {nft.catamaranAccess.maxGuests}
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{nft.catamaranAccess.seasonRestrictions}</p>
          </div>

          <Separator />

          <div>
            <h4 className="font-semibold text-sm mb-2">Benefits</h4>
            <ul className="text-xs space-y-1">
              {nft.benefits.slice(0, 3).map((benefit, index) => (
                <li key={index} className="flex items-center">
                  <span className="w-1 h-1 bg-accent rounded-full mr-2"></span>
                  {benefit}
                </li>
              ))}
              {nft.benefits.length > 3 && (
                <li className="text-muted-foreground">+{nft.benefits.length - 3} more benefits</li>
              )}
            </ul>
          </div>

          {showPurchaseButton && !isOwned && (
            <Button onClick={handlePurchaseClick} disabled={nft.availableSupply <= 0} className="w-full">
              {nft.availableSupply <= 0 ? "Sold Out" : "Purchase NFT"}
            </Button>
          )}
        </CardContent>
      </Card>

      <PurchaseModal
        nft={nft}
        isOpen={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
        onSuccess={handlePurchaseSuccess}
      />
    </>
  )
}
