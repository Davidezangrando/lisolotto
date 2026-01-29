"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BlockchainConfigService, type ContractConfig } from "@/lib/blockchain/config"
import { useToast } from "@/hooks/use-toast"

export function BlockchainConfig() {
  const [config, setConfig] = useState(BlockchainConfigService.getConfig())
  const [nftContractForm, setNftContractForm] = useState({
    address: config.contracts.nftContract.address,
    abi: JSON.stringify(config.contracts.nftContract.abi, null, 2),
  })
  const [marketplaceContractForm, setMarketplaceContractForm] = useState({
    address: config.contracts.marketplaceContract.address,
    abi: JSON.stringify(config.contracts.marketplaceContract.abi, null, 2),
  })
  const { toast } = useToast()

  const handleSaveNFTContract = () => {
    try {
      const abi = JSON.parse(nftContractForm.abi || "[]")
      const contractConfig: ContractConfig = {
        address: nftContractForm.address,
        abi,
        isDeployed: nftContractForm.address !== "0x0000000000000000000000000000000000000000" && abi.length > 0,
      }

      BlockchainConfigService.updateContractConfig("nftContract", contractConfig)
      setConfig(BlockchainConfigService.getConfig())

      toast({
        title: "NFT Contract Updated",
        description: "NFT contract configuration has been saved successfully.",
      })
    } catch (error) {
      toast({
        title: "Invalid ABI",
        description: "Please provide a valid JSON ABI for the NFT contract.",
        variant: "destructive",
      })
    }
  }

  const handleSaveMarketplaceContract = () => {
    try {
      const abi = JSON.parse(marketplaceContractForm.abi || "[]")
      const contractConfig: ContractConfig = {
        address: marketplaceContractForm.address,
        abi,
        isDeployed: marketplaceContractForm.address !== "0x0000000000000000000000000000000000000000" && abi.length > 0,
      }

      BlockchainConfigService.updateContractConfig("marketplaceContract", contractConfig)
      setConfig(BlockchainConfigService.getConfig())

      toast({
        title: "Marketplace Contract Updated",
        description: "Marketplace contract configuration has been saved successfully.",
      })
    } catch (error) {
      toast({
        title: "Invalid ABI",
        description: "Please provide a valid JSON ABI for the marketplace contract.",
        variant: "destructive",
      })
    }
  }

  const connectionStatus = BlockchainConfigService.getConnectionStatus()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-primary">Blockchain Configuration</h2>
          <p className="text-muted-foreground">Configure smart contract addresses and ABIs</p>
        </div>
        <Badge variant={connectionStatus.isReady ? "default" : "secondary"}>
          {connectionStatus.isReady ? "Ready" : "Mock Mode"}
        </Badge>
      </div>

      {/* Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Connection Status</CardTitle>
          <CardDescription>Current blockchain integration status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${connectionStatus.hasNFTContract ? "bg-green-500" : "bg-red-500"}`}
              />
              <span className="text-sm">NFT Contract</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  connectionStatus.hasMarketplaceContract ? "bg-green-500" : "bg-red-500"
                }`}
              />
              <span className="text-sm">Marketplace Contract</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${connectionStatus.networkConfigured ? "bg-green-500" : "bg-red-500"}`}
              />
              <span className="text-sm">Network Config</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${connectionStatus.isReady ? "bg-green-500" : "bg-yellow-500"}`} />
              <span className="text-sm">Overall Status</span>
            </div>
          </div>

          {!connectionStatus.isReady && (
            <Alert className="mt-4">
              <AlertDescription>
                Platform is running in mock mode. Configure smart contracts below to enable blockchain functionality.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Contract Configuration */}
      <Tabs defaultValue="nft" className="space-y-4">
        <TabsList>
          <TabsTrigger value="nft">NFT Contract</TabsTrigger>
          <TabsTrigger value="marketplace">Marketplace Contract</TabsTrigger>
          <TabsTrigger value="network">Network Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="nft">
          <Card>
            <CardHeader>
              <CardTitle>NFT Contract Configuration</CardTitle>
              <CardDescription>Configure the main NFT smart contract</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nft-address">Contract Address</Label>
                <Input
                  id="nft-address"
                  placeholder="0x..."
                  value={nftContractForm.address}
                  onChange={(e) => setNftContractForm({ ...nftContractForm, address: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nft-abi">Contract ABI (JSON)</Label>
                <Textarea
                  id="nft-abi"
                  placeholder="Paste the contract ABI JSON here..."
                  value={nftContractForm.abi}
                  onChange={(e) => setNftContractForm({ ...nftContractForm, abi: e.target.value })}
                  rows={10}
                  className="font-mono text-xs"
                />
              </div>

              <Button onClick={handleSaveNFTContract} className="w-full">
                Save NFT Contract Configuration
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="marketplace">
          <Card>
            <CardHeader>
              <CardTitle>Marketplace Contract Configuration</CardTitle>
              <CardDescription>Configure the marketplace smart contract</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="marketplace-address">Contract Address</Label>
                <Input
                  id="marketplace-address"
                  placeholder="0x..."
                  value={marketplaceContractForm.address}
                  onChange={(e) => setMarketplaceContractForm({ ...marketplaceContractForm, address: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="marketplace-abi">Contract ABI (JSON)</Label>
                <Textarea
                  id="marketplace-abi"
                  placeholder="Paste the contract ABI JSON here..."
                  value={marketplaceContractForm.abi}
                  onChange={(e) => setMarketplaceContractForm({ ...marketplaceContractForm, abi: e.target.value })}
                  rows={10}
                  className="font-mono text-xs"
                />
              </div>

              <Button onClick={handleSaveMarketplaceContract} className="w-full">
                Save Marketplace Contract Configuration
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="network">
          <Card>
            <CardHeader>
              <CardTitle>Network Configuration</CardTitle>
              <CardDescription>Configure blockchain network settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Network ID</Label>
                  <Input value={config.networkId} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Network Name</Label>
                  <Input value={config.networkName} disabled />
                </div>
              </div>

              <div className="space-y-2">
                <Label>RPC URL</Label>
                <Input value={config.rpcUrl} disabled />
              </div>

              <Alert>
                <AlertDescription>
                  Network settings are currently read-only. Contact your blockchain developer to modify these settings.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
