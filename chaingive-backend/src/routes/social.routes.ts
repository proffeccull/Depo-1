import { Router } from 'express';
import { SocialController } from '../controllers/social.controller';
import { auth } from '../middleware/auth';

const router = Router();
const socialController = new SocialController();

// All social routes require authentication
router.use(auth);

// Circles
router.post('/circles', socialController.createCircle);
router.get('/circles', socialController.getUserCircles);
router.post('/circles/:circleId/join', socialController.joinCircle);
router.post('/circles/:circleId/leave', socialController.leaveCircle);

// Posts
router.post('/posts', socialController.createPost);
router.get('/feed', socialController.getFeed);
router.post('/posts/:postId/like', socialController.likePost);
router.delete('/posts/:postId/like', socialController.unlikePost);
router.post('/posts/:postId/comments', socialController.addComment);
router.get('/posts/:postId/comments', socialController.getPostComments);
router.post('/posts/:postId/share', socialController.sharePost);

// Trending & Search
router.get('/trending', socialController.getTrendingPosts);
router.get('/search', socialController.search);

export default router;