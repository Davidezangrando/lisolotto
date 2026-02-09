"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { pugliaContract } from "@/lib/blockchain/puglia-contract"
import { useWallet } from "@/lib/blockchain/wallet"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

export function InvestorManagement() {
  const { isConnected } = useWallet()
  const [isLoading, setIsLoading] = useState(false)

  const [mintForm, setMintForm] = useState({
    walletAddress: "",
    ownerName: "",
    vacationIds: "",
  })

  const handleMintNFT = async () => {
    if (!isConnected) {
      toast.error("Connect your wallet first")
      return
    }

    if (!mintForm.walletAddress || !mintForm.ownerName || !mintForm.vacationIds) {
      toast.error("Please fill in all fields")
      return
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(mintForm.walletAddress)) {
      toast.error("Invalid wallet address format")
      return
    }

    // Parse vacation IDs from comma-separated string
    const vacationIds = mintForm.vacationIds
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s !== "")
      .map((s) => parseInt(s))

    if (vacationIds.some(isNaN)) {
      toast.error("Invalid vacation IDs. Use comma-separated numbers (e.g., 1, 2, 3)")
      return
    }

    setIsLoading(true)
    try {
      const tx = await pugliaContract.mintVacationNFT(
        mintForm.walletAddress,
        mintForm.ownerName,
        vacationIds,
      )

      toast.info("Transaction submitted! Waiting for confirmation...")
      await tx.wait()
      toast.success("Vacation NFT minted successfully!")

      setMintForm({ walletAddress: "", ownerName: "", vacationIds: "" })
    } catch (error: any) {
      console.error("Error minting NFT:", error)
      toast.error(error.reason || error.message || "Failed to mint NFT")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-primary mb-4">Investor Management</h2>
        <p className="text-muted-foreground">Mint Vacation NFTs with assigned vacation slots</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Mint Vacation NFT</CardTitle>
          <CardDescription>
            Create a new NFT for an investor with pre-assigned vacation slots
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="walletAddress">Recipient Wallet Address</Label>
            <Input
              id="walletAddress"
              type="text"
              value={mintForm.walletAddress}
              onChange={(e) => setMintForm({ ...mintForm, walletAddress: e.target.value })}
              placeholder="0x..."
            />
          </div>

          <div>
            <Label htmlFor="ownerName">Owner Name</Label>
            <Input
              id="ownerName"
              type="text"
              value={mintForm.ownerName}
              onChange={(e) => setMintForm({ ...mintForm, ownerName: e.target.value })}
              placeholder="Full name of the NFT owner"
            />
          </div>

          <div>
            <Label htmlFor="vacationIds">Available Vacation IDs</Label>
            <Textarea
              id="vacationIds"
              value={mintForm.vacationIds}
              onChange={(e) => setMintForm({ ...mintForm, vacationIds: e.target.value })}
              placeholder="Comma-separated vacation IDs (e.g., 1, 2, 3, 4, 5, 6, 7, 8)"
              rows={3}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Enter the vacation slot IDs this NFT should have access to
            </p>
          </div>

          <Button onClick={handleMintNFT} disabled={isLoading || !isConnected} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Minting...
              </>
            ) : (
              "Mint Vacation NFT"
            )}
          </Button>

          {!isConnected && (
            <p className="text-sm text-muted-foreground text-center">
              Connect your wallet to mint NFTs
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>How It Works (V2)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>1. First create vacation slots using the Vacations tab (single or batch)</p>
            <p>2. Note the vacation IDs that were created</p>
            <p>3. Mint an NFT to the investor with those vacation IDs assigned</p>
            <p>4. The investor can then book any of their assigned vacation slots</p>
            <p>5. Only the contract owner (admin) can mint new NFTs</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
