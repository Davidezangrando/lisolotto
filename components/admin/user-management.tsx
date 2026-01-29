"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { User } from "@/lib/auth"
import { NFTService } from "@/lib/nft"
import { BookingService } from "@/lib/booking"

interface UserManagementProps {
  users: User[]
}

export function UserManagement({ users }: UserManagementProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRole, setSelectedRole] = useState<"all" | "investor" | "admin">("all")

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = selectedRole === "all" || user.role === selectedRole
    return matchesSearch && matchesRole
  })

  const getUserNFTCount = (userId: string) => {
    return NFTService.getOwnedNFTs(userId).length
  }

  const getUserBookingCount = (userId: string) => {
    return BookingService.getUserBookings(userId).length
  }

  const getRoleColor = (role: string) => {
    return role === "admin" ? "bg-purple-100 text-purple-800" : "bg-green-100 text-green-800"
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-primary">User Management</h2>
          <p className="text-muted-foreground">View and manage all platform users</p>
        </div>
      </div>

      <div className="flex gap-4 items-center">
        <Input
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <div className="flex gap-2">
          <Button
            variant={selectedRole === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedRole("all")}
          >
            All ({users.length})
          </Button>
          <Button
            variant={selectedRole === "investor" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedRole("investor")}
          >
            Investors ({users.filter((u) => u.role === "investor").length})
          </Button>
          <Button
            variant={selectedRole === "admin" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedRole("admin")}
          >
            Admins ({users.filter((u) => u.role === "admin").length})
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Users ({filteredUsers.length})</CardTitle>
          <CardDescription>Complete list of platform users with their activity</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>NFTs Owned</TableHead>
                <TableHead>Bookings</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getRoleColor(user.role)}>{user.role}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold">{getUserNFTCount(user.id)}</span>
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold">{getUserBookingCount(user.id)}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </span>
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
