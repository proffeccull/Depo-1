// src/controllers/blockchain.controller.ts
import { Request, Response } from 'express';
import { blockchainService } from '../services/blockchain.service';
import logger from '../utils/logger';

export class BlockchainController {
  /**
   * Log a donation to the blockchain
   */
  async logDonation(req: Request, res: Response) {
    try {
      const { donorId, recipientId, amount, transactionId, network } = req.body;

      if (!donorId || !recipientId || !amount || !transactionId) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: donorId, recipientId, amount, transactionId'
        });
      }

      const transactionLog = await blockchainService.logDonation({
        donorId,
        recipientId,
        amount: Number(amount),
        transactionId,
        network: network || 'polygon'
      });

      res.json({
        success: true,
        message: 'Donation logged to blockchain successfully',
        data: transactionLog
      });

    } catch (error) {
      logger.error('Blockchain logDonation error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to log donation to blockchain',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Mint an achievement NFT
   */
  async mintAchievement(req: Request, res: Response) {
    try {
      const { recipientId, achievementType, rarity, userAddress } = req.body;

      if (!recipientId || !achievementType || rarity === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: recipientId, achievementType, rarity'
        });
      }

      const result = await blockchainService.mintAchievement({
        recipientId,
        achievementType,
        rarity: Number(rarity),
        userAddress
      });

      res.json({
        success: true,
        message: 'Achievement NFT minted successfully',
        data: result
      });

    } catch (error) {
      logger.error('Blockchain mintAchievement error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to mint achievement NFT',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get transaction details from blockchain
   */
  async getTransaction(req: Request, res: Response) {
    try {
      const { transactionHash } = req.params;
      const { network } = req.query;

      if (!transactionHash) {
        return res.status(400).json({
          success: false,
          message: 'Transaction hash is required'
        });
      }

      const transaction = await blockchainService.getTransaction(
        transactionHash,
        network as string || 'polygon'
      );

      res.json({
        success: true,
        data: transaction
      });

    } catch (error) {
      logger.error('Blockchain getTransaction error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get transaction details',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Verify transaction on blockchain
   */
  async verifyTransaction(req: Request, res: Response) {
    try {
      const { transactionHash } = req.params;
      const { network } = req.query;

      if (!transactionHash) {
        return res.status(400).json({
          success: false,
          message: 'Transaction hash is required'
        });
      }

      const isValid = await blockchainService.verifyTransaction(
        transactionHash,
        network as string || 'polygon'
      );

      res.json({
        success: true,
        data: {
          transactionHash,
          isValid,
          network: network || 'polygon'
        }
      });

    } catch (error) {
      logger.error('Blockchain verifyTransaction error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to verify transaction',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get current gas price for network
   */
  async getGasPrice(req: Request, res: Response) {
    try {
      const { network } = req.query;
      const gasPrice = await blockchainService.getGasPrice(network as string || 'polygon');

      res.json({
        success: true,
        data: {
          network: network || 'polygon',
          gasPrice,
          unit: 'wei'
        }
      });

    } catch (error) {
      logger.error('Blockchain getGasPrice error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get gas price',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get blockchain statistics
   */
  async getBlockchainStats(req: Request, res: Response) {
    try {
      const stats = await blockchainService.getBlockchainStats();

      res.json({
        success: true,
        data: stats
      });

    } catch (error) {
      logger.error('Blockchain getBlockchainStats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get blockchain statistics',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

// Export singleton instance
export const blockchainController = new BlockchainController();