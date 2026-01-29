"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useAuth } from "@/hooks/use-auth"
import { pugliaContract, type Booking, type VacationWeek } from "@/lib/blockchain/puglia-contract"
import { Calendar, MapPin, Users, Clock, Trash2 } from "lucide-react"

interface BookingWithDetails extends Booking {
  bookingId: number
  weekDetails?: VacationWeek
  checkInCode?: string
}

export default function ManageBookingPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [bookings, setBookings] = useState<BookingWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [cancellingBooking, setCancellingBooking] = useState<number | null>(null)

  useEffect(() => {
    if (!user) {
      console.log("[v0] No user found, redirecting to auth")
      router.push("/auth")
      return
    }

    console.log("[v0] User found, loading bookings:", user.walletAddress)
    loadUserBookings()
  }, [user, router])

  const loadUserBookings = async () => {
    if (!user?.walletAddress) {
      console.log("[v0] No wallet address found")
      return
    }

    try {
      setLoading(true)
      console.log(`[v0] Starting to load bookings for user: ${user.walletAddress}`)

      const userBookings: BookingWithDetails[] = []
      let bookingId = 1
      const emptyBooking = ["0", "0x0000000000000000000000000000000000000000", "0", false, "", "", ""]

      while (true) {
        try {
          console.log(`[v0] Calling bookings(${bookingId})`)
          const bookingResult = await pugliaContract.bookings(bookingId)
          console.log(`[v0] Booking ${bookingId} result:`, bookingResult)

          // Check if booking is empty (all default values)
          const isEmptyBooking =
            bookingResult[0] === "0" &&
            bookingResult[1] === "0x0000000000000000000000000000000000000000" &&
            bookingResult[2] === "0" &&
            bookingResult[3] === false &&
            bookingResult[4] === "" &&
            bookingResult[5] === "" &&
            bookingResult[6] === ""

          if (isEmptyBooking) {
            console.log(`[v0] Found empty booking at ID ${bookingId}, stopping loop`)
            break
          }

          // Check if this booking belongs to the current user
          if (bookingResult[1].toLowerCase() === user.walletAddress.toLowerCase()) {
            console.log(`[v0] Booking ${bookingId} belongs to current user, adding to list`)

            try {
              console.log(`[v0] Calling getBooking(${bookingId}) for detailed info`)
              const detailedBooking = await pugliaContract.getBooking(bookingId)
              console.log(`[v0] Detailed booking ${bookingId} result:`, detailedBooking)

              const booking: BookingWithDetails = {
                weekId: BigInt(bookingResult[0]),
                booker: bookingResult[1],
                bookingDate: BigInt(bookingResult[2]),
                isUsed: bookingResult[3],
                guestName: bookingResult[4],
                contactInfo: bookingResult[5],
                accommodationType: bookingResult[6],
                bookingId: bookingId,
              }

              // Get week details
              try {
                console.log(`[v0] Getting vacation week details for week ID: ${booking.weekId}`)
                const weekDetails = await pugliaContract.getVacationWeek(Number(booking.weekId))
                console.log(`[v0] Week details for week ${booking.weekId}:`, weekDetails)
                booking.weekDetails = weekDetails
              } catch (weekError) {
                console.error(`[v0] Error loading week details for booking ${bookingId}:`, weekError)
              }

              // Generate check-in code
              booking.checkInCode = generateCheckInCode(bookingId)
              console.log(`[v0] Generated check-in code for booking ${bookingId}: ${booking.checkInCode}`)

              userBookings.push(booking)
            } catch (detailError) {
              console.error(`[v0] Error calling getBooking(${bookingId}):`, detailError)
            }
          } else {
            console.log(`[v0] Booking ${bookingId} belongs to different user: ${bookingResult[1]}`)
          }

          bookingId++

          // Safety check to prevent infinite loop
          if (bookingId > 1000) {
            console.log("[v0] Safety break: reached booking ID 1000")
            break
          }
        } catch (error) {
          console.error(`[v0] Error calling bookings(${bookingId}):`, error)
          break
        }
      }

      console.log(`[v0] Finished loading bookings. Found ${userBookings.length} bookings for user`)
      setBookings(userBookings)
    } catch (error) {
      console.error("[v0] Error in loadUserBookings:", error)
    } finally {
      setLoading(false)
      console.log("[v0] Loading completed, setting loading to false")
    }
  }

  const generateCheckInCode = (bookingId: number): string => {
    // Generate a unique check-in code based on booking ID
    const code = `PV${bookingId.toString().padStart(4, "0")}${Math.random().toString(36).substr(2, 4).toUpperCase()}`
    console.log(`[v0] Generated check-in code: ${code}`)
    return code
  }

  const handleCancelBooking = async (bookingId: number) => {
    try {
      setCancellingBooking(bookingId)
      console.log(`[v0] Starting cancellation process for booking ${bookingId}`)

      console.log(`[v0] Calling cancelBooking(${bookingId}) on contract`)
      const tx = await pugliaContract.cancelBooking(bookingId)
      console.log(`[v0] Cancel booking transaction sent:`, tx)

      console.log(`[v0] Waiting for transaction confirmation...`)
      const receipt = await tx.wait()
      console.log(`[v0] Transaction confirmed:`, receipt)

      console.log(`[v0] Booking ${bookingId} cancelled successfully, reloading bookings`)

      // Reload bookings
      await loadUserBookings()
    } catch (error) {
      console.error(`[v0] Error cancelling booking ${bookingId}:`, error)
    } finally {
      setCancellingBooking(null)
      console.log(`[v0] Finished cancellation process for booking ${bookingId}`)
    }
  }

  const formatDate = (timestamp: bigint): string => {
    return new Date(Number(timestamp) * 1000).toLocaleDateString("it-IT", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getSeasonName = (season: number): string => {
    switch (season) {
      case 0:
        return "Bassa"
      case 1:
        return "Bassa-Media"
      case 2:
        return "Media"
      case 3:
        return "Alta"
      default:
        return "Sconosciuta"
    }
  }

  const getSeasonColor = (season: number): string => {
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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ocean-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Caricamento prenotazioni...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-ocean-900 mb-2">Gestisci Prenotazioni</h1>
        <p className="text-muted-foreground">Visualizza e gestisci le tue prenotazioni per le vacanze in Puglia</p>
      </div>

      {bookings.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nessuna prenotazione trovata</h3>
            <p className="text-muted-foreground text-center mb-4">
              Non hai ancora effettuato prenotazioni. Visita il marketplace per prenotare la tua vacanza da sogno.
            </p>
            <Button onClick={() => router.push("/bookings")}>Prenota Ora</Button>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="active" className="space-y-6">
          <TabsList>
            <TabsTrigger value="active">Prenotazioni Attive</TabsTrigger>
            <TabsTrigger value="past">Prenotazioni Passate</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-6">
            {bookings
              .filter((booking) => !booking.isUsed)
              .map((booking) => (
                <Card key={booking.bookingId} className="overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-ocean-50 to-sand-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-xl text-ocean-900">Prenotazione #{booking.bookingId}</CardTitle>
                        <CardDescription>Prenotato il {formatDate(booking.bookingDate)}</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        {booking.weekDetails && (
                          <Badge className={getSeasonColor(booking.weekDetails.season)}>
                            Stagione {getSeasonName(booking.weekDetails.season)}
                          </Badge>
                        )}
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Attiva
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-ocean-900 mb-2">Dettagli Prenotazione</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              <span>
                                <strong>Ospite:</strong> {booking.guestName}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span>
                                <strong>Contatto:</strong> {booking.contactInfo}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span>
                                <strong>Tipo:</strong> {booking.accommodationType}
                              </span>
                            </div>
                          </div>
                        </div>

                        {booking.weekDetails && (
                          <div>
                            <h4 className="font-semibold text-ocean-900 mb-2">Dettagli Settimana</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span>
                                  <strong>Date:</strong> {formatDate(booking.weekDetails.startDate)} -{" "}
                                  {formatDate(booking.weekDetails.endDate)}
                                </span>
                              </div>
                              <div>
                                <strong>Giorni Catamarano:</strong> {booking.weekDetails.catamaranDays}
                              </div>
                              <div>
                                <strong>Posti Villa:</strong> {booking.weekDetails.villaSlots.toString()}
                              </div>
                              <div>
                                <strong>Posti Luxury:</strong> {booking.weekDetails.luxurySlots.toString()}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="space-y-4">
                        <div className="bg-ocean-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-ocean-900 mb-2">Codice Check-in</h4>
                          <div className="bg-white p-3 rounded border-2 border-dashed border-ocean-200">
                            <code className="text-lg font-mono text-ocean-800">{booking.checkInCode}</code>
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            Fornisci questo codice all'host per il check-in
                          </p>
                        </div>

                        <div className="flex gap-2">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="destructive"
                                size="sm"
                                disabled={cancellingBooking === booking.bookingId}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                {cancellingBooking === booking.bookingId ? "Cancellando..." : "Cancella"}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Conferma Cancellazione</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Sei sicuro di voler cancellare questa prenotazione? Questa azione non può essere
                                  annullata.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annulla</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleCancelBooking(booking.bookingId)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Cancella Prenotazione
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </TabsContent>

          <TabsContent value="past" className="space-y-6">
            {bookings
              .filter((booking) => booking.isUsed)
              .map((booking) => (
                <Card key={booking.bookingId} className="opacity-75">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-xl">Prenotazione #{booking.bookingId}</CardTitle>
                        <CardDescription>Completata</CardDescription>
                      </div>
                      <Badge variant="secondary">Utilizzata</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div>
                        <strong>Ospite:</strong> {booking.guestName}
                      </div>
                      <div>
                        <strong>Contatto:</strong> {booking.contactInfo}
                      </div>
                      <div>
                        <strong>Tipo:</strong> {booking.accommodationType}
                      </div>
                      <div>
                        <strong>Data Prenotazione:</strong> {formatDate(booking.bookingDate)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
