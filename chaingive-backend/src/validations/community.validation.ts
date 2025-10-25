import { z } from 'zod';

export const communityValidation = {
  createPost: z.object({
    body: z.object({
      title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
      content: z.string().min(1, 'Content is required').max(2000, 'Content too long'),
      postType: z.enum(['success_story', 'testimonial', 'featured_request', 'announcement']),
      mediaUrls: z.array(z.string().url()).optional(),
      metadata: z.record(z.any()).optional()
    })
  }),

  createEvent: z.object({
    body: z.object({
      title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
      description: z.string().min(1, 'Description is required').max(1000, 'Description too long'),
      eventDate: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid date format'),
      eventTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
      location: z.string().min(1, 'Location is required').max(300, 'Location too long'),
      maxAttendees: z.number().int().positive().optional(),
      eventType: z.enum(['fundraising', 'community_meeting', 'workshop', 'celebration']),
      fundraisingGoal: z.number().positive().optional()
    })
  }),

  rsvpEvent: z.object({
    body: z.object({
      status: z.enum(['attending', 'maybe', 'declined'])
    })
  }),

  moderatePost: z.object({
    body: z.object({
      action: z.enum(['approve', 'reject', 'flag']),
      reason: z.string().max(500, 'Reason too long').optional()
    })
  }),

  reportPost: z.object({
    body: z.object({
      reason: z.enum([
        'inappropriate_content',
        'spam',
        'harassment',
        'misinformation',
        'copyright_violation',
        'other'
      ]),
      description: z.string().max(500, 'Description too long').optional()
    })
  })
};