"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { pugliaContract } from "@/lib/blockchain/puglia-contract"
import { useWallet } from "@/lib/blockchain/wallet"
import { toast } from "sonner"
import { Loader2, Calendar, MapPin, AlertTriangle, Plus, Trash2, Eye } from "lucide-react"

export function VacationManagement() {
  const { isConnected } = useWallet()

  // ─── Batch Create State ───
  const [batchForm, setBatchForm] = useState({
    seasonStartDate: "",
    numberOfWeeks: "12",
    location: "Puglia",
  })
  const [generatedWeeks, setGeneratedWeeks] = useState<
    Array<{ startDate: number; endDate: number; dateLabel: string }>
  >([])
  const [isBatchCreating, setIsBatchCreating] = useState(false)

  // ─── Single Create State ───
  const [singleForm, setSingleForm] = useState({
    startDate: "",
    endDate: "",
    location: "",
  })
  const [isSingleCreating, setIsSingleCreating] = useState(false)

  // ─── Emergency Cancel State ───
  const [cancelVacationId, setCancelVacationId] = useState("")
  const [isCancelling, setIsCancelling] = useState(false)

  // ─── Vacation Lookup State ───
  const [lookupId, setLookupId] = useState("")
  const [lookupResult, setLookupResult] = useState<{
    startDate: string
    endDate: string
    location: string
    isBooked: boolean
    bookedByToken: string
  } | null>(null)
  const [isLooking, setIsLooking] = useState(false)

  // ─── Batch Generate Preview ───
  const handleGeneratePreview = () => {
    if (!batchForm.seasonStartDate || !batchForm.numberOfWeeks) {
      toast.error("Please select a start date and number of weeks")
      return
    }

    const start = new Date(batchForm.seasonStartDate)
    const numWeeks = parseInt(batchForm.numberOfWeeks)
    const weeks: Array<{ startDate: number; endDate: number; dateLabel: string }> = []

    for (let i = 0; i < numWeeks; i++) {
      const weekStart = new Date(start)
      weekStart.setDate(weekStart.getDate() + i * 7)

      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekEnd.getDate() + 6)

      weeks.push({
        startDate: Math.floor(weekStart.getTime() / 1000),
        endDate: Math.floor(weekEnd.getTime() / 1000),
        dateLabel: `${weekStart.toLocaleDateString("it-IT")} - ${weekEnd.toLocaleDateString("it-IT")}`,
      })
    }

    setGeneratedWeeks(weeks)
    toast.success(`Generated preview for ${numWeeks} weeks`)
  }

  const handleBatchCreate = async () => {
    if (!isConnected) {
      toast.error("Connect your wallet first")
      return
    }

    if (generatedWeeks.length === 0) {
      toast.error("Generate a preview first")
      return
    }

    setIsBatchCreating(true)
    try {
      const startDates = generatedWeeks.map((w) => w.startDate)
      const endDates = generatedWeeks.map((w) => w.endDate)
      const locations = generatedWeeks.map(() => batchForm.location)

      const tx = await pugliaContract.batchCreateVacations(startDates, endDates, locations)
      toast.info("Transaction submitted! Waiting for confirmation...")
      await tx.wait()
      toast.success(`${generatedWeeks.length} vacation slots created successfully!`)

      setGeneratedWeeks([])
      setBatchForm({ seasonStartDate: "", numberOfWeeks: "12", location: "Puglia" })
    } catch (error: any) {
      console.error("Error batch creating vacations:", error)
      toast.error(error.reason || error.message || "Failed to create vacations")
    } finally {
      setIsBatchCreating(false)
    }
  }

  // ─── Single Create ───
  const handleSingleCreate = async () => {
    if (!isConnected) {
      toast.error("Connect your wallet first")
      return
    }

    if (!singleForm.startDate || !singleForm.endDate || !singleForm.location) {
      toast.error("Please fill in all fields")
      return
    }

    setIsSingleCreating(true)
    try {
      const startTimestamp = Math.floor(new Date(singleForm.startDate).getTime() / 1000)
      const endTimestamp = Math.floor(new Date(singleForm.endDate).getTime() / 1000)

      const tx = await pugliaContract.createVacation(startTimestamp, endTimestamp, singleForm.location)
      toast.info("Transaction submitted! Waiting for confirmation...")
      await tx.wait()
      toast.success("Vacation slot created successfully!")

      setSingleForm({ startDate: "", endDate: "", location: "" })
    } catch (error: any) {
      console.error("Error creating vacation:", error)
      toast.error(error.reason || error.message || "Failed to create vacation")
    } finally {
      setIsSingleCreating(false)
    }
  }

  // ─── Emergency Cancel ───
  const handleEmergencyCancel = async () => {
    if (!isConnected) {
      toast.error("Connect your wallet first")
      return
    }

    if (!cancelVacationId) {
      toast.error("Please enter a vacation ID")
      return
    }

    setIsCancelling(true)
    try {
      const tx = await pugliaContract.adminCancelBooking(parseInt(cancelVacationId))
      toast.info("Transaction submitted! Waiting for confirmation...")
      await tx.wait()
      toast.success(`Booking for vacation #${cancelVacationId} force-cancelled!`)
      setCancelVacationId("")
    } catch (error: any) {
      console.error("Error force-cancelling:", error)
      toast.error(error.reason || error.message || "Failed to cancel booking")
    } finally {
      setIsCancelling(false)
    }
  }

  // ─── Vacation Lookup ───
  const handleLookup = async () => {
    if (!lookupId) {
      toast.error("Please enter a vacation ID")
      return
    }

    setIsLooking(true)
    setLookupResult(null)
    try {
      const vacation = await pugliaContract.getVacation(parseInt(lookupId))
      setLookupResult({
        startDate: pugliaContract.formatDate(vacation.startDate),
        endDate: pugliaContract.formatDate(vacation.endDate),
        location: vacation.location,
        isBooked: vacation.isBooked,
        bookedByToken: vacation.bookedByToken > BigInt(0) ? vacation.bookedByToken.toString() : "N/A",
      })
    } catch (error: any) {
      console.error("Error looking up vacation:", error)
      toast.error("Vacation not found or error fetching data")
    } finally {
      setIsLooking(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-primary mb-2">Vacation Management</h2>
        <p className="text-muted-foreground">Create vacation slots and manage bookings</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* ─── Batch Vacation Creator ─── */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Batch Vacation Creator
            </CardTitle>
            <CardDescription>
              Generate consecutive weekly vacation slots for an entire season in one transaction
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="batchStartDate">Season Start Date</Label>
                <Input
                  id="batchStartDate"
                  type="date"
                  value={batchForm.seasonStartDate}
                  onChange={(e) => setBatchForm({ ...batchForm, seasonStartDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="numWeeks">Number of Weeks</Label>
                <Input
                  id="numWeeks"
                  type="number"
                  min="1"
                  max="52"
                  value={batchForm.numberOfWeeks}
                  onChange={(e) => setBatchForm({ ...batchForm, numberOfWeeks: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="batchLocation">Location</Label>
                <Input
                  id="batchLocation"
                  value={batchForm.location}
                  onChange={(e) => setBatchForm({ ...batchForm, location: e.target.value })}
                  placeholder="e.g., Puglia"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={handleGeneratePreview}>
                <Calendar className="h-4 w-4 mr-2" />
                Generate Preview
              </Button>
              <Button
                onClick={handleBatchCreate}
                disabled={isBatchCreating || !isConnected || generatedWeeks.length === 0}
              >
                {isBatchCreating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Creating {generatedWeeks.length} weeks...
                  </>
                ) : (
                  `Create ${generatedWeeks.length} Vacation Slots`
                )}
              </Button>
            </div>

            {generatedWeeks.length > 0 && (
              <div className="border rounded-lg p-4 max-h-60 overflow-y-auto">
                <p className="text-sm font-medium mb-3">
                  Preview: {generatedWeeks.length} weeks starting from{" "}
                  {new Date(batchForm.seasonStartDate).toLocaleDateString("it-IT")}
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {generatedWeeks.map((week, i) => (
                    <div key={i} className="text-xs p-2 bg-muted rounded flex items-center gap-1">
                      <Badge variant="outline" className="text-[10px]">W{i + 1}</Badge>
                      <span>{week.dateLabel}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ─── Single Vacation Creator ─── */}
        <Card>
          <CardHeader>
            <CardTitle>Create Single Vacation</CardTitle>
            <CardDescription>Add an individual vacation slot</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="singleStart">Start Date</Label>
                <Input
                  id="singleStart"
                  type="date"
                  value={singleForm.startDate}
                  onChange={(e) => setSingleForm({ ...singleForm, startDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="singleEnd">End Date</Label>
                <Input
                  id="singleEnd"
                  type="date"
                  value={singleForm.endDate}
                  onChange={(e) => setSingleForm({ ...singleForm, endDate: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="singleLocation">Location</Label>
              <Input
                id="singleLocation"
                value={singleForm.location}
                onChange={(e) => setSingleForm({ ...singleForm, location: e.target.value })}
                placeholder="e.g., Puglia, Villa Marina"
              />
            </div>
            <Button
              onClick={handleSingleCreate}
              disabled={isSingleCreating || !isConnected}
              className="w-full"
            >
              {isSingleCreating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                "Create Vacation Slot"
              )}
            </Button>
          </CardContent>
        </Card>

        {/* ─── Vacation Lookup ─── */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Vacation Lookup
            </CardTitle>
            <CardDescription>Inspect a specific vacation slot by ID</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                type="number"
                value={lookupId}
                onChange={(e) => setLookupId(e.target.value)}
                placeholder="Vacation ID"
              />
              <Button onClick={handleLookup} disabled={isLooking} variant="outline">
                {isLooking ? <Loader2 className="h-4 w-4 animate-spin" /> : "Lookup"}
              </Button>
            </div>

            {lookupResult && (
              <div className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span className="font-medium">{lookupResult.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>{lookupResult.startDate} - {lookupResult.endDate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={lookupResult.isBooked ? "destructive" : "default"}>
                    {lookupResult.isBooked ? "Booked" : "Available"}
                  </Badge>
                  {lookupResult.isBooked && (
                    <span className="text-xs text-muted-foreground">
                      by Token #{lookupResult.bookedByToken}
                    </span>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* ─── Emergency Controls ─── */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Emergency Controls
          </CardTitle>
          <CardDescription>
            Force-cancel bookings as admin. This bypasses user cancellation deadlines.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <div className="flex-1">
              <Label htmlFor="emergencyCancelId">Vacation ID to Force-Cancel</Label>
              <Input
                id="emergencyCancelId"
                type="number"
                value={cancelVacationId}
                onChange={(e) => setCancelVacationId(e.target.value)}
                placeholder="Enter vacation ID"
              />
            </div>
            <div className="flex items-end">
              <Button
                variant="destructive"
                onClick={handleEmergencyCancel}
                disabled={isCancelling || !isConnected || !cancelVacationId}
              >
                {isCancelling ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Cancelling...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Force Cancel
                  </>
                )}
              </Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Use the Vacation Lookup above to inspect a vacation before force-cancelling.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
