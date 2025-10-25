import request from 'supertest';
import { app } from '../../src/server';
import { prisma } from '../../src/config/database';
import { generateTestToken } from '../helpers/auth.helper';

describe('Community Flow Integration Tests', () => {
  let testUser: any;
  let testToken: string;
  let testEvent: any;
  let testPost: any;

  beforeAll(async () => {
    // Create test user
    testUser = await prisma.user.create({
      data: {
        phoneNumber: '+2348012345678',
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
      },
    });

    testToken = generateTestToken(testUser.id);
  });

  afterAll(async () => {
    // Cleanup
    await prisma.communityPost.deleteMany({ where: { authorId: testUser.id } });
    await prisma.communityEvent.deleteMany({ where: { creatorId: testUser.id } });
    await prisma.user.delete({ where: { id: testUser.id } });
  });

  describe('POST /api/v2/community/posts', () => {
    it('should create a community post successfully', async () => {
      const postData = {
        content: 'This is a test community post about helping others',
        type: 'story',
        media: ['https://example.com/image1.jpg'],
      };

      const response = await request(app)
        .post('/api/v2/community/posts')
        .set('Authorization', `Bearer ${testToken}`)
        .send(postData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.content).toBe(postData.content);
      expect(response.body.data.type).toBe(postData.type);
      expect(response.body.data.authorId).toBe(testUser.id);

      testPost = response.body.data;
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/v2/community/posts')
        .set('Authorization', `Bearer ${testToken}`)
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });

    it('should enforce rate limiting', async () => {
      // Create multiple posts quickly to trigger rate limit
      const promises = Array(15).fill().map(() =>
        request(app)
          .post('/api/v2/community/posts')
          .set('Authorization', `Bearer ${testToken}`)
          .send({
            content: 'Rate limit test post',
            type: 'story',
          })
      );

      const results = await Promise.allSettled(promises);
      const rejectedCount = results.filter(r => r.status === 'rejected').length;
      expect(rejectedCount).toBeGreaterThan(0);
    });
  });

  describe('GET /api/v2/community/posts', () => {
    it('should retrieve community posts with pagination', async () => {
      const response = await request(app)
        .get('/api/v2/community/posts?page=1&limit=10')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.posts)).toBe(true);
      expect(response.body.data.posts.length).toBeGreaterThan(0);
      expect(response.body.data.posts[0]).toHaveProperty('author');
      expect(response.body.data.posts[0]).toHaveProperty('likes');
      expect(response.body.data.posts[0]).toHaveProperty('commentsCount');
    });

    it('should filter posts by type', async () => {
      const response = await request(app)
        .get('/api/v2/community/posts?type=story')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.posts.every((post: any) => post.type === 'story')).toBe(true);
    });
  });

  describe('POST /api/v2/community/posts/:postId/like', () => {
    it('should like a post', async () => {
      const response = await request(app)
        .post(`/api/v2/community/posts/${testPost.id}/like`)
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify like was recorded
      const postResponse = await request(app)
        .get(`/api/v2/community/posts/${testPost.id}`)
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      expect(postResponse.body.data.isLiked).toBe(true);
      expect(postResponse.body.data.likes).toBeGreaterThan(0);
    });

    it('should unlike a post when liked again', async () => {
      const response = await request(app)
        .post(`/api/v2/community/posts/${testPost.id}/like`)
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify like was removed
      const postResponse = await request(app)
        .get(`/api/v2/community/posts/${testPost.id}`)
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      expect(postResponse.body.data.isLiked).toBe(false);
    });
  });

  describe('POST /api/v2/community/events', () => {
    it('should create a community event successfully', async () => {
      const eventData = {
        title: 'Community Health Drive',
        description: 'Free medical checkups for our community members',
        eventDate: '2025-12-01',
        eventTime: '10:00',
        location: 'Community Center, Lagos',
        maxAttendees: 100,
        eventType: 'health',
        fundraisingGoal: 50000,
      };

      const response = await request(app)
        .post('/api/v2/community/events')
        .set('Authorization', `Bearer ${testToken}`)
        .send(eventData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(eventData.title);
      expect(response.body.data.creatorId).toBe(testUser.id);
      expect(response.body.data.fundraisingGoal).toBe(eventData.fundraisingGoal);

      testEvent = response.body.data;
    });
  });

  describe('POST /api/v2/community/events/:eventId/rsvp', () => {
    it('should RSVP to an event', async () => {
      const response = await request(app)
        .post(`/api/v2/community/events/${testEvent.id}/rsvp`)
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify RSVP was recorded
      const eventResponse = await request(app)
        .get(`/api/v2/community/events/${testEvent.id}`)
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      expect(eventResponse.body.data.isAttending).toBe(true);
      expect(eventResponse.body.data.currentAttendees).toBe(1);
    });
  });

  describe('POST /api/v2/community/events/:eventId/donate', () => {
    it('should donate to an event fundraising', async () => {
      const donationData = {
        amount: 5000,
        message: 'Supporting our community health initiative',
      };

      const response = await request(app)
        .post(`/api/v2/community/events/${testEvent.id}/donate`)
        .set('Authorization', `Bearer ${testToken}`)
        .send(donationData)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify donation was recorded
      const eventResponse = await request(app)
        .get(`/api/v2/community/events/${testEvent.id}`)
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      expect(eventResponse.body.data.currentRaised).toBe(donationData.amount);
    });
  });

  describe('GET /api/v2/community/analytics/overview', () => {
    it('should retrieve community analytics', async () => {
      const response = await request(app)
        .get('/api/v2/community/analytics/overview')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalPosts');
      expect(response.body.data).toHaveProperty('totalEvents');
      expect(response.body.data).toHaveProperty('activeUsers');
      expect(response.body.data).toHaveProperty('engagementRate');
    });
  });

  describe('Error Handling', () => {
    it('should handle unauthorized access', async () => {
      const response = await request(app)
        .post('/api/v2/community/posts')
        .send({ content: 'Test post', type: 'story' })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Unauthorized');
    });

    it('should handle not found resources', async () => {
      const response = await request(app)
        .get('/api/v2/community/posts/non-existent-id')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not found');
    });

    it('should handle invalid data', async () => {
      const response = await request(app)
        .post('/api/v2/community/events')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          title: '', // Invalid empty title
          eventDate: 'invalid-date',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });
  });
});