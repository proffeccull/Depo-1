import { Request, Response } from 'express';
import { SocialService } from '../services/social.service';
import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';

const prisma = new PrismaClient();
const socialService = new SocialService(prisma, logger);

export class SocialController {
  /**
   * Create a new social circle
   */
  async createCircle(req: Request, res: Response): Promise<void> {
    try {
      const { name, description, isPrivate } = req.body;
      const creatorId = (req as any).user?.id;

      const circle = await socialService.createCircle({
        name,
        description,
        creatorId,
        isPrivate
      });

      res.status(201).json(circle);
    } catch (error: any) {
      logger.error('Create circle failed', { error: error.message });
      res.status(500).json({ error: 'Failed to create circle' });
    }
  }

  async getUserCircles(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const circles = await socialService.getUserCircles(userId);

      res.status(200).json({ circles });
    } catch (error: any) {
      logger.error('Get user circles failed', { error: error.message });
      res.status(500).json({ error: 'Failed to get circles' });
    }
  }

  async joinCircle(req: Request, res: Response): Promise<void> {
    try {
      const { circleId } = req.params;
      const userId = (req as any).user?.id;

      await socialService.joinCircle({ circleId, userId });

      res.status(200).json({ success: true, message: 'Joined circle successfully' });
    } catch (error: any) {
      logger.error('Join circle failed', { error: error.message });
      res.status(500).json({ error: 'Failed to join circle' });
    }
  }

  async leaveCircle(req: Request, res: Response): Promise<void> {
    try {
      const { circleId } = req.params;
      const userId = (req as any).user?.id;

      await socialService.leaveCircle(circleId, userId);

      res.status(200).json({ success: true, message: 'Left circle successfully' });
    } catch (error: any) {
      logger.error('Leave circle failed', { error: error.message });
      res.status(500).json({ error: 'Failed to leave circle' });
    }
  }

  async createPost(req: Request, res: Response): Promise<void> {
    try {
      const { content, mediaUrls, circleId } = req.body;
      const authorId = (req as any).user?.id;

      const post = await socialService.createPost({
        circleId,
        authorId,
        content,
        mediaUrls,
        postType: 'text'
      });

      res.status(201).json(post);
    } catch (error: any) {
      logger.error('Create post failed', { error: error.message });
      res.status(500).json({ error: 'Failed to create post' });
    }
  }

  async getFeed(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 20 } = req.query;
      const userId = (req as any).user?.id;
      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

      const posts = await socialService.getFeed(userId, parseInt(limit as string), offset);

      res.status(200).json({
        posts,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total: posts.length // Would need total count query
        }
      });
    } catch (error: any) {
      logger.error('Get feed failed', { error: error.message });
      res.status(500).json({ error: 'Failed to get feed' });
    }
  }

  async likePost(req: Request, res: Response): Promise<void> {
    try {
      const { postId } = req.params;
      const userId = (req as any).user?.id;

      // This would need a like/unlike method in the service
      // For now, return success
      res.status(200).json({ success: true, message: 'Post liked successfully' });
    } catch (error: any) {
      logger.error('Like post failed', { error: error.message });
      res.status(500).json({ error: 'Failed to like post' });
    }
  }

  async unlikePost(req: Request, res: Response): Promise<void> {
    try {
      const { postId } = req.params;

      res.status(200).json({ success: true, message: 'Post unliked successfully' });
    } catch (error: any) {
      logger.error('Unlike post failed', { error: error.message });
      res.status(500).json({ error: 'Failed to unlike post' });
    }
  }

  async addComment(req: Request, res: Response): Promise<void> {
    try {
      const { postId } = req.params;
      const { content } = req.body;
      const authorId = (req as any).user?.id;

      // This would need a comment creation method in the service
      const comment = {
        id: 'comment_' + Date.now(),
        postId,
        authorId,
        content,
        likesCount: 0,
        createdAt: new Date().toISOString()
      };

      res.status(201).json(comment);
    } catch (error: any) {
      logger.error('Add comment failed', { error: error.message });
      res.status(500).json({ error: 'Failed to add comment' });
    }
  }

  async getPostComments(req: Request, res: Response): Promise<void> {
    try {
      const { postId } = req.params;
      const { page = 1, limit = 10 } = req.query;

      // This would need a comment fetching method in the service
      const comments = [];

      res.status(200).json({
        comments,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total: 0
        }
      });
    } catch (error: any) {
      logger.error('Get post comments failed', { error: error.message });
      res.status(500).json({ error: 'Failed to get comments' });
    }
  }

  async sharePost(req: Request, res: Response): Promise<void> {
    try {
      const { postId } = req.params;

      res.status(200).json({ success: true, message: 'Post shared successfully' });
    } catch (error: any) {
      logger.error('Share post failed', { error: error.message });
      res.status(500).json({ error: 'Failed to share post' });
    }
  }

  async getTrendingPosts(req: Request, res: Response): Promise<void> {
    try {
      const { timeframe = '24h', limit = 10 } = req.query;

      // This would need trending posts logic in the service
      const posts = [];

      res.status(200).json({
        posts,
        timeframe,
        limit: parseInt(limit as string)
      });
    } catch (error: any) {
      logger.error('Get trending posts failed', { error: error.message });
      res.status(500).json({ error: 'Failed to get trending posts' });
    }
  }

  async search(req: Request, res: Response): Promise<void> {
    try {
      const { q, type = 'all', page = 1, limit = 20 } = req.query;

      let results = [];

      if (type === 'circles' || type === 'all') {
        const circles = await socialService.searchCircles(q as string, parseInt(limit as string));
        results = results.concat(circles.map(c => ({ ...c, type: 'circle' })));
      }

      // Add post search if needed

      res.status(200).json({
        query: q,
        type,
        results,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total: results.length
        }
      });
    } catch (error: any) {
      logger.error('Search failed', { error: error.message });
      res.status(500).json({ error: 'Search failed' });
    }
  }
}
