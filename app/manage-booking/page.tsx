"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"


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
import { useWallet } from "@/lib/blockchain/wallet"
import { pugliaContract } from "@/lib/blockchain/puglia-contract"
import { NFTService } from "@/lib/nft"
import { Calendar, MapPin, Trash2, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface BookingDisplay {
  tokenId: number
  vacationId: number
  startDate: string
  endDate: string
  location: string
  isBooked: boolean
}

export default function ManageBookingPage() {
  const { user } = useAuth()
  const { isConnected, walletAddress } = useWallet()
  const router = useRouter()
  const [bookings, setBookings] = useState<BookingDisplay[]>([])
  const [loading, setLoading] = useState(true)
  const [cancellingKey, setCancellingKey] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      router.push("/auth")
      return
    }

    loadUserBookings()
  }, [user, router, isConnected, walletAddress])

  const loadUserBookings = async () => {
    if (!isConnected || !walletAddress) {
      setBookings([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const tokens = await NFTService.getUserTokens(walletAddress)
      const allBookings: BookingDisplay[] = []

      for (const token of tokens) {
        for (const vacId of token.bookedVacations) {
          const slot = await NFTService.getVacationSlot(vacId)
          if (slot) {
            allBookings.push({
              tokenId: token.tokenId,
              vacationId: vacId,
              startDate: slot.startDate,
              endDate: slot.endDate,
              location: slot.location,
              isBooked: slot.isBooked,
            })
          }
        }
      }

      setBookings(allBookings)
    } catch (error) {
      console.error("Error loading bookings:", error)
      toast.error("Errore nel caricamento delle prenotazioni")
    } finally {
      setLoading(false)
    }
  }

  const handleCancelBooking = async (tokenId: number, vacationId: number) => {
    const key = `${tokenId}-${vacationId}`
    setCancellingKey(key)

    try {
      const tx = await pugliaContract.cancelBooking(tokenId, vacationId)
      toast.info("Transazione inviata, in attesa di conferma...")
      await tx.wait()
      toast.success("Prenotazione cancellata con successo!")
      await loadUserBookings()
    } catch (error: any) {
      console.error("Error cancelling booking:", error)
      toast.error(error.reason || error.message || "Errore nella cancellazione")
    } finally {
      setCancellingKey(null)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px] gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Caricamento prenotazioni...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary mb-2">Gestisci Prenotazioni</h1>
          <p className="text-muted-foreground">
            Visualizza e gestisci le tue prenotazioni per le vacanze in Puglia
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => router.push("/bookings")}>
            Prenota Ora
          </Button>
          <Button variant="outline" onClick={() => router.push("/dashboard")}>
            Dashboard
          </Button>
        </div>
      </div>

      {!isConnected ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              Connetti il tuo wallet per visualizzare le prenotazioni
            </p>
          </CardContent>
        </Card>
      ) : bookings.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nessuna prenotazione trovata</h3>
            <p className="text-muted-foreground text-center mb-4">
              Non hai ancora effettuato prenotazioni.
            </p>
            <Button onClick={() => router.push("/bookings")}>Prenota Ora</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {bookings.length} prenotazione/i attiva/e
          </p>

          {bookings.map((booking) => {
            const key = `${booking.tokenId}-${booking.vacationId}`
            const isCancelling = cancellingKey === key

            return (
              <Card key={key} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <MapPin className="h-5 w-5 text-primary" />
                        <span className="text-lg font-semibold">{booking.location}</span>
                        <Badge variant="outline">Vacation #{booking.vacationId}</Badge>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {booking.startDate} - {booking.endDate}
                        </span>
                      </div>

                      <p className="text-xs text-muted-foreground">
                        NFT Token #{booking.tokenId}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <Badge variant="default">Attiva</Badge>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="destructive"
                            size="sm"
                            disabled={isCancelling}
                          >
                            {isCancelling ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                Cancellando...
                              </>
                            ) : (
                              <>
                                <Trash2 className="h-4 w-4 mr-2" />
                                Cancella
                              </>
                            )}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Conferma Cancellazione</AlertDialogTitle>
                            <AlertDialogDescription>
                              Sei sicuro di voler cancellare questa prenotazione per {booking.location} ({booking.startDate} - {booking.endDate})?
                              Questa azione non puo essere annullata.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annulla</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleCancelBooking(booking.tokenId, booking.vacationId)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Cancella Prenotazione
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
