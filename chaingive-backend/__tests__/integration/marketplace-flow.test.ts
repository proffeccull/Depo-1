import request from 'supertest';
import { app } from '../../src/server';
import { prisma } from '../../src/config/database';
import { generateTestToken } from '../helpers/auth.helper';

describe('Marketplace Flow Integration Tests', () => {
  let testUser: any;
  let testToken: string;
  let testItem: any;
  let testTransaction: any;

  beforeAll(async () => {
    // Create test user with coins
    testUser = await prisma.user.create({
      data: {
        phoneNumber: '+2348012345679',
        firstName: 'Market',
        lastName: 'Tester',
        email: 'market@example.com',
        charityCoins: 10000, // Sufficient coins for testing
      },
    });

    testToken = generateTestToken(testUser.id);

    // Create test marketplace item
    testItem = await prisma.marketplaceItem.create({
      data: {
        name: 'Test Airtime Voucher',
        description: '1000 Naira airtime voucher',
        cost: 800,
        category: 'airtime',
        imageUrl: 'https://example.com/airtime.jpg',
        stock: 10,
      },
    });
  });

  afterAll(async () => {
    // Cleanup
    await prisma.marketplaceTransaction.deleteMany({ where: { userId: testUser.id } });
    await prisma.marketplaceInteraction.deleteMany({ where: { userId: testUser.id } });
    await prisma.marketplaceItem.delete({ where: { id: testItem.id } });
    await prisma.user.delete({ where: { id: testUser.id } });
  });

  describe('GET /api/v2/marketplace/listings', () => {
    it('should retrieve marketplace listings with filters', async () => {
      const response = await request(app)
        .get('/api/v2/marketplace/listings?category=airtime&page=1&limit=10')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.listings)).toBe(true);
      expect(response.body.data.listings.length).toBeGreaterThan(0);
      expect(response.body.data.listings[0]).toHaveProperty('name');
      expect(response.body.data.listings[0]).toHaveProperty('cost');
      expect(response.body.data.listings[0]).toHaveProperty('category');
    });

    it('should support price range filtering', async () => {
      const response = await request(app)
        .get('/api/v2/marketplace/listings?minPrice=500&maxPrice=1000')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.listings.every((item: any) =>
        item.cost >= 500 && item.cost <= 1000
      )).toBe(true);
    });

    it('should support sorting', async () => {
      const response = await request(app)
        .get('/api/v2/marketplace/listings?sortBy=price')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      const prices = response.body.data.listings.map((item: any) => item.cost);
      const sortedPrices = [...prices].sort((a, b) => a - b);
      expect(prices).toEqual(sortedPrices);
    });
  });

  describe('POST /api/v2/marketplace/interactions', () => {
    it('should record user interactions', async () => {
      const interactionData = {
        listingId: testItem.id,
        action: 'view',
        rating: 5,
        reviewText: 'Great product!',
      };

      const response = await request(app)
        .post('/api/v2/marketplace/interactions')
        .set('Authorization', `Bearer ${testToken}`)
        .send(interactionData)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should validate interaction data', async () => {
      const response = await request(app)
        .post('/api/v2/marketplace/interactions')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          listingId: 'invalid-uuid',
          action: 'invalid-action',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('GET /api/v2/marketplace/recommendations', () => {
    it('should return personalized recommendations', async () => {
      const response = await request(app)
        .get('/api/v2/marketplace/recommendations?limit=5')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.recommendations)).toBe(true);
      expect(response.body.data.recommendations.length).toBeLessThanOrEqual(5);
    });

    it('should support category-specific recommendations', async () => {
      const response = await request(app)
        .get('/api/v2/marketplace/recommendations?category=airtime&limit=3')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.recommendations.every((item: any) =>
        item.category === 'airtime'
      )).toBe(true);
    });
  });

  describe('POST /api/v2/marketplace/redeem', () => {
    it('should successfully redeem an item', async () => {
      const redemptionData = {
        listingId: testItem.id,
        quantity: 1,
        deliveryMethod: 'digital',
      };

      const response = await request(app)
        .post('/api/v2/marketplace/redeem')
        .set('Authorization', `Bearer ${testToken}`)
        .send(redemptionData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('voucherCode');
      expect(response.body.data).toHaveProperty('transactionId');
      expect(response.body.data.coinsSpent).toBe(testItem.cost);

      testTransaction = response.body.data;
    });

    it('should validate sufficient coin balance', async () => {
      // Create user with insufficient coins
      const poorUser = await prisma.user.create({
        data: {
          phoneNumber: '+2348012345680',
          firstName: 'Poor',
          lastName: 'User',
          charityCoins: 100, // Insufficient for 800 cost item
        },
      });

      const poorToken = generateTestToken(poorUser.id);

      const response = await request(app)
        .post('/api/v2/marketplace/redeem')
        .set('Authorization', `Bearer ${poorToken}`)
        .send({
          listingId: testItem.id,
          quantity: 1,
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('insufficient');

      // Cleanup
      await prisma.user.delete({ where: { id: poorUser.id } });
    });

    it('should enforce rate limiting on redemptions', async () => {
      // Attempt multiple redemptions quickly
      const promises = Array(10).fill().map(() =>
        request(app)
          .post('/api/v2/marketplace/redeem')
          .set('Authorization', `Bearer ${testToken}`)
          .send({ listingId: testItem.id, quantity: 1 })
      );

      const results = await Promise.allSettled(promises);
      const rateLimitedCount = results.filter(r =>
        r.status === 'fulfilled' && r.value.status === 429
      ).length;
      expect(rateLimitedCount).toBeGreaterThan(0);
    });
  });

  describe('GET /api/v2/marketplace/transactions', () => {
    it('should retrieve user transactions', async () => {
      const response = await request(app)
        .get('/api/v2/marketplace/transactions?page=1&limit=10')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.transactions)).toBe(true);
      expect(response.body.data.transactions.length).toBeGreaterThan(0);
      expect(response.body.data.transactions[0]).toHaveProperty('status');
      expect(response.body.data.transactions[0]).toHaveProperty('coinsSpent');
    });

    it('should support status filtering', async () => {
      const response = await request(app)
        .get('/api/v2/marketplace/transactions?status=completed')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.transactions.every((tx: any) =>
        tx.status === 'completed'
      )).toBe(true);
    });
  });

  describe('POST /api/v2/marketplace/escrow/initiate', () => {
    it('should initiate escrow transaction', async () => {
      const escrowData = {
        listingId: testItem.id,
        amount: 800,
        escrowType: 'conditional',
        conditions: {
          deliveryConfirmed: false,
          qualitySatisfied: false,
        },
        timeoutHours: 48,
      };

      const response = await request(app)
        .post('/api/v2/marketplace/escrow/initiate')
        .set('Authorization', `Bearer ${testToken}`)
        .send(escrowData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('escrowId');
      expect(response.body.data.status).toBe('held');
    });
  });

  describe('GET /api/v2/marketplace/analytics/overview', () => {
    it('should retrieve marketplace analytics', async () => {
      const response = await request(app)
        .get('/api/v2/marketplace/analytics/overview')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalListings');
      expect(response.body.data).toHaveProperty('totalTransactions');
      expect(response.body.data).toHaveProperty('totalRevenue');
      expect(response.body.data).toHaveProperty('popularCategories');
    });
  });

  describe('Auction System', () => {
    let testAuction: any;

    it('should create an auction', async () => {
      const auctionData = {
        listingId: testItem.id,
        startingPrice: 500,
        reservePrice: 800,
        durationHours: 24,
        bidIncrement: 50,
      };

      const response = await request(app)
        .post('/api/v2/marketplace/auctions')
        .set('Authorization', `Bearer ${testToken}`)
        .send(auctionData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('auctionId');
      expect(response.body.data.startingPrice).toBe(auctionData.startingPrice);

      testAuction = response.body.data;
    });

    it('should place a bid on auction', async () => {
      const bidData = {
        amount: 600,
      };

      const response = await request(app)
        .post(`/api/v2/marketplace/auctions/${testAuction.auctionId}/bid`)
        .set('Authorization', `Bearer ${testToken}`)
        .send(bidData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.currentPrice).toBe(bidData.amount);
    });

    it('should retrieve active auctions', async () => {
      const response = await request(app)
        .get('/api/v2/marketplace/auctions/active?page=1&limit=10')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.auctions)).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid listing IDs', async () => {
      const response = await request(app)
        .get('/api/v2/marketplace/listings/invalid-uuid')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });

    it('should handle out of stock items', async () => {
      // Update item to be out of stock
      await prisma.marketplaceItem.update({
        where: { id: testItem.id },
        data: { stock: 0 },
      });

      const response = await request(app)
        .post('/api/v2/marketplace/redeem')
        .set('Authorization', `Bearer ${testToken}`)
        .send({ listingId: testItem.id, quantity: 1 })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('out of stock');

      // Restore stock
      await prisma.marketplaceItem.update({
        where: { id: testItem.id },
        data: { stock: 10 },
      });
    });

    it('should validate auction bid amounts', async () => {
      const response = await request(app)
        .post(`/api/v2/marketplace/auctions/${testAuction.auctionId}/bid`)
        .set('Authorization', `Bearer ${testToken}`)
        .send({ amount: 100 }) // Too low
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('bid amount');
    });
  });
});