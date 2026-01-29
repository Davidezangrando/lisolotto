"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { pugliaContract } from "@/lib/blockchain/puglia-contract"
import { useWallet } from "@/lib/blockchain/wallet"
import { toast } from "sonner"

export function InvestorManagement() {
  const { isConnected } = useWallet()
  const [isLoading, setIsLoading] = useState(false)

  const [investorForm, setInvestorForm] = useState({
    walletAddress: "",
    investmentAmount: "",
    investorName: "",
  })

  const handleRegisterInvestor = async () => {
    if (!isConnected) {
      toast.error("Connect your wallet first")
      return
    }

    if (!investorForm.walletAddress || !investorForm.investmentAmount || !investorForm.investorName) {
      toast.error("Please fill in all fields")
      return
    }

    // Validate wallet address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(investorForm.walletAddress)) {
      toast.error("Invalid wallet address format")
      return
    }

    setIsLoading(true)
    try {
      const tx = await pugliaContract.registerInvestorAndMintNFTs(
        investorForm.walletAddress,
        BigInt(investorForm.investmentAmount),
        investorForm.investorName,
      )

      toast.success("Transaction submitted! Waiting for confirmation...")
      await tx.wait()
      toast.success("Investor registered and NFTs minted successfully!")

      // Reset form
      setInvestorForm({
        walletAddress: "",
        investmentAmount: "",
        investorName: "",
      })
    } catch (error: any) {
      console.error("Error registering investor:", error)
      toast.error(error.message || "Failed to register investor")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-primary mb-4">Investor Management</h2>
        <p className="text-muted-foreground">Register new investors and mint their 8 NFTs</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Register New Investor</CardTitle>
          <CardDescription>Register an investor and automatically mint 8 NFTs to their wallet</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="walletAddress">Wallet Address</Label>
            <Input
              id="walletAddress"
              type="text"
              value={investorForm.walletAddress}
              onChange={(e) => setInvestorForm({ ...investorForm, walletAddress: e.target.value })}
              placeholder="0x..."
            />
          </div>

          <div>
            <Label htmlFor="investmentAmount">Investment Amount</Label>
            <Input
              id="investmentAmount"
              type="number"
              value={investorForm.investmentAmount}
              onChange={(e) => setInvestorForm({ ...investorForm, investmentAmount: e.target.value })}
              placeholder="Investment amount in wei"
            />
          </div>

          <div>
            <Label htmlFor="investorName">Investor Name</Label>
            <Input
              id="investorName"
              type="text"
              value={investorForm.investorName}
              onChange={(e) => setInvestorForm({ ...investorForm, investorName: e.target.value })}
              placeholder="Full name of the investor"
            />
          </div>

          <Button onClick={handleRegisterInvestor} disabled={isLoading || !isConnected} className="w-full">
            {isLoading ? "Registering..." : "Register Investor & Mint NFTs"}
          </Button>

          {!isConnected && (
            <p className="text-sm text-muted-foreground text-center">Connect your wallet to register investors</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>• Each investor receives exactly 8 NFTs upon registration</p>
            <p>• NFTs are automatically minted to the specified wallet address</p>
            <p>• Investment amount is recorded on-chain for transparency</p>
            <p>• Investor name is stored for identification purposes</p>
            <p>• Only admin wallets can register new investors</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
