"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { type NFT, NFTService } from "@/lib/nft"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"

interface PurchaseModalProps {
  nft: NFT
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

interface PurchaseData {
  fullName: string
  email: string
  phone: string
  address: string
  city: string
  country: string
  emergencyContact: string
  emergencyPhone: string
  specialRequests: string
}

export function PurchaseModal({ nft, isOpen, onClose, onSuccess }: PurchaseModalProps) {
  const [purchaseData, setPurchaseData] = useState<PurchaseData>({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "",
    emergencyContact: "",
    emergencyPhone: "",
    specialRequests: "",
  })
  const [isProcessing, setIsProcessing] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()

  const seasonInfo = NFTService.getSeasonInfo(nft.season)

  const handleInputChange = (field: keyof PurchaseData, value: string) => {
    setPurchaseData((prev) => ({ ...prev, [field]: value }))
  }

  const handlePurchase = async () => {
    if (!user) return

    // Validate required fields
    const requiredFields = ["fullName", "email", "phone", "address", "city", "country"]
    const missingFields = requiredFields.filter((field) => !purchaseData[field as keyof PurchaseData])

    if (missingFields.length > 0) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)

    try {
      const result = await NFTService.purchaseNFT(nft.id, user.id, purchaseData)

      if (result.success) {
        toast({
          title: "Purchase Successful!",
          description: `You now own ${nft.title}. Welcome to the exclusive catamaran community!`,
        })
        onSuccess()
        onClose()
      } else {
        toast({
          title: "Purchase Failed",
          description: result.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Purchase Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    }

    setIsProcessing(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Complete Your NFT Purchase</DialogTitle>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6">
          {/* NFT Summary */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{nft.title}</CardTitle>
                    <CardDescription>{nft.description}</CardDescription>
                  </div>
                  <Badge className={seasonInfo.color + " " + seasonInfo.bgColor}>{seasonInfo.name}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">{nft.price} ETH</p>
                  <p className="text-sm text-muted-foreground">
                    {nft.availableSupply}/{nft.totalSupply} available
                  </p>
                </div>

                <Separator />

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
                    {nft.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-center">
                        <span className="w-1 h-1 bg-accent rounded-full mr-2"></span>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Purchase Form */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Personal Information</CardTitle>
                <CardDescription>
                  This information will be used for your catamaran bookings and NFT ownership verification
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      value={purchaseData.fullName}
                      onChange={(e) => handleInputChange("fullName", e.target.value)}
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={purchaseData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      value={purchaseData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  <div>
                    <Label htmlFor="country">Country *</Label>
                    <Input
                      id="country"
                      value={purchaseData.country}
                      onChange={(e) => handleInputChange("country", e.target.value)}
                      placeholder="United States"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="address">Address *</Label>
                  <Input
                    id="address"
                    value={purchaseData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    placeholder="123 Main Street"
                  />
                </div>

                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={purchaseData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    placeholder="New York"
                  />
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="emergencyContact">Emergency Contact</Label>
                    <Input
                      id="emergencyContact"
                      value={purchaseData.emergencyContact}
                      onChange={(e) => handleInputChange("emergencyContact", e.target.value)}
                      placeholder="Jane Doe"
                    />
                  </div>
                  <div>
                    <Label htmlFor="emergencyPhone">Emergency Phone</Label>
                    <Input
                      id="emergencyPhone"
                      value={purchaseData.emergencyPhone}
                      onChange={(e) => handleInputChange("emergencyPhone", e.target.value)}
                      placeholder="+1 (555) 987-6543"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="specialRequests">Special Requests</Label>
                  <Textarea
                    id="specialRequests"
                    value={purchaseData.specialRequests}
                    onChange={(e) => handleInputChange("specialRequests", e.target.value)}
                    placeholder="Any dietary restrictions, accessibility needs, or special occasions..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent">
                Cancel
              </Button>
              <Button onClick={handlePurchase} disabled={isProcessing} className="flex-1">
                {isProcessing ? "Processing..." : `Purchase for ${nft.price} ETH`}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
