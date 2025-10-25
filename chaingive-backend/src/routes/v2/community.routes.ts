import { Router } from 'express';
import { body, param, query } from 'express-validator';
import rateLimit from 'express-rate-limit';
import { CommunityController } from '../../controllers/v2/community.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { validateRequest } from '../../middleware/validation.middleware';

const router = Router();
const communityController = new CommunityController();

// Rate limiting for community endpoints
const communityLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many community requests from this IP, please try again later.',
});

const postLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // limit each user to 10 posts per minute
  message: 'Too many posts created, please slow down.',
});

// Apply authentication to all routes
router.use(authenticate);

// Community Posts Endpoints
router.get('/posts',
  communityLimiter,
  [
    query('type').optional().isIn(['story', 'event', 'announcement']),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 }),
  ],
  validateRequest,
  communityController.getPosts
);

router.post('/posts',
  postLimiter,
  [
    body('content').trim().isLength({ min: 1, max: 2000 }),
    body('type').isIn(['story', 'event', 'announcement']),
    body('media').optional().isArray(),
    body('eventId').optional().isUUID(),
  ],
  validateRequest,
  communityController.createPost
);

router.get('/posts/:postId',
  [param('postId').isUUID()],
  validateRequest,
  communityController.getPost
);

router.put('/posts/:postId',
  [
    param('postId').isUUID(),
    body('content').optional().trim().isLength({ min: 1, max: 2000 }),
    body('media').optional().isArray(),
  ],
  validateRequest,
  communityController.updatePost
);

router.delete('/posts/:postId',
  [param('postId').isUUID()],
  validateRequest,
  communityController.deletePost
);

// Post Interactions
router.post('/posts/:postId/like',
  [param('postId').isUUID()],
  validateRequest,
  communityController.likePost
);

router.delete('/posts/:postId/like',
  [param('postId').isUUID()],
  validateRequest,
  communityController.unlikePost
);

router.post('/posts/:postId/comments',
  [
    param('postId').isUUID(),
    body('content').trim().isLength({ min: 1, max: 500 }),
  ],
  validateRequest,
  communityController.addComment
);

router.get('/posts/:postId/comments',
  [
    param('postId').isUUID(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 20 }),
  ],
  validateRequest,
  communityController.getComments
);

// Community Events Endpoints
router.get('/events',
  communityLimiter,
  [
    query('filter').optional().isIn(['all', 'my-events', 'attending']),
    query('type').optional().isIn(['community', 'fundraising', 'education', 'health']),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 20 }),
  ],
  validateRequest,
  communityController.getEvents
);

router.post('/events',
  [
    body('title').trim().isLength({ min: 1, max: 100 }),
    body('description').trim().isLength({ min: 1, max: 1000 }),
    body('eventDate').isISO8601(),
    body('eventTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    body('location').trim().isLength({ min: 1, max: 200 }),
    body('maxAttendees').optional().isInt({ min: 1 }),
    body('eventType').isIn(['community', 'fundraising', 'education', 'health']),
    body('fundraisingGoal').optional().isFloat({ min: 0 }),
  ],
  validateRequest,
  communityController.createEvent
);

router.get('/events/:eventId',
  [param('eventId').isUUID()],
  validateRequest,
  communityController.getEvent
);

router.put('/events/:eventId',
  [
    param('eventId').isUUID(),
    body('title').optional().trim().isLength({ min: 1, max: 100 }),
    body('description').optional().trim().isLength({ min: 1, max: 1000 }),
    body('eventDate').optional().isISO8601(),
    body('eventTime').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    body('location').optional().trim().isLength({ min: 1, max: 200 }),
    body('maxAttendees').optional().isInt({ min: 1 }),
    body('fundraisingGoal').optional().isFloat({ min: 0 }),
  ],
  validateRequest,
  communityController.updateEvent
);

router.delete('/events/:eventId',
  [param('eventId').isUUID()],
  validateRequest,
  communityController.deleteEvent
);

// Event RSVP
router.post('/events/:eventId/rsvp',
  [param('eventId').isUUID()],
  validateRequest,
  communityController.rsvpEvent
);

router.delete('/events/:eventId/rsvp',
  [param('eventId').isUUID()],
  validateRequest,
  communityController.cancelRsvp
);

// Event Donations
router.post('/events/:eventId/donate',
  [
    param('eventId').isUUID(),
    body('amount').isFloat({ min: 100, max: 50000 }),
    body('message').optional().trim().isLength({ max: 200 }),
  ],
  validateRequest,
  communityController.donateToEvent
);

// Community Moderation
router.post('/posts/:postId/report',
  [
    param('postId').isUUID(),
    body('reason').isIn(['spam', 'harassment', 'inappropriate', 'misinformation']),
    body('description').optional().trim().isLength({ max: 500 }),
  ],
  validateRequest,
  communityController.reportPost
);

router.post('/posts/:postId/hide',
  [param('postId').isUUID()],
  validateRequest,
  communityController.hidePost
);

// Community Analytics
router.get('/analytics/overview',
  communityController.getCommunityAnalytics
);

router.get('/analytics/engagement',
  [
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601(),
  ],
  validateRequest,
  communityController.getEngagementMetrics
);

export default router;