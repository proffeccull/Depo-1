import request from 'supertest';
import app from '../../src/server';
import prisma from '../../src/utils/prisma';

// Mock external services
jest.mock('../../src/services/notification.service');
jest.mock('../../src/services/otp.service');

describe('Authentication Flow Integration Tests', () => {
  beforeEach(async () => {
    // Clean up database
    await prisma.user.deleteMany();
    await prisma.biometricRegistration.deleteMany();
    await prisma.refreshToken.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('Biometric Authentication Flow', () => {
    it('should complete full biometric registration and authentication flow', async () => {
      // Step 1: Register user
      const registerResponse = await request(app)
        .post('/api/v1/auth/register')
        .send({
          phoneNumber: '+2341234567890',
          firstName: 'John',
          lastName: 'Doe',
          city: 'Lagos',
        });

      expect(registerResponse.status).toBe(201);
      const userId = registerResponse.body.data.user.id;

      // Step 2: Generate biometric challenge
      const challengeResponse = await request(app)
        .post('/api/v1/biometric/challenge')
        .set('Authorization', `Bearer ${registerResponse.body.data.accessToken}`);

      expect(challengeResponse.status).toBe(200);
      expect(challengeResponse.body.data).toHaveProperty('challengeId');
      expect(challengeResponse.body.data).toHaveProperty('challenge');

      const { challengeId } = challengeResponse.body.data;

      // Step 3: Register biometric credentials
      const biometricResponse = await request(app)
        .post('/api/v1/biometric/register')
        .set('Authorization', `Bearer ${registerResponse.body.data.accessToken}`)
        .send({
          publicKey: 'biometric-public-key-123',
          deviceId: 'test-device-123',
          deviceInfo: {
            platform: 'iOS',
            model: 'iPhone 12',
            osVersion: '14.0',
          },
          signature: 'biometric-signature-123',
        });

      expect(biometricResponse.status).toBe(201);
      expect(biometricResponse.body.data).toHaveProperty('biometricKey');

      // Step 4: Authenticate with biometric
      const authResponse = await request(app)
        .post('/api/v1/biometric/authenticate')
        .send({
          userId,
          biometricToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test-signature', // Mock JWT
          deviceId: 'test-device-123',
          challengeId,
        });

      expect(authResponse.status).toBe(200);
      expect(authResponse.body.data).toHaveProperty('accessToken');
      expect(authResponse.body.data).toHaveProperty('refreshToken');
      expect(authResponse.body.data).toHaveProperty('user');
      expect(authResponse.body.data.user.id).toBe(userId);
    });

    it('should handle biometric authentication failure', async () => {
      const authResponse = await request(app)
        .post('/api/v1/biometric/authenticate')
        .send({
          userId: 'nonexistent-user',
          biometricToken: 'invalid-token',
          deviceId: 'unknown-device',
        });

      expect(authResponse.status).toBe(401);
      expect(authResponse.body.success).toBe(false);
    });
  });

  describe('Fraud Detection Integration', () => {
    let userId: string;
    let accessToken: string;

    beforeEach(async () => {
      // Create test user
      const registerResponse = await request(app)
        .post('/api/v1/auth/register')
        .send({
          phoneNumber: '+2341234567891',
          firstName: 'Jane',
          lastName: 'Smith',
          city: 'Abuja',
        });

      userId = registerResponse.body.data.user.id;
      accessToken = registerResponse.body.data.accessToken;
    });

    it('should check payment fraud and approve legitimate transaction', async () => {
      const fraudCheck = {
        userId,
        amount: 5000,
        currency: 'NGN',
        gateway: 'flutterwave',
        location: {
          country: 'NG',
          city: 'Abuja',
        },
      };

      const response = await request(app)
        .post('/api/v1/fraud/check')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(fraudCheck);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('isFraudulent');
      expect(response.body.data).toHaveProperty('riskLevel');
      expect(response.body.data).toHaveProperty('score');
    });

    it('should detect high-risk transaction', async () => {
      const fraudCheck = {
        userId,
        amount: 50000, // Large amount
        currency: 'NGN',
        gateway: 'flutterwave',
        location: {
          country: 'US', // Different country
          city: 'New York',
        },
      };

      const response = await request(app)
        .post('/api/v1/fraud/check')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(fraudCheck);

      expect(response.status).toBe(200);
      expect(response.body.data.riskLevel).not.toBe('low');
      expect(response.body.data.reasons.length).toBeGreaterThan(0);
    });

    it('should allow reporting false positives', async () => {
      // First create a transaction that might be flagged
      const transactionId = 'test-transaction-123';

      const reportResponse = await request(app)
        .post('/api/v1/fraud/false-positive')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          transactionId,
          reason: 'Legitimate business expense',
        });

      expect(reportResponse.status).toBe(200);
      expect(reportResponse.body.success).toBe(true);
    });
  });

  describe('AI Matching Integration', () => {
    let donorId: string;
    let recipientId: string;
    let accessToken: string;

    beforeEach(async () => {
      // Create donor
      const donorResponse = await request(app)
        .post('/api/v1/auth/register')
        .send({
          phoneNumber: '+2341234567892',
          firstName: 'Donor',
          lastName: 'User',
          city: 'Lagos',
        });

      donorId = donorResponse.body.data.user.id;
      accessToken = donorResponse.body.data.accessToken;

      // Create recipient
      const recipientResponse = await request(app)
        .post('/api/v1/auth/register')
        .send({
          phoneNumber: '+2341234567893',
          firstName: 'Recipient',
          lastName: 'User',
          city: 'Lagos',
        });

      recipientId = recipientResponse.body.data.user.id;
    });

    it('should find AI-powered match', async () => {
      const matchResponse = await request(app)
        .post('/api/v1/cycles/match')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          donorId,
          amount: 5000,
          preferences: {
            location: 'Lagos',
          },
        });

      expect(matchResponse.status).toBe(200);
      expect(matchResponse.body.success).toBe(true);
      // Match result depends on AI algorithm and available recipients
    });

    it('should handle match acceptance', async () => {
      // First get a match
      const matchResponse = await request(app)
        .post('/api/v1/cycles/match')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          donorId,
          amount: 5000,
        });

      if (matchResponse.body.data?.match) {
        const matchId = matchResponse.body.data.match.id;

        // Accept the match
        const acceptResponse = await request(app)
          .put(`/api/v1/matches/${matchId}/accept`)
          .set('Authorization', `Bearer ${accessToken}`);

        expect(acceptResponse.status).toBe(200);
        expect(acceptResponse.body.success).toBe(true);
      }
    });
  });
});