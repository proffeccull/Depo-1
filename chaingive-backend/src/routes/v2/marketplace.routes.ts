import { Router } from 'express';
import { body, param, query } from 'express-validator';
import rateLimit from 'express-rate-limit';
import { MarketplaceController } from '../../controllers/v2/marketplace.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { validateRequest } from '../../middleware/validation.middleware';

const router = Router();
const marketplaceController = new MarketplaceController();

// Rate limiting for marketplace endpoints
const marketplaceLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per windowMs
  message: 'Too many marketplace requests from this IP, please try again later.',
});

const transactionLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // limit each user to 5 transactions per minute
  message: 'Too many transactions, please slow down.',
});

// Apply authentication to all routes
router.use(authenticate);

// Marketplace Listings Endpoints
router.get('/listings',
  marketplaceLimiter,
  [
    query('category').optional().isIn(['airtime', 'data', 'groceries', 'utilities', 'entertainment']),
    query('minPrice').optional().isFloat({ min: 0 }),
    query('maxPrice').optional().isFloat({ min: 0 }),
    query('sortBy').optional().isIn(['price', 'popularity', 'newest', 'rating']),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 }),
  ],
  validateRequest,
  marketplaceController.getListings
);

router.get('/listings/:listingId',
  [param('listingId').isUUID()],
  validateRequest,
  marketplaceController.getListing
);

// AI-Powered Recommendations
router.get('/recommendations',
  marketplaceLimiter,
  [
    query('limit').optional().isInt({ min: 1, max: 20 }),
    query('category').optional().isIn(['airtime', 'data', 'groceries', 'utilities', 'entertainment']),
    query('context').optional().isIn(['purchase', 'browse', 'trending']),
  ],
  validateRequest,
  marketplaceController.getRecommendations
);

// User Interactions
router.post('/interactions',
  [
    body('listingId').isUUID(),
    body('action').isIn(['view', 'like', 'share', 'save']),
    body('rating').optional().isFloat({ min: 1, max: 5 }),
    body('review').optional().trim().isLength({ max: 500 }),
  ],
  validateRequest,
  marketplaceController.recordInteraction
);

router.get('/interactions/history',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 }),
  ],
  validateRequest,
  marketplaceController.getInteractionHistory
);

// Redemption/Transactions
router.post('/redeem',
  transactionLimiter,
  [
    body('listingId').isUUID(),
    body('quantity').optional().isInt({ min: 1 }),
    body('deliveryMethod').optional().isIn(['digital', 'physical', 'agent']),
    body('notes').optional().trim().isLength({ max: 200 }),
  ],
  validateRequest,
  marketplaceController.redeemItem
);

router.get('/transactions',
  [
    query('status').optional().isIn(['pending', 'completed', 'failed', 'refunded']),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 20 }),
  ],
  validateRequest,
  marketplaceController.getTransactions
);

router.get('/transactions/:transactionId',
  [param('transactionId').isUUID()],
  validateRequest,
  marketplaceController.getTransaction
);

// Escrow Management
router.post('/escrow/initiate',
  transactionLimiter,
  [
    body('listingId').isUUID(),
    body('amount').isFloat({ min: 100 }),
    body('escrowType').isIn(['instant', 'conditional', 'timed']),
    body('conditions').optional().isObject(),
    body('timeoutHours').optional().isInt({ min: 1, max: 168 }), // max 1 week
  ],
  validateRequest,
  marketplaceController.initiateEscrow
);

router.post('/escrow/:escrowId/release',
  [
    param('escrowId').isUUID(),
    body('reason').optional().trim().isLength({ max: 200 }),
  ],
  validateRequest,
  marketplaceController.releaseEscrow
);

router.post('/escrow/:escrowId/dispute',
  [
    param('escrowId').isUUID(),
    body('reason').isIn(['item_not_received', 'item_damaged', 'wrong_item', 'seller_issue']),
    body('description').trim().isLength({ min: 10, max: 500 }),
    body('evidence').optional().isArray(),
  ],
  validateRequest,
  marketplaceController.createDispute
);

// Auction System (Future feature)
router.post('/auctions',
  [
    body('listingId').isUUID(),
    body('startingPrice').isFloat({ min: 100 }),
    body('reservePrice').optional().isFloat({ min: 100 }),
    body('durationHours').isInt({ min: 1, max: 168 }),
    body('bidIncrement').optional().isFloat({ min: 50 }),
  ],
  validateRequest,
  marketplaceController.createAuction
);

router.post('/auctions/:auctionId/bid',
  transactionLimiter,
  [
    param('auctionId').isUUID(),
    body('amount').isFloat({ min: 100 }),
  ],
  validateRequest,
  marketplaceController.placeBid
);

router.get('/auctions/active',
  [
    query('category').optional().isIn(['airtime', 'data', 'groceries', 'utilities', 'entertainment']),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 20 }),
  ],
  validateRequest,
  marketplaceController.getActiveAuctions
);

// Analytics & Insights
router.get('/analytics/overview',
  marketplaceController.getMarketplaceAnalytics
);

router.get('/analytics/trends',
  [
    query('period').optional().isIn(['day', 'week', 'month', 'quarter']),
    query('category').optional().isIn(['airtime', 'data', 'groceries', 'utilities', 'entertainment']),
  ],
  validateRequest,
  marketplaceController.getTrends
);

router.get('/analytics/user-insights',
  marketplaceController.getUserInsights
);

// Admin Endpoints (would be protected by admin middleware)
router.post('/listings/:listingId/feature',
  [param('listingId').isUUID()],
  validateRequest,
  marketplaceController.featureListing
);

router.post('/listings/:listingId/hide',
  [param('listingId').isUUID()],
  validateRequest,
  marketplaceController.hideListing
);

export default router;