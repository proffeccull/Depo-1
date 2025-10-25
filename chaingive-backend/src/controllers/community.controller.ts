import { Request, Response } from 'express';
import { CommunityService } from '../services/community.service';
import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';

const prisma = new PrismaClient();
const communityService = new CommunityService(prisma, logger);

export class CommunityController {
  /**
   * Create a new community post (success story, testimonial, etc.)
   */
  async createPost(req: Request, res: Response): Promise<void> {
    try {
      const { content, mediaUrls, postType, title, metadata } = req.body;
      const authorId = (req as any).user?.id;

      // Check if user is verified for posting
      const user = await prisma.user.findUnique({
        where: { id: authorId },
        select: { isVerified: true, trustScore: true }
      });

      if (!user?.isVerified) {
        return res.status(403).json({
          error: 'User must be verified to create community posts'
        });
      }

      const post = await communityService.createPost({
        authorId,
        title,
        content,
        postType,
        mediaUrls,
        metadata,
        status: 'pending_moderation' // All posts start pending moderation
      });

      res.status(201).json({
        post,
        message: 'Post created successfully and is pending moderation'
      });
    } catch (error: any) {
      logger.error('Create community post failed', { error: error.message });
      res.status(500).json({ error: 'Failed to create post' });
    }
  }

  /**
   * Get community feed with filtering and pagination
   */
  async getFeed(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 20, category = 'all' } = req.query;
      const userId = (req as any).user?.id;

      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

      const posts = await communityService.getFeed({
        userId,
        category: category as string,
        limit: parseInt(limit as string),
        offset
      });

      res.status(200).json({
        posts,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total: posts.length
        }
      });
    } catch (error: any) {
      logger.error('Get community feed failed', { error: error.message });
      res.status(500).json({ error: 'Failed to get feed' });
    }
  }

  /**
   * Like a community post
   */
  async likePost(req: Request, res: Response): Promise<void> {
    try {
      const { postId } = req.params;
      const userId = (req as any).user?.id;

      await communityService.likePost(postId, userId);

      res.status(200).json({ success: true, message: 'Post liked successfully' });
    } catch (error: any) {
      logger.error('Like community post failed', { error: error.message });
      res.status(500).json({ error: 'Failed to like post' });
    }
  }

  /**
   * Share a community post
   */
  async sharePost(req: Request, res: Response): Promise<void> {
    try {
      const { postId } = req.params;
      const userId = (req as any).user?.id;

      await communityService.sharePost(postId, userId);

      res.status(200).json({ success: true, message: 'Post shared successfully' });
    } catch (error: any) {
      logger.error('Share community post failed', { error: error.message });
      res.status(500).json({ error: 'Failed to share post' });
    }
  }

  /**
   * Create a community event
   */
  async createEvent(req: Request, res: Response): Promise<void> {
    try {
      const {
        title,
        description,
        eventDate,
        eventTime,
        location,
        maxAttendees,
        eventType,
        fundraisingGoal
      } = req.body;
      const creatorId = (req as any).user?.id;

      // Check if user is agent or verified community leader
      const user = await prisma.user.findUnique({
        where: { id: creatorId },
        select: { isVerified: true, role: true }
      });

      if (!user?.isVerified || (user.role !== 'agent' && user.role !== 'community_leader')) {
        return res.status(403).json({
          error: 'Only verified agents and community leaders can create events'
        });
      }

      const event = await communityService.createEvent({
        creatorId,
        title,
        description,
        eventDate,
        eventTime,
        location,
        maxAttendees,
        eventType,
        fundraisingGoal,
        status: 'active'
      });

      res.status(201).json({
        event,
        message: 'Event created successfully'
      });
    } catch (error: any) {
      logger.error('Create community event failed', { error: error.message });
      res.status(500).json({ error: 'Failed to create event' });
    }
  }

  /**
   * RSVP to an event
   */
  async rsvpEvent(req: Request, res: Response): Promise<void> {
    try {
      const { eventId } = req.params;
      const { status } = req.body; // 'attending', 'maybe', 'declined'
      const userId = (req as any).user?.id;

      await communityService.rsvpEvent(eventId, userId, status);

      res.status(200).json({
        success: true,
        message: `RSVP status updated to ${status}`
      });
    } catch (error: any) {
      logger.error('RSVP to event failed', { error: error.message });
      res.status(500).json({ error: 'Failed to update RSVP' });
    }
  }

  /**
   * Get user's events and RSVPs
   */
  async getUserEvents(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;

      const events = await communityService.getUserEvents(userId);

      res.status(200).json({ events });
    } catch (error: any) {
      logger.error('Get user events failed', { error: error.message });
      res.status(500).json({ error: 'Failed to get events' });
    }
  }

  /**
   * Moderate a community post (admin/community moderator only)
   */
  async moderatePost(req: Request, res: Response): Promise<void> {
    try {
      const { postId } = req.params;
      const { action, reason } = req.body; // action: 'approve', 'reject', 'flag'
      const moderatorId = (req as any).user?.id;

      // Check moderator permissions
      const moderator = await prisma.user.findUnique({
        where: { id: moderatorId },
        select: { role: true }
      });

      if (!['admin', 'moderator', 'community_leader'].includes(moderator?.role || '')) {
        return res.status(403).json({
          error: 'Insufficient permissions to moderate posts'
        });
      }

      await communityService.moderatePost(postId, action, moderatorId, reason);

      res.status(200).json({
        success: true,
        message: `Post ${action}d successfully`
      });
    } catch (error: any) {
      logger.error('Moderate post failed', { error: error.message });
      res.status(500).json({ error: 'Failed to moderate post' });
    }
  }

  /**
   * Get posts pending moderation (moderator only)
   */
  async getPendingPosts(req: Request, res: Response): Promise<void> {
    try {
      const moderatorId = (req as any).user?.id;

      // Check moderator permissions
      const moderator = await prisma.user.findUnique({
        where: { id: moderatorId },
        select: { role: true }
      });

      if (!['admin', 'moderator', 'community_leader'].includes(moderator?.role || '')) {
        return res.status(403).json({
          error: 'Insufficient permissions to view pending posts'
        });
      }

      const posts = await communityService.getPendingPosts();

      res.status(200).json({ posts });
    } catch (error: any) {
      logger.error('Get pending posts failed', { error: error.message });
      res.status(500).json({ error: 'Failed to get pending posts' });
    }
  }

  /**
   * Report a community post
   */
  async reportPost(req: Request, res: Response): Promise<void> {
    try {
      const { postId } = req.params;
      const { reason, description } = req.body;
      const reporterId = (req as any).user?.id;

      await communityService.reportPost(postId, reporterId, reason, description);

      res.status(200).json({
        success: true,
        message: 'Post reported successfully'
      });
    } catch (error: any) {
      logger.error('Report post failed', { error: error.message });
      res.status(500).json({ error: 'Failed to report post' });
    }
  }
}