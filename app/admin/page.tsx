"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AdminStats } from "@/components/admin/admin-stats"
import { SeasonManagement } from "@/components/admin/season-management"
import { UserManagement } from "@/components/admin/user-management"
import { BookingManagement } from "@/components/admin/booking-management"
import { AdminService } from "@/lib/admin"
import { useAuth } from "@/hooks/use-auth"
import { BlockchainConfig } from "@/components/admin/blockchain-config"
import { useWallet } from "@/lib/blockchain/wallet"
import { VacationManagement } from "@/components/admin/vacation-management"
import { InvestorManagement } from "@/components/admin/investor-management"

export default function AdminPage() {
  const [projectStats, setProjectStats] = useState(AdminService.getProjectStats())
  const [userStats, setUserStats] = useState(AdminService.getUserStats())
  const [seasons, setSeasons] = useState(AdminService.getSeasonConfigs())
  const [users, setUsers] = useState(AdminService.getAllUsers())
  const [bookings, setBookings] = useState(AdminService.getAllBookingsWithDetails())
  const [salesReports, setSalesReports] = useState(AdminService.getSalesReports())

  const { user } = useAuth()
  const { isConnected } = useWallet()
  const router = useRouter()

  useEffect(() => {
    if (!user || user.role !== "admin") {
      router.push("/auth")
      return
    }

    refreshData()
  }, [user, router])

  const refreshData = () => {
    setProjectStats(AdminService.getProjectStats())
    setUserStats(AdminService.getUserStats())
    setSeasons(AdminService.getSeasonConfigs())
    setUsers(AdminService.getAllUsers())
    setBookings(AdminService.getAllBookingsWithDetails())
    setSalesReports(AdminService.getSalesReports())
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-primary mb-4">Admin Access Required</h1>
          <p className="text-muted-foreground mb-6">You need admin privileges to access this page</p>
          <Button onClick={() => router.push("/auth")}>Sign In</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-primary">Admin Dashboard</h1>
              <p className="text-muted-foreground mt-1">Manage your NFT Puglia Vacation platform (V2)</p>
            </div>
            <div className="flex gap-4">
              <Button variant="outline" onClick={() => router.push("/dashboard")}>
                User Dashboard
              </Button>
              <Button variant="outline" onClick={() => router.push("/marketplace")}>
                Marketplace
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="vacations">Vacations</TabsTrigger>
            <TabsTrigger value="investors">Investors</TabsTrigger>
            <TabsTrigger value="seasons">Seasons</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="blockchain">Blockchain</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <AdminStats projectStats={projectStats} userStats={userStats} />

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Contract Info</CardTitle>
                  <CardDescription>V2 Smart Contract on Polygon</CardDescription>
                </CardHeader>
                <CardContent>
                  {!isConnected ? (
                    <p className="text-muted-foreground">Connect wallet to view contract data</p>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                        <span className="text-sm">Contract Address</span>
                        <span className="text-xs font-mono">0x8bAc...9432</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                        <span className="text-sm">Network</span>
                        <span className="text-sm">Polygon Mainnet</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                        <span className="text-sm">Contract Version</span>
                        <span className="text-sm font-semibold">V2</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common administrative tasks</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start bg-transparent" onClick={refreshData}>
                    Refresh Data
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    Export User Data
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    Generate Sales Report
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="vacations">
            <VacationManagement />
          </TabsContent>

          <TabsContent value="investors">
            <InvestorManagement />
          </TabsContent>

          <TabsContent value="seasons">
            <SeasonManagement seasons={seasons} onUpdate={refreshData} />
          </TabsContent>

          <TabsContent value="users">
            <UserManagement users={users} />
          </TabsContent>

          <TabsContent value="bookings">
            <BookingManagement bookings={bookings} onUpdate={refreshData} />
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-primary mb-4">Sales Reports</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {salesReports.map((report) => (
                  <Card key={report.season}>
                    <CardHeader>
                      <CardTitle className="capitalize">{report.season} Season</CardTitle>
                      <CardDescription>Sales performance and metrics</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">NFTs Sold:</span>
                        <span className="font-semibold">{report.totalSales}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Revenue:</span>
                        <span className="font-semibold">{report.totalRevenue.toFixed(3)} ETH</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Avg Price:</span>
                        <span className="font-semibold">{report.averagePrice.toFixed(3)} ETH</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Remaining:</span>
                        <span className="font-semibold">{report.nftsRemaining}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="blockchain">
            <BlockchainConfig />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
