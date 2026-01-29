"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar, Users, Star, Anchor } from "lucide-react"
import { useWallet } from "@/lib/blockchain/wallet"
import { pugliaContract, type VacationWeek } from "@/lib/blockchain/puglia-contract"
import { useAuth } from "@/hooks/use-auth"

interface VacationWeekWithId extends VacationWeek {
  weekId: number
}

interface BookingData {
  guestName: string
  contactInfo: string
  specialRequests: string
}

interface NFTSelectionState {
  requiredNFTs: number
  selectedNFTs: bigint[]
  showNFTSelection: boolean
  isApproving: boolean
  approvalStep: number
}

export default function BookingsPage() {
  const [vacationWeeks, setVacationWeeks] = useState<VacationWeekWithId[]>([])
  const [selectedWeek, setSelectedWeek] = useState<VacationWeekWithId | null>(null)
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [bookingData, setBookingData] = useState<BookingData>({
    guestName: "",
    contactInfo: "",
    specialRequests: "",
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isBooking, setIsBooking] = useState(false)
  const [userNFTs, setUserNFTs] = useState<bigint[]>([])

  const { isConnected, walletAddress, connectWallet } = useWallet()
  const { user } = useAuth()
  const router = useRouter()

  const [nftSelection, setNftSelection] = useState<NFTSelectionState>({
    requiredNFTs: 0,
    selectedNFTs: [],
    showNFTSelection: false,
    isApproving: false,
    approvalStep: 0,
  })

  useEffect(() => {
    const loadVacationWeeks = async () => {
      try {
        console.log("[v0] Loading vacation weeks from contract...")
        const weeks = await pugliaContract.getAllActiveVacationWeeks()
        console.log("[v0] Loaded vacation weeks:", weeks)
        setVacationWeeks(weeks)

        // Load user NFTs if wallet is connected
        if (isConnected && walletAddress) {
          const nfts = await pugliaContract.getInvestorAvailableNFTs(walletAddress)
          console.log("[v0] User NFTs:", nfts)
          setUserNFTs(nfts)
        }
      } catch (error) {
        console.error("[v0] Error loading vacation weeks:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadVacationWeeks()
  }, [isConnected, walletAddress])

  const handleBookWeek = async (week: VacationWeekWithId) => {
    if (!isConnected || !walletAddress) {
      await connectWallet()
      return
    }

    // Check if user can book this week
    try {
      const [canBook, message] = await pugliaContract.canBookWeek(walletAddress, week.weekId)
      if (!canBook) {
        alert(`Cannot book: ${message}`)
        return
      }

      setSelectedWeek(week)
      setShowBookingForm(true)
    } catch (error) {
      console.error("[v0] Error checking booking eligibility:", error)
      alert("Error checking booking eligibility")
    }
  }

  const handleConfirmBooking = async () => {
    if (!selectedWeek || !walletAddress || !bookingData.guestName || !bookingData.contactInfo) {
      alert("Please fill in all required fields")
      return
    }

    try {
      const requiredNFTs = await pugliaContract.getSeasonCost(selectedWeek.season)
      console.log("[v0] Required NFTs for booking:", requiredNFTs)

      if (userNFTs.length < Number(requiredNFTs)) {
        alert(`You need ${requiredNFTs} NFTs but only have ${userNFTs.length} available`)
        return
      }

      setNftSelection({
        requiredNFTs: Number(requiredNFTs),
        selectedNFTs: [],
        showNFTSelection: true,
        isApproving: false,
        approvalStep: 0,
      })
    } catch (error) {
      console.error("[v0] Error getting season cost:", error)
      alert("Error calculating required NFTs")
    }
  }

  const handleNFTSelection = (tokenId: bigint, selected: boolean) => {
    setNftSelection((prev) => {
      const newSelected = selected ? [...prev.selectedNFTs, tokenId] : prev.selectedNFTs.filter((id) => id !== tokenId)

      return {
        ...prev,
        selectedNFTs: newSelected,
      }
    })
  }

  const handleFinalBooking = async () => {
    if (!selectedWeek || !walletAddress || nftSelection.selectedNFTs.length !== nftSelection.requiredNFTs) {
      alert(`Please select exactly ${nftSelection.requiredNFTs} NFTs`)
      return
    }

    setNftSelection((prev) => ({ ...prev, isApproving: true, approvalStep: 0 }))

    try {
      console.log("[v0] Starting NFT approvals...")

      for (let i = 0; i < nftSelection.selectedNFTs.length; i++) {
        const tokenId = nftSelection.selectedNFTs[i]
        setNftSelection((prev) => ({ ...prev, approvalStep: i + 1 }))

        console.log(`[v0] Approving NFT ${tokenId} (${i + 1}/${nftSelection.selectedNFTs.length})`)
        const approveTx = await pugliaContract.approveNFT(tokenId)
        await approveTx.wait()
        console.log(`[v0] NFT ${tokenId} approved successfully`)
      }

      console.log("[v0] Saving booking data to Supabase:", bookingData)
      // TODO: Implement Supabase save

      console.log("[v0] Booking vacation week with contract...")
      const bookingTx = await pugliaContract.bookVacationWeek(
        selectedWeek.weekId,
        nftSelection.selectedNFTs,
        bookingData.guestName,
        bookingData.contactInfo,
      )

      console.log("[v0] Booking transaction sent:", bookingTx.hash)
      await bookingTx.wait()
      console.log("[v0] Booking confirmed!")

      alert("Vacation booked successfully!")

      setShowBookingForm(false)
      setSelectedWeek(null)
      setBookingData({ guestName: "", contactInfo: "", specialRequests: "" })
      setNftSelection({
        requiredNFTs: 0,
        selectedNFTs: [],
        showNFTSelection: false,
        isApproving: false,
        approvalStep: 0,
      })

      const updatedNFTs = await pugliaContract.getInvestorAvailableNFTs(walletAddress)
      setUserNFTs(updatedNFTs)
    } catch (error) {
      console.error("[v0] Error during booking process:", error)
      alert("Error during booking process. Please try again.")
    } finally {
      setNftSelection((prev) => ({ ...prev, isApproving: false, approvalStep: 0 }))
    }
  }

  const getSeasonBadgeColor = (season: number) => {
    switch (season) {
      case 0:
        return "bg-green-100 text-green-800"
      case 1:
        return "bg-yellow-100 text-yellow-800"
      case 2:
        return "bg-orange-100 text-orange-800"
      case 3:
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-primary mb-4">Access Required</h1>
          <p className="text-muted-foreground mb-6">Please log in to view vacation bookings</p>
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
              <h1 className="text-3xl font-bold text-primary">Puglia Luxury Vacations</h1>
              <p className="text-muted-foreground mt-1">Book exclusive villa experiences with your NFTs</p>
            </div>
            <div className="flex gap-4">
              {!isConnected ? (
                <Button onClick={connectWallet}>Connect Wallet</Button>
              ) : (
                <div className="text-sm text-muted-foreground">
                  <p>NFTs Available: {userNFTs.length}/8</p>
                  <p className="truncate">{walletAddress}</p>
                </div>
              )}
              <Button variant="outline" onClick={() => router.push("/dashboard")}>
                My Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="text-center py-12">
            <p>Loading vacation weeks...</p>
          </div>
        ) : vacationWeeks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No active vacation weeks available</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vacationWeeks.map((week) => (
              <Card key={week.weekId} className="overflow-hidden">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">Week #{week.weekId}</CardTitle>
                    <Badge className={getSeasonBadgeColor(week.season)}>
                      {pugliaContract.getSeasonName(week.season)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {pugliaContract.formatDate(week.startDate)} - {pugliaContract.formatDate(week.endDate)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>Villa: {Number(week.villaSlots)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4" />
                      <span>Luxury: {Number(week.luxurySlots)}</span>
                    </div>
                  </div>

                  {week.catamaranDays && (
                    <div className="flex items-center gap-2 text-sm">
                      <Anchor className="h-4 w-4" />
                      <span>Catamaran: {week.catamaranDays}</span>
                    </div>
                  )}

                  <div className="pt-4">
                    <Button onClick={() => handleBookWeek(week)} className="w-full" disabled={!isConnected}>
                      {!isConnected ? "Connect Wallet to Book" : "Book Vacation"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Booking Form Dialog */}
      <Dialog open={showBookingForm} onOpenChange={setShowBookingForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Book Vacation Week #{selectedWeek?.weekId}</DialogTitle>
          </DialogHeader>

          {selectedWeek && (
            <div className="space-y-6">
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Vacation Details</h3>
                <p className="text-sm text-muted-foreground">
                  {pugliaContract.formatDate(selectedWeek.startDate)} -{" "}
                  {pugliaContract.formatDate(selectedWeek.endDate)}
                </p>
                <p className="text-sm">
                  Season:{" "}
                  <Badge className={getSeasonBadgeColor(selectedWeek.season)}>
                    {pugliaContract.getSeasonName(selectedWeek.season)}
                  </Badge>
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="guestName">Guest Name *</Label>
                  <Input
                    id="guestName"
                    value={bookingData.guestName}
                    onChange={(e) => setBookingData((prev) => ({ ...prev, guestName: e.target.value }))}
                    placeholder="Enter guest name"
                  />
                </div>

                <div>
                  <Label htmlFor="contactInfo">Contact Information *</Label>
                  <Input
                    id="contactInfo"
                    value={bookingData.contactInfo}
                    onChange={(e) => setBookingData((prev) => ({ ...prev, contactInfo: e.target.value }))}
                    placeholder="Email or phone number"
                  />
                </div>

                <div>
                  <Label htmlFor="specialRequests">Special Requests</Label>
                  <Textarea
                    id="specialRequests"
                    value={bookingData.specialRequests}
                    onChange={(e) => setBookingData((prev) => ({ ...prev, specialRequests: e.target.value }))}
                    placeholder="Any special requests or requirements"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <Button variant="outline" onClick={() => setShowBookingForm(false)} className="flex-1">
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmBooking}
                  disabled={isBooking || !bookingData.guestName || !bookingData.contactInfo}
                  className="flex-1"
                >
                  {isBooking ? "Processing..." : "Select NFTs & Book"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={nftSelection.showNFTSelection}
        onOpenChange={(open) => setNftSelection((prev) => ({ ...prev, showNFTSelection: open }))}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Select NFTs for Booking</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm">
                Season:{" "}
                <Badge className={getSeasonBadgeColor(selectedWeek?.season || 0)}>
                  {selectedWeek ? pugliaContract.getSeasonName(selectedWeek.season) : ""}
                </Badge>
              </p>
              <p className="text-sm mt-2">
                Required NFTs: <strong>{nftSelection.requiredNFTs}</strong>
              </p>
              <p className="text-sm">
                Selected:{" "}
                <strong>
                  {nftSelection.selectedNFTs.length}/{nftSelection.requiredNFTs}
                </strong>
              </p>
            </div>

            {nftSelection.isApproving ? (
              <div className="text-center py-8">
                <div className="space-y-4">
                  <div className="text-lg font-semibold">Processing Booking...</div>
                  <div className="text-sm text-muted-foreground">
                    {nftSelection.approvalStep > 0 && nftSelection.approvalStep <= nftSelection.selectedNFTs.length
                      ? `Approving NFT ${nftSelection.approvalStep}/${nftSelection.selectedNFTs.length}...`
                      : nftSelection.approvalStep > nftSelection.selectedNFTs.length
                        ? "Finalizing booking..."
                        : "Starting approval process..."}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${(nftSelection.approvalStep / (nftSelection.selectedNFTs.length + 1)) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {userNFTs.map((tokenId) => (
                    <Card
                      key={tokenId.toString()}
                      className={`cursor-pointer transition-all ${
                        nftSelection.selectedNFTs.includes(tokenId)
                          ? "ring-2 ring-primary bg-primary/5"
                          : "hover:bg-muted/50"
                      }`}
                      onClick={() => {
                        const isSelected = nftSelection.selectedNFTs.includes(tokenId)
                        if (isSelected || nftSelection.selectedNFTs.length < nftSelection.requiredNFTs) {
                          handleNFTSelection(tokenId, !isSelected)
                        }
                      }}
                    >
                      <CardContent className="p-4 text-center">
                        <div className="text-lg font-bold">NFT #{tokenId.toString()}</div>
                        <div className="text-sm text-muted-foreground">Available</div>
                        {nftSelection.selectedNFTs.includes(tokenId) && <Badge className="mt-2">Selected</Badge>}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setNftSelection((prev) => ({ ...prev, showNFTSelection: false }))}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleFinalBooking}
                    disabled={nftSelection.selectedNFTs.length !== nftSelection.requiredNFTs}
                    className="flex-1"
                  >
                    Approve NFTs & Book ({nftSelection.selectedNFTs.length}/{nftSelection.requiredNFTs})
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
