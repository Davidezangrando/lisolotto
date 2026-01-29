"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { SeasonConfig } from "@/lib/admin"
import { AdminService } from "@/lib/admin"
import { useToast } from "@/hooks/use-toast"

interface SeasonManagementProps {
  seasons: SeasonConfig[]
  onUpdate: () => void
}

export function SeasonManagement({ seasons, onUpdate }: SeasonManagementProps) {
  const [editingSeason, setEditingSeason] = useState<SeasonConfig | null>(null)
  const [formData, setFormData] = useState<Partial<SeasonConfig>>({})
  const { toast } = useToast()

  const handleEdit = (season: SeasonConfig) => {
    setEditingSeason(season)
    setFormData(season)
  }

  const handleSave = () => {
    if (!editingSeason || !formData.season) return

    const success = AdminService.updateSeasonConfig(editingSeason.season, formData)

    if (success) {
      toast({
        title: "Season Updated",
        description: "Season configuration has been saved successfully.",
      })
      setEditingSeason(null)
      onUpdate()
    } else {
      toast({
        title: "Error",
        description: "Failed to update season configuration.",
        variant: "destructive",
      })
    }
  }

  const getSeasonColor = (season: string) => {
    switch (season) {
      case "low":
        return "bg-blue-100 text-blue-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "high":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-primary">Season Management</h2>
          <p className="text-muted-foreground">Configure NFT seasons, pricing, and availability</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {seasons.map((season) => (
          <Card key={season.season} className="relative">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {season.name}
                    <Badge className={getSeasonColor(season.season)}>{season.season}</Badge>
                  </CardTitle>
                  <CardDescription>
                    {new Date(season.startDate).toLocaleDateString()} - {new Date(season.endDate).toLocaleDateString()}
                  </CardDescription>
                </div>
                <Switch checked={season.isActive} disabled />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Price:</span>
                  <p className="font-semibold">{season.priceETH} ETH</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Max NFTs:</span>
                  <p className="font-semibold">{season.maxNFTs}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Sold:</span>
                  <p className="font-semibold">{season.currentNFTs}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Remaining:</span>
                  <p className="font-semibold">{season.maxNFTs - season.currentNFTs}</p>
                </div>
              </div>

              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${(season.currentNFTs / season.maxNFTs) * 100}%` }}
                />
              </div>

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full bg-transparent" onClick={() => handleEdit(season)}>
                    Edit Season
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit {season.name}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Start Date</Label>
                        <Input
                          type="date"
                          value={formData.startDate || ""}
                          onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>End Date</Label>
                        <Input
                          type="date"
                          value={formData.endDate || ""}
                          onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Price (ETH)</Label>
                        <Input
                          type="number"
                          step="0.001"
                          value={formData.priceETH || ""}
                          onChange={(e) =>
                            setFormData({ ...formData, priceETH: Number.parseFloat(e.target.value) || 0 })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Max NFTs</Label>
                        <Input
                          type="number"
                          value={formData.maxNFTs || ""}
                          onChange={(e) => setFormData({ ...formData, maxNFTs: Number.parseInt(e.target.value) || 0 })}
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={formData.isActive || false}
                        onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                      />
                      <Label>Season Active</Label>
                    </div>

                    <Alert>
                      <AlertDescription>
                        Changes to season configuration will affect new NFT minting and marketplace pricing.
                      </AlertDescription>
                    </Alert>

                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1 bg-transparent">
                        Cancel
                      </Button>
                      <Button onClick={handleSave} className="flex-1">
                        Save Changes
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
