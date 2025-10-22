// src/routes/blockchain.routes.ts
import { Router } from 'express';
import { blockchainController } from '../controllers/blockchain.controller';
import { authenticate } from '../middleware/auth';
import rateLimit from 'express-rate-limit';

const router = Router();

// Apply authentication to all blockchain routes
router.use(authenticate);

// Apply rate limiting (lower limits for blockchain operations due to gas costs)
const blockchainLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: 'Too many blockchain requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
router.use(blockchainLimiter);

/**
 * @swagger
 * /api/v1/blockchain/log-donation:
 *   post:
 *     summary: Log a donation transaction to the blockchain
 *     tags: [Blockchain]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - donorId
 *               - recipientId
 *               - amount
 *               - transactionId
 *             properties:
 *               donorId:
 *                 type: string
 *               recipientId:
 *                 type: string
 *               amount:
 *                 type: number
 *               transactionId:
 *                 type: string
 *               network:
 *                 type: string
 *                 enum: [polygon, ethereum, bsc]
 *                 default: polygon
 *     responses:
 *       200:
 *         description: Donation logged successfully
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Blockchain interaction failed
 */
router.post('/log-donation', blockchainController.logDonation);

/**
 * @swagger
 * /api/v1/blockchain/mint-achievement:
 *   post:
 *     summary: Mint an achievement NFT
 *     tags: [Blockchain]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - recipientId
 *               - achievementType
 *               - rarity
 *             properties:
 *               recipientId:
 *                 type: string
 *               achievementType:
 *                 type: string
 *               rarity:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *               userAddress:
 *                 type: string
 *     responses:
 *       200:
 *         description: NFT minted successfully
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: NFT minting failed
 */
router.post('/mint-achievement', blockchainController.mintAchievement);

/**
 * @swagger
 * /api/v1/blockchain/transaction/{transactionHash}:
 *   get:
 *     summary: Get transaction details from blockchain
 *     tags: [Blockchain]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: transactionHash
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: network
 *         schema:
 *           type: string
 *           enum: [polygon, ethereum, bsc]
 *           default: polygon
 *     responses:
 *       200:
 *         description: Transaction details retrieved
 *       400:
 *         description: Invalid transaction hash
 *       404:
 *         description: Transaction not found
 *       500:
 *         description: Failed to retrieve transaction
 */
router.get('/transaction/:transactionHash', blockchainController.getTransaction);

/**
 * @swagger
 * /api/v1/blockchain/verify/{transactionHash}:
 *   get:
 *     summary: Verify transaction on blockchain
 *     tags: [Blockchain]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: transactionHash
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: network
 *         schema:
 *           type: string
 *           enum: [polygon, ethereum, bsc]
 *           default: polygon
 *     responses:
 *       200:
 *         description: Transaction verification result
 *       400:
 *         description: Invalid transaction hash
 *       500:
 *         description: Verification failed
 */
router.get('/verify/:transactionHash', blockchainController.verifyTransaction);

/**
 * @swagger
 * /api/v1/blockchain/gas-price:
 *   get:
 *     summary: Get current gas price for network
 *     tags: [Blockchain]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: network
 *         schema:
 *           type: string
 *           enum: [polygon, ethereum, bsc]
 *           default: polygon
 *     responses:
 *       200:
 *         description: Current gas price
 *       500:
 *         description: Failed to get gas price
 */
router.get('/gas-price', blockchainController.getGasPrice);

/**
 * @swagger
 * /api/v1/blockchain/stats:
 *   get:
 *     summary: Get blockchain statistics
 *     tags: [Blockchain]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Blockchain statistics
 *       500:
 *         description: Failed to get statistics
 */
router.get('/stats', blockchainController.getBlockchainStats);

export default router;