"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { type Catamaran, type BookingRequest, BookingService } from "@/lib/booking"
import { NFTService } from "@/lib/nft"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"

interface BookingFormProps {
  catamaran: Catamaran
  onClose: () => void
  onSuccess: () => void
}

export function BookingForm({ catamaran, onClose, onSuccess }: BookingFormProps) {
  const [formData, setFormData] = useState({
    nftTokenId: "",
    startDate: "",
    endDate: "",
    guests: 1,
    specialRequests: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const { user } = useAuth()
  const { toast } = useToast()

  // Get user's owned NFTs that match catamaran seasons
  const ownedNfts = user ? NFTService.getOwnedNFTs(user.id) : []
  const compatibleNfts = ownedNfts.filter((nft) => catamaran.availableSeasons.includes(nft.season))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!user) {
      setError("You must be logged in to make a booking")
      return
    }

    if (compatibleNfts.length === 0) {
      setError("You need an NFT compatible with this catamaran's seasons")
      return
    }

    if (!formData.nftTokenId) {
      setError("Please select an NFT for this booking")
      return
    }

    if (formData.guests > catamaran.capacity) {
      setError(`Maximum capacity is ${catamaran.capacity} guests`)
      return
    }

    // Validate dates
    const startDate = new Date(formData.startDate)
    const endDate = new Date(formData.endDate)
    const today = new Date()

    if (startDate < today) {
      setError("Start date cannot be in the past")
      return
    }

    if (endDate <= startDate) {
      setError("End date must be after start date")
      return
    }

    // Check NFT day limits
    const selectedNft = compatibleNfts.find((nft) => nft.tokenId === formData.nftTokenId)
    if (selectedNft) {
      const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
      if (totalDays > selectedNft.catamaranAccess.daysIncluded) {
        setError(`Your NFT only includes ${selectedNft.catamaranAccess.daysIncluded} days`)
        return
      }

      if (formData.guests > selectedNft.catamaranAccess.maxGuests) {
        setError(`Your NFT allows maximum ${selectedNft.catamaranAccess.maxGuests} guests`)
        return
      }
    }

    setIsSubmitting(true)

    const bookingRequest: BookingRequest = {
      catamaranId: catamaran.id,
      nftTokenId: formData.nftTokenId,
      startDate: formData.startDate,
      endDate: formData.endDate,
      guests: formData.guests,
      specialRequests: formData.specialRequests || undefined,
    }

    const result = await BookingService.createBooking(user.id, bookingRequest)

    if (result.success) {
      toast({
        title: "Booking Created!",
        description: "Your catamaran booking has been submitted for confirmation.",
      })
      onSuccess()
    } else {
      setError(result.error || "Failed to create booking")
    }

    setIsSubmitting(false)
  }

  if (compatibleNfts.length === 0) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>NFT Required</CardTitle>
          <CardDescription>You need a compatible NFT to book this catamaran</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              This catamaran is available for{" "}
              {catamaran.availableSeasons.map((s) => NFTService.getSeasonInfo(s).name).join(", ")} seasons. You need an
              NFT from one of these seasons to make a booking.
            </AlertDescription>
          </Alert>
          <div className="flex gap-2 mt-4">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button onClick={() => (window.location.href = "/marketplace")}>Browse NFTs</Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>Book {catamaran.name}</CardTitle>
        <CardDescription>Complete your catamaran booking using your NFT privileges</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nft">Select NFT</Label>
            <Select
              value={formData.nftTokenId}
              onValueChange={(value) => setFormData({ ...formData, nftTokenId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose your NFT" />
              </SelectTrigger>
              <SelectContent>
                {compatibleNfts.map((nft) => (
                  <SelectItem key={nft.tokenId} value={nft.tokenId}>
                    {nft.title} ({nft.catamaranAccess.daysIncluded} days, {nft.catamaranAccess.maxGuests} guests)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                min={new Date().toISOString().split("T")[0]}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                min={formData.startDate || new Date().toISOString().split("T")[0]}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="guests">Number of Guests</Label>
            <Input
              id="guests"
              type="number"
              min="1"
              max={catamaran.capacity}
              value={formData.guests}
              onChange={(e) => setFormData({ ...formData, guests: Number.parseInt(e.target.value) || 1 })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="requests">Special Requests (Optional)</Label>
            <Textarea
              id="requests"
              placeholder="Any special requirements or requests..."
              value={formData.specialRequests}
              onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
              rows={3}
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? "Creating Booking..." : "Book Now"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
