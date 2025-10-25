import { Router } from 'express';
import { CommunityController } from '../controllers/community.controller';
import { auth } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { communityValidation } from '../validations/community.validation';

const router = Router();
const communityController = new CommunityController();

// All community routes require authentication
router.use(auth);

// Post management
router.post('/posts', validate(communityValidation.createPost), communityController.createPost);
router.get('/feed', communityController.getFeed);
router.post('/posts/:postId/like', communityController.likePost);
router.post('/posts/:postId/share', communityController.sharePost);
router.post('/posts/:postId/report', validate(communityValidation.reportPost), communityController.reportPost);

// Event management
router.post('/events', validate(communityValidation.createEvent), communityController.createEvent);
router.post('/events/:eventId/rsvp', validate(communityValidation.rsvpEvent), communityController.rsvpEvent);
router.get('/events/user', communityController.getUserEvents);

// Moderation (admin/moderator only)
router.post('/posts/:postId/moderate', validate(communityValidation.moderatePost), communityController.moderatePost);
router.get('/posts/pending', communityController.getPendingPosts);

export default router;