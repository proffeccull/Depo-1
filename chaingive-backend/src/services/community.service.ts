import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';

interface CreatePostData {
  authorId: string;
  title: string;
  content: string;
  postType: 'success_story' | 'testimonial' | 'featured_request' | 'announcement';
  mediaUrls?: string[];
  metadata?: any;
  status: 'pending_moderation' | 'approved' | 'rejected' | 'flagged';
}

interface CreateEventData {
  creatorId: string;
  title: string;
  description: string;
  eventDate: string;
  eventTime: string;
  location: string;
  maxAttendees?: number;
  eventType: 'fundraising' | 'community_meeting' | 'workshop' | 'celebration';
  fundraisingGoal?: number;
  status: 'active' | 'cancelled' | 'completed';
}

export class CommunityService {
  constructor(
    private prisma: PrismaClient,
    private logger: typeof logger
  ) {}

  async createPost(data: CreatePostData) {
    try {
      const post = await this.prisma.communityPost.create({
        data: {
          authorId: data.authorId,
          title: data.title,
          content: data.content,
          postType: data.postType,
          mediaUrls: data.mediaUrls || [],
          metadata: data.metadata || {},
          status: data.status,
          likesCount: 0,
          sharesCount: 0,
          reportsCount: 0
        },
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              trustScore: true
            }
          }
        }
      });

      this.logger.info('Community post created', { postId: post.id, authorId: data.authorId });
      return post;
    } catch (error: any) {
      this.logger.error('Failed to create community post', { error: error.message });
      throw error;
    }
  }

  async getFeed({ userId, category, limit, offset }: {
    userId: string;
    category: string;
    limit: number;
    offset: number;
  }) {
    try {
      const where: any = {
        status: 'approved'
      };

      // Filter by category if specified
      if (category !== 'all') {
        if (category === 'events') {
          // For events, we need to check if there's an associated event
          where.eventId = { not: null };
        } else {
          where.postType = category;
        }
      }

      const posts = await this.prisma.communityPost.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              trustScore: true
            }
          },
          event: {
            select: {
              id: true,
              title: true,
              eventDate: true,
              location: true,
              eventType: true
            }
          },
          likes: {
            where: { userId },
            select: { id: true }
          },
          shares: {
            where: { userId },
            select: { id: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset
      });

      // Transform posts to include user interaction status
      const transformedPosts = posts.map(post => ({
        id: post.id,
        type: post.postType,
        title: post.title,
        content: post.content,
        authorName: `${post.author.firstName} ${post.author.lastName}`,
        authorAvatar: post.authorAvatar,
        timestamp: post.createdAt.toISOString(),
        likes: post.likesCount,
        shares: post.sharesCount,
        isLiked: post.likes.length > 0,
        isShared: post.shares.length > 0,
        metadata: post.metadata,
        mediaUrls: post.mediaUrls
      }));

      return transformedPosts;
    } catch (error: any) {
      this.logger.error('Failed to get community feed', { error: error.message });
      throw error;
    }
  }

  async likePost(postId: string, userId: string) {
    try {
      // Check if user already liked the post
      const existingLike = await this.prisma.communityPostLike.findUnique({
        where: {
          postId_userId: {
            postId,
            userId
          }
        }
      });

      if (existingLike) {
        // Unlike the post
        await this.prisma.communityPostLike.delete({
          where: { id: existingLike.id }
        });

        await this.prisma.communityPost.update({
          where: { id: postId },
          data: { likesCount: { decrement: 1 } }
        });
      } else {
        // Like the post
        await this.prisma.communityPostLike.create({
          data: { postId, userId }
        });

        await this.prisma.communityPost.update({
          where: { id: postId },
          data: { likesCount: { increment: 1 } }
        });
      }

      this.logger.info('Community post like toggled', { postId, userId });
    } catch (error: any) {
      this.logger.error('Failed to like community post', { error: error.message });
      throw error;
    }
  }

  async sharePost(postId: string, userId: string) {
    try {
      // Check if user already shared the post
      const existingShare = await this.prisma.communityPostShare.findUnique({
        where: {
          postId_userId: {
            postId,
            userId
          }
        }
      });

      if (!existingShare) {
        await this.prisma.communityPostShare.create({
          data: { postId, userId }
        });

        await this.prisma.communityPost.update({
          where: { id: postId },
          data: { sharesCount: { increment: 1 } }
        });
      }

      this.logger.info('Community post shared', { postId, userId });
    } catch (error: any) {
      this.logger.error('Failed to share community post', { error: error.message });
      throw error;
    }
  }

  async createEvent(data: CreateEventData) {
    try {
      const event = await this.prisma.communityEvent.create({
        data: {
          creatorId: data.creatorId,
          title: data.title,
          description: data.description,
          eventDate: new Date(data.eventDate),
          eventTime: data.eventTime,
          location: data.location,
          maxAttendees: data.maxAttendees,
          eventType: data.eventType,
          fundraisingGoal: data.fundraisingGoal,
          status: data.status,
          currentAttendees: 0
        }
      });

      // Create an announcement post for the event
      await this.createPost({
        authorId: data.creatorId,
        title: `New Event: ${data.title}`,
        content: data.description,
        postType: 'announcement',
        metadata: {
          eventDate: data.eventDate,
          eventLocation: data.location,
          eventType: data.eventType
        },
        status: 'approved' // Event announcements from verified users are auto-approved
      });

      this.logger.info('Community event created', { eventId: event.id, creatorId: data.creatorId });
      return event;
    } catch (error: any) {
      this.logger.error('Failed to create community event', { error: error.message });
      throw error;
    }
  }

  async rsvpEvent(eventId: string, userId: string, status: 'attending' | 'maybe' | 'declined') {
    try {
      // Check if RSVP already exists
      const existingRSVP = await this.prisma.eventRSVP.findUnique({
        where: {
          eventId_userId: {
            eventId,
            userId
          }
        }
      });

      if (existingRSVP) {
        // Update existing RSVP
        await this.prisma.eventRSVP.update({
          where: { id: existingRSVP.id },
          data: { status }
        });
      } else {
        // Create new RSVP
        await this.prisma.eventRSVP.create({
          data: { eventId, userId, status }
        });
      }

      // Update attendee count
      const attendeeCount = await this.prisma.eventRSVP.count({
        where: {
          eventId,
          status: 'attending'
        }
      });

      await this.prisma.communityEvent.update({
        where: { id: eventId },
        data: { currentAttendees: attendeeCount }
      });

      this.logger.info('Event RSVP updated', { eventId, userId, status });
    } catch (error: any) {
      this.logger.error('Failed to RSVP to event', { error: error.message });
      throw error;
    }
  }

  async getUserEvents(userId: string) {
    try {
      // Get events created by user
      const createdEvents = await this.prisma.communityEvent.findMany({
        where: { creatorId: userId },
        include: {
          _count: {
            select: { rsvps: true }
          }
        }
      });

      // Get events user is attending
      const attendingEvents = await this.prisma.eventRSVP.findMany({
        where: { userId, status: 'attending' },
        include: {
          event: true
        }
      });

      return {
        created: createdEvents,
        attending: attendingEvents.map(rsvp => rsvp.event)
      };
    } catch (error: any) {
      this.logger.error('Failed to get user events', { error: error.message });
      throw error;
    }
  }

  async moderatePost(postId: string, action: 'approve' | 'reject' | 'flag', moderatorId: string, reason?: string) {
    try {
      const status = action === 'approve' ? 'approved' :
                    action === 'reject' ? 'rejected' : 'flagged';

      await this.prisma.communityPost.update({
        where: { id: postId },
        data: {
          status,
          moderatedAt: new Date(),
          moderatedBy: moderatorId,
          moderationReason: reason
        }
      });

      // Log moderation action
      await this.prisma.moderationLog.create({
        data: {
          postId,
          moderatorId,
          action,
          reason
        }
      });

      this.logger.info('Community post moderated', { postId, action, moderatorId });
    } catch (error: any) {
      this.logger.error('Failed to moderate post', { error: error.message });
      throw error;
    }
  }

  async getPendingPosts() {
    try {
      const posts = await this.prisma.communityPost.findMany({
        where: { status: 'pending_moderation' },
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              trustScore: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      return posts;
    } catch (error: any) {
      this.logger.error('Failed to get pending posts', { error: error.message });
      throw error;
    }
  }

  async reportPost(postId: string, reporterId: string, reason: string, description?: string) {
    try {
      await this.prisma.postReport.create({
        data: {
          postId,
          reporterId,
          reason,
          description
        }
      });

      // Increment reports count
      await this.prisma.communityPost.update({
        where: { id: postId },
        data: { reportsCount: { increment: 1 } }
      });

      // Auto-flag if too many reports
      const post = await this.prisma.communityPost.findUnique({
        where: { id: postId },
        select: { reportsCount: true }
      });

      if (post && post.reportsCount >= 5) {
        await this.moderatePost(postId, 'flag', 'system', 'Auto-flagged due to multiple reports');
      }

      this.logger.info('Community post reported', { postId, reporterId, reason });
    } catch (error: any) {
      this.logger.error('Failed to report post', { error: error.message });
      throw error;
    }
  }
}