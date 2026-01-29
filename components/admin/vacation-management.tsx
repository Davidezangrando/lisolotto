"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { pugliaContract, type Season } from "@/lib/blockchain/puglia-contract"
import { useWallet } from "@/lib/blockchain/wallet"
import { toast } from "sonner"

export function VacationManagement() {
  const { isConnected } = useWallet()
  const [isLoading, setIsLoading] = useState(false)

  // Create Vacation Week Form
  const [createForm, setCreateForm] = useState({
    startDate: "",
    endDate: "",
    season: "",
    villaSlots: "",
    luxurySlots: "",
    villaValue: "",
    luxuryValue: "",
    catamaranDays: "",
  })

  // Remove Vacation Week Form
  const [removeWeekId, setRemoveWeekId] = useState("")

  // Update Season Cost Form
  const [seasonCostForm, setSeasonCostForm] = useState({
    season: "",
    nftCost: "",
  })

  const handleCreateVacationWeek = async () => {
    if (!isConnected) {
      toast.error("Connect your wallet first")
      return
    }

    if (!createForm.startDate || !createForm.endDate || !createForm.season) {
      toast.error("Please fill in all required fields")
      return
    }

    setIsLoading(true)
    try {
      const startTimestamp = Math.floor(new Date(createForm.startDate).getTime() / 1000)
      const endTimestamp = Math.floor(new Date(createForm.endDate).getTime() / 1000)

      const tx = await pugliaContract.createVacationWeek(
        startTimestamp,
        endTimestamp,
        Number.parseInt(createForm.season) as Season,
        Number.parseInt(createForm.villaSlots) || 0,
        Number.parseInt(createForm.luxurySlots) || 0,
        BigInt(createForm.villaValue || "0"),
        BigInt(createForm.luxuryValue || "0"),
        createForm.catamaranDays,
      )

      toast.success("Transaction submitted! Waiting for confirmation...")
      await tx.wait()
      toast.success("Vacation week created successfully!")

      // Reset form
      setCreateForm({
        startDate: "",
        endDate: "",
        season: "",
        villaSlots: "",
        luxurySlots: "",
        villaValue: "",
        luxuryValue: "",
        catamaranDays: "",
      })
    } catch (error: any) {
      console.error("Error creating vacation week:", error)
      toast.error(error.message || "Failed to create vacation week")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveVacationWeek = async () => {
    if (!isConnected) {
      toast.error("Connect your wallet first")
      return
    }

    if (!removeWeekId) {
      toast.error("Please enter a week ID")
      return
    }

    setIsLoading(true)
    try {
      const tx = await pugliaContract.removeVacationWeek(Number.parseInt(removeWeekId))
      toast.success("Transaction submitted! Waiting for confirmation...")
      await tx.wait()
      toast.success("Vacation week removed successfully!")
      setRemoveWeekId("")
    } catch (error: any) {
      console.error("Error removing vacation week:", error)
      toast.error(error.message || "Failed to remove vacation week")
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateSeasonCost = async () => {
    if (!isConnected) {
      toast.error("Connect your wallet first")
      return
    }

    if (!seasonCostForm.season || !seasonCostForm.nftCost) {
      toast.error("Please fill in all fields")
      return
    }

    setIsLoading(true)
    try {
      const tx = await pugliaContract.updateSeasonCost(
        Number.parseInt(seasonCostForm.season) as Season,
        Number.parseInt(seasonCostForm.nftCost),
      )
      toast.success("Transaction submitted! Waiting for confirmation...")
      await tx.wait()
      toast.success("Season cost updated successfully!")
      setSeasonCostForm({ season: "", nftCost: "" })
    } catch (error: any) {
      console.error("Error updating season cost:", error)
      toast.error(error.message || "Failed to update season cost")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-primary mb-4">Vacation Management</h2>
        <p className="text-muted-foreground">Manage vacation weeks and season costs</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Create Vacation Week */}
        <Card>
          <CardHeader>
            <CardTitle>Create Vacation Week</CardTitle>
            <CardDescription>Add a new vacation week to the contract</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={createForm.startDate}
                  onChange={(e) => setCreateForm({ ...createForm, startDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={createForm.endDate}
                  onChange={(e) => setCreateForm({ ...createForm, endDate: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="season">Season</Label>
              <Select
                value={createForm.season}
                onValueChange={(value) => setCreateForm({ ...createForm, season: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select season" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Bassa (1 NFT)</SelectItem>
                  <SelectItem value="1">Bassa-Media (2 NFT)</SelectItem>
                  <SelectItem value="2">Media (3 NFT)</SelectItem>
                  <SelectItem value="3">Alta (4 NFT)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="villaSlots">Villa Slots</Label>
                <Input
                  id="villaSlots"
                  type="number"
                  value={createForm.villaSlots}
                  onChange={(e) => setCreateForm({ ...createForm, villaSlots: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="luxurySlots">Luxury Slots</Label>
                <Input
                  id="luxurySlots"
                  type="number"
                  value={createForm.luxurySlots}
                  onChange={(e) => setCreateForm({ ...createForm, luxurySlots: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="villaValue">Villa Value</Label>
                <Input
                  id="villaValue"
                  type="number"
                  value={createForm.villaValue}
                  onChange={(e) => setCreateForm({ ...createForm, villaValue: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="luxuryValue">Luxury Value</Label>
                <Input
                  id="luxuryValue"
                  type="number"
                  value={createForm.luxuryValue}
                  onChange={(e) => setCreateForm({ ...createForm, luxuryValue: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="catamaranDays">Catamaran Days</Label>
              <Textarea
                id="catamaranDays"
                value={createForm.catamaranDays}
                onChange={(e) => setCreateForm({ ...createForm, catamaranDays: e.target.value })}
                placeholder="e.g., 3 gg Villa + 3 gg Luxury (max)"
              />
            </div>

            <Button onClick={handleCreateVacationWeek} disabled={isLoading || !isConnected} className="w-full">
              {isLoading ? "Creating..." : "Create Vacation Week"}
            </Button>
          </CardContent>
        </Card>

        {/* Remove Vacation Week */}
        <Card>
          <CardHeader>
            <CardTitle>Remove Vacation Week</CardTitle>
            <CardDescription>Remove a vacation week (only if no active bookings)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="removeWeekId">Week ID</Label>
              <Input
                id="removeWeekId"
                type="number"
                value={removeWeekId}
                onChange={(e) => setRemoveWeekId(e.target.value)}
                placeholder="Enter week ID to remove"
              />
            </div>

            <Button
              onClick={handleRemoveVacationWeek}
              disabled={isLoading || !isConnected}
              variant="destructive"
              className="w-full"
            >
              {isLoading ? "Removing..." : "Remove Vacation Week"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Update Season Cost */}
      <Card>
        <CardHeader>
          <CardTitle>Update Season Cost</CardTitle>
          <CardDescription>Update the NFT cost for each season</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="seasonSelect">Season</Label>
              <Select
                value={seasonCostForm.season}
                onValueChange={(value) => setSeasonCostForm({ ...seasonCostForm, season: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select season" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Bassa</SelectItem>
                  <SelectItem value="1">Bassa-Media</SelectItem>
                  <SelectItem value="2">Media</SelectItem>
                  <SelectItem value="3">Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="nftCost">NFT Cost</Label>
              <Input
                id="nftCost"
                type="number"
                value={seasonCostForm.nftCost}
                onChange={(e) => setSeasonCostForm({ ...seasonCostForm, nftCost: e.target.value })}
                placeholder="Number of NFTs required"
              />
            </div>

            <div className="flex items-end">
              <Button onClick={handleUpdateSeasonCost} disabled={isLoading || !isConnected} className="w-full">
                {isLoading ? "Updating..." : "Update Cost"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
