import { Router } from 'express';
import { auth } from '../middleware/auth';
import {
  createEvent,
  getEvents,
  getEvent,
  rsvpEvent,
  getEventRsvpStatus,
  updateEvent,
  cancelEvent,
  donateToEvent,
  getEventDonations,
} from '../controllers/community.controller';

const router = Router();

// All community routes require authentication
router.use(auth);

// Event management routes
router.post('/events', createEvent);
router.get('/events', getEvents);
router.get('/events/:id', getEvent);
router.put('/events/:id', updateEvent);
router.delete('/events/:id', cancelEvent);

// RSVP routes
router.post('/events/:id/rsvp', rsvpEvent);
router.get('/events/:id/rsvp', getEventRsvpStatus);

// Event donation routes
router.post('/events/:id/donate', donateToEvent);
router.get('/events/:id/donations', getEventDonations);

export default router;