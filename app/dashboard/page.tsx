"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { NFTService, type UserTokenInfo } from "@/lib/nft"
import { pugliaContract } from "@/lib/blockchain/puglia-contract"
import { useAuth } from "@/hooks/use-auth"
import { WalletConnect } from "@/components/blockchain/wallet-connect"
import { useWallet } from "@/lib/blockchain/wallet"
import { toast } from "sonner"
import { Loader2, MapPin, Calendar, XCircle } from "lucide-react"

interface BookedVacationDisplay {
  tokenId: number
  vacationId: number
  startDate: string
  endDate: string
  location: string
}

export default function DashboardPage() {
  const [tokens, setTokens] = useState<UserTokenInfo[]>([])
  const [bookedVacations, setBookedVacations] = useState<BookedVacationDisplay[]>([])
  const [loading, setLoading] = useState(true)
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { user, logout } = useAuth()
  const { walletAddress, isConnected } = useWallet()
  const router = useRouter()

  // Aggregated credit info
  const totalWeeks = tokens.reduce((sum, t) => sum + t.totalVacations, 0)
  const usedWeeks = tokens.reduce((sum, t) => sum + t.usedVacations, 0)
  const bookedWeeks = bookedVacations.length
  const remainingWeeks = totalWeeks - usedWeeks
  const creditPercent = totalWeeks > 0 ? ((remainingWeeks / totalWeeks) * 100) : 0

  useEffect(() => {
    if (!user) {
      router.push("/auth")
    }
  }, [user, router])

  useEffect(() => {
    async function loadData() {
      if (!isConnected || !walletAddress) {
        setTokens([])
        setBookedVacations([])
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        const userTokens = await NFTService.getUserTokens(walletAddress)
        setTokens(userTokens)

        // Fetch booked vacation details across all tokens
        const allBooked: BookedVacationDisplay[] = []
        for (const token of userTokens) {
          for (const vacId of token.bookedVacations) {
            const slot = await NFTService.getVacationSlot(vacId)
            if (slot) {
              allBooked.push({
                tokenId: token.tokenId,
                vacationId: vacId,
                startDate: slot.startDate,
                endDate: slot.endDate,
                location: slot.location,
              })
            }
          }
        }
        setBookedVacations(allBooked)
      } catch (err) {
        console.error("Error loading dashboard data:", err)
        setError("Errore nel caricamento dei dati")
        setTokens([])
        setBookedVacations([])
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [walletAddress, isConnected])

  const handleCancelBooking = async (tokenId: number, vacationId: number) => {
    const key = `${tokenId}-${vacationId}`
    setCancellingId(key)

    try {
      const tx = await pugliaContract.cancelBooking(tokenId, vacationId)
      toast.info("Transazione inviata, in attesa di conferma...")
      await tx.wait()
      toast.success("Prenotazione cancellata con successo!")

      // Refresh data
      setBookedVacations((prev) =>
        prev.filter((b) => !(b.tokenId === tokenId && b.vacationId === vacationId)),
      )

      // Reload token metadata
      if (walletAddress) {
        const updatedTokens = await NFTService.getUserTokens(walletAddress)
        setTokens(updatedTokens)
      }
    } catch (err: any) {
      console.error("Error cancelling booking:", err)
      toast.error(err.reason || err.message || "Errore nella cancellazione")
    } finally {
      setCancellingId(null)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Redirecting to login...</p>
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
            <TabsTrigger value="bookings">Active Bookings ({bookedWeeks})</TabsTrigger>
            <TabsTrigger value="tokens">My NFTs ({tokens.length})</TabsTrigger>
            <TabsTrigger value="wallet">Wallet</TabsTrigger>
          </TabsList>

          {/* ─── OVERVIEW TAB ─── */}
          <TabsContent value="overview" className="space-y-6">
            {!isConnected ? (
              <Card>
                <CardContent className="text-center py-12">
                  <p className="text-muted-foreground mb-4">Connect your wallet to view your portfolio</p>
                  <WalletConnect />
                </CardContent>
              </Card>
            ) : loading ? (
              <Card>
                <CardContent className="flex items-center justify-center py-12 gap-3">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <p className="text-muted-foreground">Loading your portfolio...</p>
                </CardContent>
              </Card>
            ) : error ? (
              <Card>
                <CardContent className="text-center py-12">
                  <p className="text-red-500 mb-4">{error}</p>
                  <Button onClick={() => window.location.reload()}>Retry</Button>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Credit Bar */}
                <Card>
                  <CardHeader>
                    <CardTitle>Vacation Credits</CardTitle>
                    <CardDescription>Your available vacation weeks across all NFTs</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-4xl font-bold text-primary">{remainingWeeks}</p>
                        <p className="text-sm text-muted-foreground">
                          out of {totalWeeks} weeks remaining
                        </p>
                      </div>
                      <div className="text-right text-sm text-muted-foreground space-y-1">
                        <p>Booked: {bookedWeeks}</p>
                        <p>Used: {usedWeeks}</p>
                      </div>
                    </div>
                    <Progress value={creditPercent} className="h-3" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{usedWeeks} used</span>
                      <span>{bookedWeeks} booked</span>
                      <span>{remainingWeeks - bookedWeeks} available</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Stats Grid */}
                <div className="grid md:grid-cols-4 gap-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>NFTs Held</CardDescription>
                      <CardTitle className="text-2xl text-primary">{tokens.length}</CardTitle>
                    </CardHeader>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>Total Weeks</CardDescription>
                      <CardTitle className="text-2xl text-primary">{totalWeeks}</CardTitle>
                    </CardHeader>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>Active Bookings</CardDescription>
                      <CardTitle className="text-2xl text-primary">{bookedWeeks}</CardTitle>
                    </CardHeader>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>Wallet Status</CardDescription>
                      <CardTitle className="text-lg">
                        <Badge variant="default">Connected</Badge>
                      </CardTitle>
                    </CardHeader>
                  </Card>
                </div>

                {/* Quick Bookings Preview */}
                {bookedVacations.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Upcoming Bookings</CardTitle>
                      <CardDescription>Your next vacation bookings</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {bookedVacations.slice(0, 3).map((booking) => (
                          <div
                            key={`${booking.tokenId}-${booking.vacationId}`}
                            className="flex items-center justify-between p-4 border rounded-lg"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">{booking.location}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                <span>{booking.startDate} - {booking.endDate}</span>
                              </div>
                            </div>
                            <Badge variant="default">Booked</Badge>
                          </div>
                        ))}
                        {bookedVacations.length > 3 && (
                          <p className="text-sm text-muted-foreground text-center">
                            And {bookedVacations.length - 3} more...
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </TabsContent>

          {/* ─── ACTIVE BOOKINGS TAB ─── */}
          <TabsContent value="bookings" className="space-y-6">
            {!isConnected ? (
              <Card>
                <CardContent className="text-center py-12">
                  <p className="text-muted-foreground mb-4">Connect your wallet to view bookings</p>
                  <WalletConnect />
                </CardContent>
              </Card>
            ) : loading ? (
              <Card>
                <CardContent className="flex items-center justify-center py-12 gap-3">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <p className="text-muted-foreground">Loading bookings...</p>
                </CardContent>
              </Card>
            ) : bookedVacations.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <p className="text-muted-foreground mb-4">No active bookings</p>
                  <Button onClick={() => router.push("/bookings")}>Book a Vacation</Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {bookedVacations.map((booking) => {
                  const key = `${booking.tokenId}-${booking.vacationId}`
                  const isCancelling = cancellingId === key
                  return (
                    <Card key={key}>
                      <CardContent className="flex items-center justify-between p-6">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <MapPin className="h-5 w-5 text-primary" />
                            <span className="text-lg font-semibold">{booking.location}</span>
                            <Badge variant="outline">Vacation #{booking.vacationId}</Badge>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>{booking.startDate} - {booking.endDate}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            NFT Token #{booking.tokenId}
                          </p>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={isCancelling}
                          onClick={() => handleCancelBooking(booking.tokenId, booking.vacationId)}
                        >
                          {isCancelling ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              Cancelling...
                            </>
                          ) : (
                            <>
                              <XCircle className="h-4 w-4 mr-2" />
                              Cancel Booking
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </TabsContent>

          {/* ─── MY NFTs TAB ─── */}
          <TabsContent value="tokens" className="space-y-6">
            {!isConnected ? (
              <Card>
                <CardContent className="text-center py-12">
                  <p className="text-muted-foreground mb-4">Connect your wallet to view your NFTs</p>
                  <WalletConnect />
                </CardContent>
              </Card>
            ) : loading ? (
              <Card>
                <CardContent className="flex items-center justify-center py-12 gap-3">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <p className="text-muted-foreground">Loading NFTs...</p>
                </CardContent>
              </Card>
            ) : tokens.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <p className="text-muted-foreground mb-4">No NFTs found for this wallet</p>
                  <p className="text-sm text-muted-foreground">
                    Contact admin if you should have NFTs assigned
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tokens.map((token) => {
                  const available = token.totalVacations - token.usedVacations
                  const percent = token.totalVacations > 0
                    ? ((available / token.totalVacations) * 100)
                    : 0
                  return (
                    <Card key={token.tokenId}>
                      <CardHeader>
                        <CardTitle className="flex justify-between items-center">
                          <span>NFT #{token.tokenId}</span>
                          <Badge variant={token.isActive ? "default" : "secondary"}>
                            {token.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </CardTitle>
                        <CardDescription>{token.ownerName}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Weeks remaining</span>
                            <span className="font-medium">{available}/{token.totalVacations}</span>
                          </div>
                          <Progress value={percent} className="h-2" />
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center text-sm">
                          <div className="p-2 bg-muted rounded">
                            <p className="font-bold">{token.availableVacations.length}</p>
                            <p className="text-xs text-muted-foreground">Available</p>
                          </div>
                          <div className="p-2 bg-muted rounded">
                            <p className="font-bold">{token.bookedVacations.length}</p>
                            <p className="text-xs text-muted-foreground">Booked</p>
                          </div>
                          <div className="p-2 bg-muted rounded">
                            <p className="font-bold">{token.usedVacations}</p>
                            <p className="text-xs text-muted-foreground">Used</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </TabsContent>

          {/* ─── WALLET TAB ─── */}
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
                      <span className="text-muted-foreground">NFTs Held:</span>
                      <span>{tokens.length}</span>
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
