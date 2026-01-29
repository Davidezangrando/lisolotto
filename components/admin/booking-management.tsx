"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Booking } from "@/lib/booking"
import { AdminService } from "@/lib/admin"
import { useToast } from "@/hooks/use-toast"

interface BookingWithDetails extends Booking {
  userName: string
  userEmail: string
  catamaranName: string
}

interface BookingManagementProps {
  bookings: BookingWithDetails[]
  onUpdate: () => void
}

export function BookingManagement({ bookings, onUpdate }: BookingManagementProps) {
  const [statusFilter, setStatusFilter] = useState<"all" | Booking["status"]>("all")
  const [updatingBooking, setUpdatingBooking] = useState<string | null>(null)
  const { toast } = useToast()

  const filteredBookings = bookings.filter((booking) => statusFilter === "all" || booking.status === statusFilter)

  const handleStatusUpdate = async (bookingId: string, newStatus: Booking["status"]) => {
    setUpdatingBooking(bookingId)

    const result = await AdminService.updateBookingStatus(bookingId, newStatus)

    if (result.success) {
      toast({
        title: "Booking Updated",
        description: `Booking status changed to ${newStatus}`,
      })
      onUpdate()
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to update booking",
        variant: "destructive",
      })
    }

    setUpdatingBooking(null)
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

  const getBookingStats = () => {
    const total = bookings.length
    const confirmed = bookings.filter((b) => b.status === "confirmed").length
    const pending = bookings.filter((b) => b.status === "pending").length
    const revenue = bookings.filter((b) => b.status === "confirmed").reduce((sum, b) => sum + b.totalCost, 0)

    return { total, confirmed, pending, revenue }
  }

  const stats = getBookingStats()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-primary">Booking Management</h2>
          <p className="text-muted-foreground">Manage catamaran bookings and reservations</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-primary">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Total Bookings</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{stats.confirmed}</div>
            <p className="text-xs text-muted-foreground">Confirmed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-primary">{stats.revenue.toFixed(3)} ETH</div>
            <p className="text-xs text-muted-foreground">Revenue</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Bookings ({bookings.length})</SelectItem>
            <SelectItem value="pending">Pending ({bookings.filter((b) => b.status === "pending").length})</SelectItem>
            <SelectItem value="confirmed">
              Confirmed ({bookings.filter((b) => b.status === "confirmed").length})
            </SelectItem>
            <SelectItem value="cancelled">
              Cancelled ({bookings.filter((b) => b.status === "cancelled").length})
            </SelectItem>
            <SelectItem value="completed">
              Completed ({bookings.filter((b) => b.status === "completed").length})
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Bookings Table */}
      <Card>
        <CardHeader>
          <CardTitle>Bookings ({filteredBookings.length})</CardTitle>
          <CardDescription>Manage and update booking statuses</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Guest</TableHead>
                <TableHead>Catamaran</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Guests</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{booking.userName}</p>
                      <p className="text-sm text-muted-foreground">{booking.userEmail}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">{booking.catamaranName}</p>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p>{new Date(booking.startDate).toLocaleDateString()}</p>
                      <p className="text-muted-foreground">to {new Date(booking.endDate).toLocaleDateString()}</p>
                      <p className="text-xs text-muted-foreground">({booking.totalDays} days)</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold">{booking.guests}</span>
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold">{booking.totalCost.toFixed(3)} ETH</span>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(booking.status)}>{booking.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {booking.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={updatingBooking === booking.id}
                            onClick={() => handleStatusUpdate(booking.id, "confirmed")}
                          >
                            Confirm
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={updatingBooking === booking.id}
                            onClick={() => handleStatusUpdate(booking.id, "cancelled")}
                          >
                            Cancel
                          </Button>
                        </>
                      )}
                      {booking.status === "confirmed" && (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={updatingBooking === booking.id}
                          onClick={() => handleStatusUpdate(booking.id, "completed")}
                        >
                          Complete
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
