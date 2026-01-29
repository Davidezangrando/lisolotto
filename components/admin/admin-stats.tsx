"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { ProjectStats, UserStats } from "@/lib/admin"

interface AdminStatsProps {
  projectStats: ProjectStats
  userStats: UserStats
}

export function AdminStats({ projectStats, userStats }: AdminStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total NFTs Sold</CardTitle>
          <Badge variant="secondary">{projectStats.totalNFTsSold}</Badge>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">{projectStats.totalNFTsSold}</div>
          <p className="text-xs text-muted-foreground">Across all seasons</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <Badge variant="secondary">{projectStats.totalRevenue.toFixed(2)} ETH</Badge>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">{projectStats.totalRevenue.toFixed(3)} ETH</div>
          <p className="text-xs text-muted-foreground">From NFT sales</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Users</CardTitle>
          <Badge variant="secondary">{userStats.totalUsers}</Badge>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">{userStats.investorUsers}</div>
          <p className="text-xs text-muted-foreground">+{userStats.newUsersThisMonth} this month</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Catamaran Utilization</CardTitle>
          <Badge variant="secondary">{projectStats.catamaranUtilization.toFixed(1)}%</Badge>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">{projectStats.catamaranUtilization.toFixed(1)}%</div>
          <p className="text-xs text-muted-foreground">{projectStats.totalBookings} total bookings</p>
        </CardContent>
      </Card>
    </div>
  )
}
