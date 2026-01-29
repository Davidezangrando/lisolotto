"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { type Season, NFTService } from "@/lib/nft"

interface NFTFiltersProps {
  selectedSeason: Season | "all"
  onSeasonChange: (season: Season | "all") => void
  selectedRarity: string | "all"
  onRarityChange: (rarity: string | "all") => void
}

export function NFTFilters({ selectedSeason, onSeasonChange, selectedRarity, onRarityChange }: NFTFiltersProps) {
  const seasons: (Season | "all")[] = ["all", "low", "medium", "high"]
  const rarities = ["all", "common", "rare", "legendary"]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h4 className="font-semibold mb-3">Season</h4>
          <div className="space-y-2">
            {seasons.map((season) => {
              const isSelected = selectedSeason === season
              const seasonInfo = season !== "all" ? NFTService.getSeasonInfo(season) : null

              return (
                <Button
                  key={season}
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  onClick={() => onSeasonChange(season)}
                  className="w-full justify-start"
                >
                  {season === "all" ? "All Seasons" : seasonInfo?.name}
                  {season !== "all" && seasonInfo && (
                    <Badge variant="secondary" className="ml-auto">
                      {seasonInfo.period}
                    </Badge>
                  )}
                </Button>
              )
            })}
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-3">Rarity</h4>
          <div className="space-y-2">
            {rarities.map((rarity) => {
              const isSelected = selectedRarity === rarity

              return (
                <Button
                  key={rarity}
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  onClick={() => onRarityChange(rarity)}
                  className="w-full justify-start capitalize"
                >
                  {rarity === "all" ? "All Rarities" : rarity}
                </Button>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
