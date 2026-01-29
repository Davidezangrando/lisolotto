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
import { Calendar, MapPin, Users, Clock, QrCode, Edit } from "lucide-react"
import { type Booking, BookingService } from "@/lib/booking"
import { useToast } from "@/hooks/use-toast"

interface BookingManagementProps {
  booking: Booking
  onUpdate: () => void
}

interface CheckInData {
  code: string
  generatedAt: string
  expiresAt: string
}

export function BookingManagement({ booking, onUpdate }: BookingManagementProps) {
  const [showEditModal, setShowEditModal] = useState(false)
  const [showCheckInModal, setShowCheckInModal] = useState(false)
  const [checkInData, setCheckInData] = useState<CheckInData | null>(null)
  const [editData, setEditData] = useState({
    guests: booking.guests,
    specialRequests: booking.specialRequests || "",
  })
  const [isUpdating, setIsUpdating] = useState(false)
  const { toast } = useToast()

  const catamaran = BookingService.getCatamaranById(booking.catamaranId)

  const generateCheckInCode = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase()
    const generatedAt = new Date().toISOString()
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours

    const checkIn: CheckInData = {
      code,
      generatedAt,
      expiresAt,
    }

    // Store check-in data in booking
    BookingService.updateBookingCheckIn(booking.id, checkIn)
    setCheckInData(checkIn)
    setShowCheckInModal(true)

    toast({
      title: "Check-in Code Generated",
      description: "Your unique check-in code is ready. Share it with the host.",
    })
  }

  const handleUpdateBooking = async () => {
    setIsUpdating(true)

    try {
      const result = BookingService.updateBooking(booking.id, {
        guests: editData.guests,
        specialRequests: editData.specialRequests,
      })

      if (result.success) {
        toast({
          title: "Booking Updated",
          description: "Your booking details have been successfully updated.",
        })
        setShowEditModal(false)
        onUpdate()
      } else {
        toast({
          title: "Update Failed",
          description: result.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    }

    setIsUpdating(false)
  }

  const getStatusColor = (status: Booking["status"]) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      case "completed":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const canCheckIn = booking.status === "confirmed" && new Date() >= new Date(booking.startDate)
  const canEdit = booking.status === "confirmed" || booking.status === "pending"

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                {catamaran?.name || "Unknown Catamaran"}
              </CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                <Calendar className="h-4 w-4" />
                {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
              </CardDescription>
            </div>
            <Badge className={getStatusColor(booking.status)}>{booking.status}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Duration:</span> {booking.totalDays} days
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Guests:</span> {booking.guests}
            </div>
            <div>
              <span className="text-muted-foreground">Total Cost:</span> {booking.totalCost.toFixed(3)} ETH
            </div>
            <div>
              <span className="text-muted-foreground">Booked:</span> {new Date(booking.createdAt).toLocaleDateString()}
            </div>
          </div>

          {booking.specialRequests && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm">
                <span className="font-medium">Special Requests:</span> {booking.specialRequests}
              </p>
            </div>
          )}

          <Separator />

          <div className="flex gap-2">
            {canCheckIn && (
              <Button onClick={generateCheckInCode} className="flex items-center gap-2">
                <QrCode className="h-4 w-4" />
                Generate Check-in Code
              </Button>
            )}
            {canEdit && (
              <Button variant="outline" onClick={() => setShowEditModal(true)} className="flex items-center gap-2">
                <Edit className="h-4 w-4" />
                Edit Booking
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Booking Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Booking</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="guests">Number of Guests</Label>
              <Input
                id="guests"
                type="number"
                min="1"
                max={catamaran?.capacity || 12}
                value={editData.guests}
                onChange={(e) => setEditData((prev) => ({ ...prev, guests: Number.parseInt(e.target.value) || 1 }))}
              />
              <p className="text-xs text-muted-foreground mt-1">Maximum capacity: {catamaran?.capacity || 12} guests</p>
            </div>

            <div>
              <Label htmlFor="specialRequests">Special Requests</Label>
              <Textarea
                id="specialRequests"
                value={editData.specialRequests}
                onChange={(e) => setEditData((prev) => ({ ...prev, specialRequests: e.target.value }))}
                placeholder="Any dietary restrictions, accessibility needs, or special occasions..."
                rows={3}
              />
            </div>

            <div className="flex gap-4">
              <Button variant="outline" onClick={() => setShowEditModal(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleUpdateBooking} disabled={isUpdating} className="flex-1">
                {isUpdating ? "Updating..." : "Update Booking"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Check-in Code Modal */}
      <Dialog open={showCheckInModal} onOpenChange={setShowCheckInModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Check-in Code Generated</DialogTitle>
          </DialogHeader>
          {checkInData && (
            <div className="space-y-4">
              <Card>
                <CardContent className="text-center py-6">
                  <div className="text-4xl font-mono font-bold text-primary mb-2">{checkInData.code}</div>
                  <p className="text-sm text-muted-foreground">Share this code with your catamaran host</p>
                </CardContent>
              </Card>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Generated:</span>
                  <span>{new Date(checkInData.generatedAt).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Expires:</span>
                  <span>{new Date(checkInData.expiresAt).toLocaleString()}</span>
                </div>
              </div>

              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground">
                  <strong>Important:</strong> This code is valid for 24 hours. The host will use this code to confirm
                  your check-in and start your catamaran experience.
                </p>
              </div>

              <Button onClick={() => setShowCheckInModal(false)} className="w-full">
                Close
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
