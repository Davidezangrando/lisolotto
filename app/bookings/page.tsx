"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Calendar, MapPin, Loader2, CheckCircle } from "lucide-react"
import { useWallet } from "@/lib/blockchain/wallet"
import { pugliaContract } from "@/lib/blockchain/puglia-contract"
import { NFTService, type UserTokenInfo, type VacationSlot } from "@/lib/nft"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "sonner"

interface AvailableSlot extends VacationSlot {
  tokenId: number
}

export default function BookingsPage() {
  const [userTokens, setUserTokens] = useState<UserTokenInfo[]>([])
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isBooking, setIsBooking] = useState(false)

  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  const { isConnected, walletAddress, connectWallet } = useWallet()
  const { user } = useAuth()
  const router = useRouter()

  // Load user tokens and their available vacation slots
  useEffect(() => {
    const loadData = async () => {
      if (!isConnected || !walletAddress) {
        setUserTokens([])
        setAvailableSlots([])
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        const tokens = await NFTService.getUserTokens(walletAddress)
        setUserTokens(tokens)

        // For each token, fetch available vacation details
        const slots: AvailableSlot[] = []
        for (const token of tokens) {
          for (const vacId of token.availableVacations) {
            const slot = await NFTService.getVacationSlot(vacId)
            if (slot && !slot.isBooked) {
              slots.push({ ...slot, tokenId: token.tokenId })
            }
          }
        }

        setAvailableSlots(slots)
      } catch (error) {
        console.error("Error loading booking data:", error)
        toast.error("Error loading vacation data")
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [isConnected, walletAddress])

  const handleBookSlot = (slot: AvailableSlot) => {
    setSelectedSlot(slot)
    setShowConfirmDialog(true)
  }

  const handleConfirmBooking = async () => {
    if (!selectedSlot || !walletAddress) return

    setIsBooking(true)
    try {
      const tx = await pugliaContract.bookVacation(selectedSlot.tokenId, selectedSlot.vacationId)
      toast.info("Transaction submitted, waiting for confirmation...")
      await tx.wait()
      toast.success("Vacation booked successfully!")

      // Remove the booked slot from the list
      setAvailableSlots((prev) =>
        prev.filter((s) => !(s.tokenId === selectedSlot.tokenId && s.vacationId === selectedSlot.vacationId)),
      )

      // Reload tokens to get updated metadata
      const updatedTokens = await NFTService.getUserTokens(walletAddress)
      setUserTokens(updatedTokens)

      setShowConfirmDialog(false)
      setSelectedSlot(null)
    } catch (error: any) {
      console.error("Error booking vacation:", error)
      toast.error(error.reason || error.message || "Error during booking")
    } finally {
      setIsBooking(false)
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

  const totalAvailable = availableSlots.length
  const totalWeeks = userTokens.reduce((sum, t) => sum + t.totalVacations, 0)
  const usedWeeks = userTokens.reduce((sum, t) => sum + t.usedVacations, 0)

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
                  <p>
                    Credits: {totalWeeks - usedWeeks} remaining / {totalWeeks} total
                  </p>
                  <p className="truncate max-w-[200px]">{walletAddress}</p>
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
        {!isConnected ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                Connect your wallet to see available vacation slots from your NFTs
              </p>
              <Button onClick={connectWallet}>Connect Wallet</Button>
            </CardContent>
          </Card>
        ) : isLoading ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12 gap-3">
              <Loader2 className="h-5 w-5 animate-spin" />
              <p className="text-muted-foreground">Loading your available vacations...</p>
            </CardContent>
          </Card>
        ) : userTokens.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground mb-4">No NFTs found for this wallet</p>
              <p className="text-sm text-muted-foreground">
                You need a Puglia Vacation NFT to book vacations
              </p>
            </CardContent>
          </Card>
        ) : availableSlots.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground mb-4">No available vacation slots</p>
              <p className="text-sm text-muted-foreground">
                All your vacation slots are either booked or used
              </p>
              <Button variant="outline" className="mt-4" onClick={() => router.push("/dashboard")}>
                View Dashboard
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-1">
                Available Vacation Slots ({totalAvailable})
              </h2>
              <p className="text-sm text-muted-foreground">
                These are the vacation weeks available across your NFTs. Click to book.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableSlots.map((slot) => (
                <Card key={`${slot.tokenId}-${slot.vacationId}`} className="overflow-hidden">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">Vacation #{slot.vacationId}</CardTitle>
                      <Badge variant="outline">NFT #{slot.tokenId}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{slot.location}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{slot.startDate} - {slot.endDate}</span>
                    </div>

                    <div className="pt-2">
                      <Button
                        onClick={() => handleBookSlot(slot)}
                        className="w-full"
                      >
                        Book This Vacation
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Booking</DialogTitle>
          </DialogHeader>

          {selectedSlot && (
            <div className="space-y-6">
              <div className="bg-muted p-4 rounded-lg space-y-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span className="font-semibold">{selectedSlot.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{selectedSlot.startDate} - {selectedSlot.endDate}</span>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Vacation ID: </span>
                  <span className="font-medium">#{selectedSlot.vacationId}</span>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Using NFT Token: </span>
                  <span className="font-medium">#{selectedSlot.tokenId}</span>
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={() => setShowConfirmDialog(false)}
                  className="flex-1"
                  disabled={isBooking}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmBooking}
                  disabled={isBooking}
                  className="flex-1"
                >
                  {isBooking ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Booking...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Confirm Booking
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
