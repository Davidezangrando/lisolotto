"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Catamaran } from "@/lib/booking"
import { NFTService, type PugliaSeason } from "@/lib/nft"

interface CatamaranCardProps {
  catamaran: Catamaran
  onBook: (catamaran: Catamaran) => void
}

export function CatamaranCard({ catamaran, onBook }: CatamaranCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative">
        <Image
          src={catamaran.image || "/placeholder.svg"}
          alt={catamaran.name}
          width={400}
          height={250}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-2 right-2">
          <Badge variant="secondary">{catamaran.capacity} guests max</Badge>
        </div>
      </div>

      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{catamaran.name}</CardTitle>
            <CardDescription className="mt-1">{catamaran.description}</CardDescription>
            <p className="text-sm text-muted-foreground mt-2">{catamaran.location}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-primary">{catamaran.pricePerDay} ETH</p>
            <p className="text-xs text-muted-foreground">per day</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <h4 className="font-semibold text-sm mb-2">Available Seasons</h4>
          <div className="flex gap-2 flex-wrap">
            {catamaran.availableSeasons.map((season) => {
              const seasonInfo = NFTService.getSeasonInfo(season as PugliaSeason)
              if (!seasonInfo) {
                return (
                  <Badge key={season} variant="outline">
                    {season}
                  </Badge>
                )
              }
              return (
                <Badge key={season} variant="outline" className={seasonInfo.color}>
                  {seasonInfo.name}
                </Badge>
              )
            })}
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-sm mb-2">Amenities</h4>
          <div className="grid grid-cols-2 gap-1 text-xs">
            {catamaran.amenities.slice(0, 6).map((amenity, index) => (
              <div key={index} className="flex items-center">
                <span className="w-1 h-1 bg-accent rounded-full mr-2"></span>
                {amenity}
              </div>
            ))}
            {catamaran.amenities.length > 6 && (
              <div className="text-muted-foreground">+{catamaran.amenities.length - 6} more</div>
            )}
          </div>
        </div>

        <Button onClick={() => onBook(catamaran)} className="w-full">
          Book This Catamaran
        </Button>
      </CardContent>
    </Card>
  )
}
