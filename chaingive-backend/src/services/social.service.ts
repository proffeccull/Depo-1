import { PrismaClient } from '@prisma/client';
import { injectable, inject } from 'inversify';
import winston from 'winston';

export interface CreateCircleInput {
  name: string;
  description?: string;
  creatorId: string;
  isPrivate?: boolean;
}

export interface CreatePostInput {
  circleId?: string;
  authorId: string;
  content: string;
  mediaUrls?: string[];
  postType?: 'text' | 'image' | 'video' | 'donation_story';
}

export interface JoinCircleInput {
  circleId: string;
  userId: string;
}

@injectable()
export class SocialService {
  constructor(
    @inject('PrismaClient') private prisma: PrismaClient,
    @inject('Logger') private logger: winston.Logger
  ) {}

  async createCircle(data: CreateCircleInput): Promise<any> {
    try {
      const circle = await this.prisma.socialCircle.create({
        data: {
          name: data.name,
          description: data.description,
          creatorId: data.creatorId,
          isPrivate: data.isPrivate || false,
          memberCount: 1
        }
      });

      // Add creator as admin member
      await this.prisma.socialCircleMember.create({
        data: {
          circleId: circle.id,
          userId: data.creatorId,
          role: 'admin'
        }
      });

      this.logger.info('Social circle created', { circleId: circle.id, creatorId: data.creatorId });
      return circle;
    } catch (error) {
      this.logger.error('Failed to create social circle', { error, data });
      throw new Error('CIRCLE_CREATION_FAILED');
    }
  }

  async joinCircle(data: JoinCircleInput): Promise<void> {
    try {
      // Check if circle exists and user isn't already a member
      const existingMember = await this.prisma.socialCircleMember.findUnique({
        where: {
          circleId_userId: {
            circleId: data.circleId,
            userId: data.userId
          }
        }
      });

      if (existingMember) {
        throw new Error('USER_ALREADY_MEMBER');
      }

      await this.prisma.$transaction(async (tx) => {
        // Add member
        await tx.socialCircleMember.create({
          data: {
            circleId: data.circleId,
            userId: data.userId,
            role: 'member'
          }
        });

        // Update member count
        await tx.socialCircle.update({
          where: { id: data.circleId },
          data: { memberCount: { increment: 1 } }
        });
      });

      this.logger.info('User joined circle', { circleId: data.circleId, userId: data.userId });
    } catch (error) {
      this.logger.error('Failed to join circle', { error, data });
      throw error;
    }
  }

  async leaveCircle(circleId: string, userId: string): Promise<void> {
    try {
      await this.prisma.$transaction(async (tx) => {
        // Remove member
        await tx.socialCircleMember.delete({
          where: {
            circleId_userId: {
              circleId,
              userId
            }
          }
        });

        // Update member count
        await tx.socialCircle.update({
          where: { id: circleId },
          data: { memberCount: { decrement: 1 } }
        });
      });

      this.logger.info('User left circle', { circleId, userId });
    } catch (error) {
      this.logger.error('Failed to leave circle', { error, circleId, userId });
      throw new Error('LEAVE_CIRCLE_FAILED');
    }
  }

  async createPost(data: CreatePostInput): Promise<any> {
    try {
      const post = await this.prisma.socialPost.create({
        data: {
          circleId: data.circleId,
          authorId: data.authorId,
          content: data.content,
          mediaUrls: data.mediaUrls || [],
          postType: data.postType || 'text'
        },
        include: {
          author: {
            select: { id: true, displayName: true, profilePicture: true }
          },
          circle: {
            select: { id: true, name: true }
          }
        }
      });

      this.logger.info('Social post created', { postId: post.id, authorId: data.authorId });
      return post;
    } catch (error) {
      this.logger.error('Failed to create post', { error, data });
      throw new Error('POST_CREATION_FAILED');
    }
  }

  async getFeed(userId: string, limit: number = 20, offset: number = 0): Promise<any[]> {
    try {
      // Get user's circles
      const userCircles = await this.prisma.socialCircleMember.findMany({
        where: { userId },
        select: { circleId: true }
      });

      const circleIds = userCircles.map(uc => uc.circleId);

      // Get posts from user's circles
      const posts = await this.prisma.socialPost.findMany({
        where: {
          OR: [
            { circleId: { in: circleIds } },
            { circleId: null } // Public posts
          ]
        },
        include: {
          author: {
            select: { id: true, displayName: true, profilePicture: true }
          },
          circle: {
            select: { id: true, name: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset
      });

      return posts;
    } catch (error) {
      this.logger.error('Failed to get feed', { error, userId });
      throw new Error('FEED_FETCH_FAILED');
    }
  }

  async getUserCircles(userId: string): Promise<any[]> {
    try {
      const circles = await this.prisma.socialCircleMember.findMany({
        where: { userId },
        include: {
          circle: {
            include: {
              creator: {
                select: { id: true, displayName: true, profilePicture: true }
              }
            }
          }
        },
        orderBy: { joinedAt: 'desc' }
      });

      return circles.map(cm => ({
        ...cm.circle,
        userRole: cm.role,
        joinedAt: cm.joinedAt
      }));
    } catch (error) {
      this.logger.error('Failed to get user circles', { error, userId });
      throw new Error('USER_CIRCLES_FAILED');
    }
  }

  async searchCircles(query: string, limit: number = 10): Promise<any[]> {
    try {
      return await this.prisma.socialCircle.findMany({
        where: {
          AND: [
            { isPrivate: false },
            {
              OR: [
                { name: { contains: query, mode: 'insensitive' } },
                { description: { contains: query, mode: 'insensitive' } }
              ]
            }
          ]
        },
        include: {
          creator: {
            select: { id: true, displayName: true, profilePicture: true }
          }
        },
        orderBy: { memberCount: 'desc' },
        take: limit
      });
    } catch (error) {
      this.logger.error('Failed to search circles', { error, query });
      throw new Error('CIRCLE_SEARCH_FAILED');
    }
  }
}