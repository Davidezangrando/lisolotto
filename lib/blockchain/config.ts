import PUGLIA_VACATION_ABI from "./puglia-vacation-abi.json"

export interface ContractConfig {
  address: string
  abi: any[]
  isDeployed: boolean
}

export interface BlockchainConfig {
  networkId: number
  networkName: string
  rpcUrl: string
  contracts: {
    nftContract: ContractConfig
    marketplaceContract: ContractConfig
  }
  isMainnet: boolean
}

const DEFAULT_CONFIG: BlockchainConfig = {
  networkId: 137, // Polygon Mainnet
  networkName: "Polygon",
  rpcUrl: "https://polygon-rpc.com/",
  contracts: {
    nftContract: {
      address: "0x7e25b679935F8516BF1F8fC490D07F41F06d2945",
      abi: PUGLIA_VACATION_ABI,
      isDeployed: true,
    },
    marketplaceContract: {
      address: "0x7e25b679935F8516BF1F8fC490D07F41F06d2945", // Same contract handles marketplace
      abi: PUGLIA_VACATION_ABI,
      isDeployed: true,
    },
  },
  isMainnet: true,
}

export class BlockchainConfigService {
  private static readonly CONFIG_KEY = "blockchain_config"

  static getConfig(): BlockchainConfig {
    if (typeof window === "undefined") return DEFAULT_CONFIG

    try {
      const stored = localStorage.getItem(this.CONFIG_KEY)
      if (!stored) return DEFAULT_CONFIG
      return { ...DEFAULT_CONFIG, ...JSON.parse(stored) }
    } catch {
      return DEFAULT_CONFIG
    }
  }

  static updateConfig(updates: Partial<BlockchainConfig>): void {
    if (typeof window === "undefined") return

    const currentConfig = this.getConfig()
    const newConfig = { ...currentConfig, ...updates }
    localStorage.setItem(this.CONFIG_KEY, JSON.stringify(newConfig))
  }

  static updateContractConfig(contractType: "nftContract" | "marketplaceContract", config: ContractConfig): void {
    const currentConfig = this.getConfig()
    currentConfig.contracts[contractType] = config
    this.updateConfig(currentConfig)
  }

  static isBlockchainReady(): boolean {
    const config = this.getConfig()
    return config.contracts.nftContract.isDeployed && config.contracts.marketplaceContract.isDeployed
  }

  static getConnectionStatus() {
    const config = this.getConfig()
    return {
      hasNFTContract: config.contracts.nftContract.isDeployed,
      hasMarketplaceContract: config.contracts.marketplaceContract.isDeployed,
      networkConfigured: config.networkId !== 0,
      isReady: this.isBlockchainReady(),
    }
  }
}
