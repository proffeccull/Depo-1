// src/services/blockchain.service.ts
import { ethers } from 'ethers';
import logger from '../utils/logger';
import prisma from '../utils/prisma';

export interface TransactionLog {
  id: string;
  transactionHash: string;
  blockNumber: number;
  timestamp: Date;
  donorId: string;
  recipientId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'confirmed' | 'failed';
  gasUsed?: string;
  gasPrice?: string;
  network: 'polygon' | 'ethereum' | 'bsc';
}

export interface SmartContractConfig {
  address: string;
  abi: any[];
  network: 'polygon' | 'ethereum' | 'bsc';
}

export class BlockchainService {
  private providers: Map<string, ethers.JsonRpcProvider> = new Map();
  private wallets: Map<string, ethers.Wallet> = new Map();
  private contracts: Map<string, ethers.Contract> = new Map();

  constructor() {
    this.initializeProviders();
    this.initializeContracts();
  }

  private initializeProviders() {
    // Polygon Mainnet
    this.providers.set('polygon', new ethers.JsonRpcProvider(
      process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com/'
    ));

    // Ethereum Mainnet
    this.providers.set('ethereum', new ethers.JsonRpcProvider(
      process.env.ETHEREUM_RPC_URL || 'https://mainnet.infura.io/v3/YOUR_INFURA_KEY'
    ));

    // BSC Mainnet
    this.providers.set('bsc', new ethers.JsonRpcProvider(
      process.env.BSC_RPC_URL || 'https://bsc-dataseed.binance.org/'
    ));

    logger.info('Blockchain providers initialized');
  }

  private initializeContracts() {
    // ChainGive Donation Logger Contract (Polygon)
    const donationLoggerABI = [
      "event DonationLogged(address indexed donor, address indexed recipient, uint256 amount, uint256 timestamp, string transactionId)",
      "function logDonation(address donor, address recipient, uint256 amount, string calldata transactionId) external",
      "function getDonationCount() external view returns (uint256)",
      "function getDonation(uint256 index) external view returns (address, address, uint256, uint256, string)"
    ];

    const donationLoggerAddress = process.env.DONATION_LOGGER_CONTRACT_ADDRESS;
    if (donationLoggerAddress && this.providers.get('polygon')) {
      const contract = new ethers.Contract(
        donationLoggerAddress,
        donationLoggerABI,
        this.providers.get('polygon')
      );
      this.contracts.set('donationLogger', contract);
      logger.info('Donation logger contract initialized');
    }

    // Achievement NFT Contract
    const achievementNFTABI = [
      "function mintAchievement(address recipient, string memory achievementType, uint256 rarity) external returns (uint256)",
      "function getAchievement(uint256 tokenId) external view returns (address, string, uint256, uint256)",
      "event AchievementMinted(address indexed recipient, uint256 indexed tokenId, string achievementType, uint256 rarity)"
    ];

    const achievementNFTAddress = process.env.ACHIEVEMENT_NFT_CONTRACT_ADDRESS;
    if (achievementNFTAddress && this.providers.get('polygon')) {
      const contract = new ethers.Contract(
        achievementNFTAddress,
        achievementNFTABI,
        this.providers.get('polygon')
      );
      this.contracts.set('achievementNFT', contract);
      logger.info('Achievement NFT contract initialized');
    }
  }

  /**
   * Log a donation transaction to the blockchain
   */
  async logDonation(donationData: {
    donorId: string;
    recipientId: string;
    amount: number;
    transactionId: string;
    network?: 'polygon' | 'ethereum' | 'bsc';
  }): Promise<TransactionLog> {
    try {
      const network = donationData.network || 'polygon';
      const provider = this.providers.get(network);

      if (!provider) {
        throw new Error(`Provider not available for network: ${network}`);
      }

      const contract = this.contracts.get('donationLogger');
      if (!contract) {
        throw new Error('Donation logger contract not configured');
      }

      // Get wallet for signing (if needed for contract interaction)
      const wallet = this.getWallet(network);
      const contractWithSigner = contract.connect(wallet);

      // Convert amount to wei (assuming amount is in Naira, convert to smallest unit)
      const amountInWei = ethers.parseEther((donationData.amount / 1000).toString()); // Rough conversion

      // Log donation to blockchain
      const tx = await contractWithSigner.logDonation(
        donationData.donorId, // Using user ID as address for now
        donationData.recipientId,
        amountInWei,
        donationData.transactionId
      );

      // Wait for confirmation
      const receipt = await tx.wait();

      // Create transaction log record
      const transactionLog: TransactionLog = {
        id: donationData.transactionId,
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber,
        timestamp: new Date(),
        donorId: donationData.donorId,
        recipientId: donationData.recipientId,
        amount: donationData.amount,
        currency: 'NGN',
        status: 'confirmed',
        gasUsed: receipt.gasUsed.toString(),
        gasPrice: receipt.gasPrice.toString(),
        network
      };

      // Store in database
      await this.storeTransactionLog(transactionLog);

      logger.info(`Donation logged to blockchain: ${tx.hash}`);
      return transactionLog;

    } catch (error) {
      logger.error('Failed to log donation to blockchain:', error);

      // Store failed transaction log
      const failedLog: TransactionLog = {
        id: donationData.transactionId,
        transactionHash: '',
        blockNumber: 0,
        timestamp: new Date(),
        donorId: donationData.donorId,
        recipientId: donationData.recipientId,
        amount: donationData.amount,
        currency: 'NGN',
        status: 'failed',
        network: donationData.network || 'polygon'
      };

      await this.storeTransactionLog(failedLog);
      throw error;
    }
  }

  /**
   * Mint an achievement NFT
   */
  async mintAchievement(achievementData: {
    recipientId: string;
    achievementType: string;
    rarity: number;
    userAddress?: string;
  }): Promise<{ tokenId: string; transactionHash: string }> {
    try {
      const contract = this.contracts.get('achievementNFT');
      if (!contract) {
        throw new Error('Achievement NFT contract not configured');
      }

      const wallet = this.getWallet('polygon');
      const contractWithSigner = contract.connect(wallet);

      // Use provided address or generate one from user ID
      const recipientAddress = achievementData.userAddress ||
        ethers.keccak256(ethers.toUtf8Bytes(achievementData.recipientId)).substring(0, 42);

      const tx = await contractWithSigner.mintAchievement(
        recipientAddress,
        achievementData.achievementType,
        achievementData.rarity
      );

      const receipt = await tx.wait();

      logger.info(`Achievement NFT minted: ${tx.hash}, Token ID: ${receipt.logs[0].topics[2]}`);

      return {
        tokenId: receipt.logs[0].topics[2], // Extract token ID from event
        transactionHash: tx.hash
      };

    } catch (error) {
      logger.error('Failed to mint achievement NFT:', error);
      throw error;
    }
  }

  /**
   * Get transaction details from blockchain
   */
  async getTransaction(transactionHash: string, network: string = 'polygon'): Promise<any> {
    try {
      const provider = this.providers.get(network);
      if (!provider) {
        throw new Error(`Provider not available for network: ${network}`);
      }

      const tx = await provider.getTransaction(transactionHash);
      const receipt = await provider.getTransactionReceipt(transactionHash);

      if (!tx) {
        throw new Error('Transaction not found');
      }

      return {
        hash: tx.hash,
        blockNumber: tx.blockNumber,
        from: tx.from,
        to: tx.to,
        value: tx.value.toString(),
        gasUsed: receipt?.gasUsed.toString(),
        status: receipt?.status === 1 ? 'success' : 'failed',
        timestamp: new Date()
      };

    } catch (error) {
      logger.error('Failed to get transaction:', error);
      throw error;
    }
  }

  /**
   * Verify transaction on blockchain
   */
  async verifyTransaction(transactionHash: string, network: string = 'polygon'): Promise<boolean> {
    try {
      const provider = this.providers.get(network);
      if (!provider) {
        throw new Error(`Provider not available for network: ${network}`);
      }

      const receipt = await provider.getTransactionReceipt(transactionHash);
      return receipt ? receipt.status === 1 : false;

    } catch (error) {
      logger.error('Failed to verify transaction:', error);
      return false;
    }
  }

  /**
   * Get current gas price for network
   */
  async getGasPrice(network: string = 'polygon'): Promise<string> {
    try {
      const provider = this.providers.get(network);
      if (!provider) {
        throw new Error(`Provider not available for network: ${network}`);
      }

      const gasPrice = await provider.getFeeData();
      return gasPrice.gasPrice?.toString() || '0';

    } catch (error) {
      logger.error('Failed to get gas price:', error);
      return '0';
    }
  }

  private getWallet(network: string): ethers.Wallet {
    if (this.wallets.has(network)) {
      return this.wallets.get(network)!;
    }

    const privateKey = process.env[`${network.toUpperCase()}_PRIVATE_KEY`];
    if (!privateKey) {
      throw new Error(`Private key not configured for network: ${network}`);
    }

    const provider = this.providers.get(network);
    if (!provider) {
      throw new Error(`Provider not available for network: ${network}`);
    }

    const wallet = new ethers.Wallet(privateKey, provider);
    this.wallets.set(network, wallet);

    return wallet;
  }

  private async storeTransactionLog(log: TransactionLog): Promise<void> {
    try {
      await prisma.blockchainLog.create({
        data: {
          transactionHash: log.transactionHash,
          blockNumber: log.blockNumber,
          timestamp: log.timestamp,
          donorId: log.donorId,
          recipientId: log.recipientId,
          amount: log.amount,
          currency: log.currency,
          status: log.status,
          gasUsed: log.gasUsed,
          gasPrice: log.gasPrice,
          network: log.network,
          metadata: {
            transactionId: log.id
          }
        }
      });
    } catch (error) {
      logger.error('Failed to store transaction log:', error);
      throw error;
    }
  }

  /**
   * Get blockchain statistics
   */
  async getBlockchainStats(): Promise<{
    totalTransactions: number;
    totalVolume: number;
    averageGasPrice: string;
    networkStatus: Record<string, boolean>;
  }> {
    try {
      const logs = await prisma.blockchainLog.findMany({
        where: { status: 'confirmed' }
      });

      const totalTransactions = logs.length;
      const totalVolume = logs.reduce((sum: number, log: any) => sum + log.amount, 0);
      const averageGasPrice = logs.length > 0
        ? (logs.reduce((sum: number, log: any) => sum + parseInt(log.gasPrice || '0'), 0) / logs.length).toString()
        : '0';

      const networkStatus: Record<string, boolean> = {};
      for (const network of ['polygon', 'ethereum', 'bsc']) {
        try {
          const provider = this.providers.get(network);
          networkStatus[network] = !!(provider && await provider.getBlockNumber());
        } catch {
          networkStatus[network] = false;
        }
      }

      return {
        totalTransactions,
        totalVolume,
        averageGasPrice,
        networkStatus
      };

    } catch (error) {
      logger.error('Failed to get blockchain stats:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const blockchainService = new BlockchainService();