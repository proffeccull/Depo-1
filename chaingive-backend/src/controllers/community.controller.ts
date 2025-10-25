import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';
import logger from '../utils/logger';

/**
 * Create a new community event
 */
export const createEvent = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
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

    // Validate required fields
    if (!title || !description || !eventDate || !eventTime || !location) {
      throw new AppError('Missing required fields', 400, 'MISSING_FIELDS');
    }

    // Check if user is verified agent or has permission to create events
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isVerified: true, userType: true }
    });

    if (!user?.isVerified && user?.userType !== 'agent') {
      throw new AppError('Only verified users and agents can create events', 403, 'INSUFFICIENT_PERMISSIONS');
    }

    const event = await prisma.communityEvent.create({
      data: {
        creatorId: userId,
        title,
        description,
        eventDate: new Date(eventDate),
        eventTime,
        location,
        maxAttendees: maxAttendees ? parseInt(maxAttendees) : null,
        eventType,
        fundraisingGoal: fundraisingGoal ? parseFloat(fundraisingGoal) : null,
      },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            trustScore: true,
          },
        },
        rsvps: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        _count: {
          select: { rsvps: true },
        },
      },
    });

    logger.info(`Community event created: ${event.id} by user ${userId}`);

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: { event },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all community events
 */
export const getEvents = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 20, status = 'active', eventType } = req.query;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const where: any = { status: status as string };
    if (eventType) {
      where.eventType = eventType as string;
    }

    const events = await prisma.communityEvent.findMany({
      where,
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            trustScore: true,
          },
        },
        rsvps: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        _count: {
          select: { rsvps: true },
        },
      },
      orderBy: { eventDate: 'asc' },
      skip,
      take: parseInt(limit as string),
    });

    const total = await prisma.communityEvent.count({ where });

    res.status(200).json({
      success: true,
      data: {
        events,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          pages: Math.ceil(total / parseInt(limit as string)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single event by ID
 */
export const getEvent = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const event = await prisma.communityEvent.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            trustScore: true,
          },
        },
        rsvps: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                trustScore: true,
              },
            },
          },
        },
        posts: {
          where: { status: 'approved' },
          include: {
            author: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        _count: {
          select: { rsvps: true },
        },
      },
    });

    if (!event) {
      throw new AppError('Event not found', 404, 'EVENT_NOT_FOUND');
    }

    res.status(200).json({
      success: true,
      data: { event },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * RSVP to an event
 */
export const rsvpEvent = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { status = 'attending' } = req.body;

    // Check if event exists and is active
    const event = await prisma.communityEvent.findUnique({
      where: { id },
      select: { id: true, status: true, maxAttendees: true, currentAttendees: true },
    });

    if (!event) {
      throw new AppError('Event not found', 404, 'EVENT_NOT_FOUND');
    }

    if (event.status !== 'active') {
      throw new AppError('Event is not active', 400, 'EVENT_NOT_ACTIVE');
    }

    // Check capacity if maxAttendees is set
    if (event.maxAttendees && status === 'attending') {
      const currentRsvps = await prisma.eventRSVP.count({
        where: { eventId: id, status: 'attending' },
      });

      if (currentRsvps >= event.maxAttendees) {
        throw new AppError('Event is at capacity', 400, 'EVENT_AT_CAPACITY');
      }
    }

    // Create or update RSVP
    const rsvp = await prisma.eventRSVP.upsert({
      where: {
        eventId_userId: {
          eventId: id,
          userId,
        },
      },
      update: {
        status,
        updatedAt: new Date(),
      },
      create: {
        eventId: id,
        userId,
        status,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        event: {
          select: {
            id: true,
            title: true,
            eventDate: true,
          },
        },
      },
    });

    // Update current attendees count
    const attendingCount = await prisma.eventRSVP.count({
      where: { eventId: id, status: 'attending' },
    });

    await prisma.communityEvent.update({
      where: { id },
      data: { currentAttendees: attendingCount },
    });

    logger.info(`User ${userId} RSVP'd to event ${id} with status: ${status}`);

    res.status(200).json({
      success: true,
      message: `RSVP ${status} successfully`,
      data: { rsvp },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's RSVP status for an event
 */
export const getEventRsvpStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const rsvp = await prisma.eventRSVP.findUnique({
      where: {
        eventId_userId: {
          eventId: id,
          userId,
        },
      },
    });

    res.status(200).json({
      success: true,
      data: {
        rsvpStatus: rsvp?.status || null,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update event (only by creator)
 */
export const updateEvent = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const updates = req.body;

    // Check if user is the creator
    const event = await prisma.communityEvent.findUnique({
      where: { id },
      select: { creatorId: true, status: true },
    });

    if (!event) {
      throw new AppError('Event not found', 404, 'EVENT_NOT_FOUND');
    }

    if (event.creatorId !== userId) {
      throw new AppError('Only event creator can update the event', 403, 'INSUFFICIENT_PERMISSIONS');
    }

    if (event.status !== 'active') {
      throw new AppError('Cannot update completed or cancelled events', 400, 'EVENT_NOT_UPDATABLE');
    }

    const updatedEvent = await prisma.communityEvent.update({
      where: { id },
      data: {
        ...updates,
        eventDate: updates.eventDate ? new Date(updates.eventDate) : undefined,
      },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    logger.info(`Event ${id} updated by creator ${userId}`);

    res.status(200).json({
      success: true,
      message: 'Event updated successfully',
      data: { event: updatedEvent },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel event (only by creator)
 */
export const cancelEvent = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    // Check if user is the creator
    const event = await prisma.communityEvent.findUnique({
      where: { id },
      select: { creatorId: true, status: true },
    });

    if (!event) {
      throw new AppError('Event not found', 404, 'EVENT_NOT_FOUND');
    }

    if (event.creatorId !== userId) {
      throw new AppError('Only event creator can cancel the event', 403, 'INSUFFICIENT_PERMISSIONS');
    }

    if (event.status !== 'active') {
      throw new AppError('Event is already cancelled or completed', 400, 'EVENT_NOT_CANCELLABLE');
    }

    const cancelledEvent = await prisma.communityEvent.update({
      where: { id },
      data: { status: 'cancelled' },
    });

    logger.info(`Event ${id} cancelled by creator ${userId}`);

    res.status(200).json({
      success: true,
      message: 'Event cancelled successfully',
      data: { event: cancelledEvent },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Donate to an event fundraising goal
 */
export const donateToEvent = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { amount, message } = req.body;

    if (!amount || amount <= 0) {
      throw new AppError('Valid donation amount is required', 400, 'INVALID_AMOUNT');
    }

    // Check if event exists and has fundraising goal
    const event = await prisma.communityEvent.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        status: true,
        fundraisingGoal: true,
        creatorId: true,
        eventType: true
      },
    });

    if (!event) {
      throw new AppError('Event not found', 404, 'EVENT_NOT_FOUND');
    }

    if (event.status !== 'active') {
      throw new AppError('Event is not active', 400, 'EVENT_NOT_ACTIVE');
    }

    if (event.eventType !== 'fundraising' || !event.fundraisingGoal) {
      throw new AppError('This event does not accept donations', 400, 'EVENT_NOT_FUNDRAISING');
    }

    // Check user's wallet balance
    const userWallet = await prisma.wallet.findUnique({
      where: { userId },
      select: { balance: true },
    });

    if (!userWallet || userWallet.balance < amount) {
      throw new AppError('Insufficient wallet balance', 400, 'INSUFFICIENT_BALANCE');
    }

    // Create donation cycle linked to the event
    const donationCycle = await prisma.cycle.create({
      data: {
        userId,
        amount,
        category: 'event_fundraising',
        message: message || `Donation to event: ${event.title}`,
        status: 'fulfilled', // Direct donation, no matching needed
        receivedAt: new Date(),
        eventId: id, // Link to the event
      },
    });

    // Deduct from user's wallet
    await prisma.wallet.update({
      where: { userId },
      data: {
        balance: {
          decrement: amount,
        },
      },
    });

    // Create transaction record
    await prisma.transaction.create({
      data: {
        fromUserId: userId,
        amount,
        type: 'event_donation',
        status: 'completed',
        description: `Donation to event: ${event.title}`,
        metadata: {
          eventId: id,
          cycleId: donationCycle.id,
        },
      },
    });

    // Award charity coins for donation
    const coinsEarned = Math.floor(amount / 100); // 1 coin per ₦100 donated
    if (coinsEarned > 0) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          charityCoins: {
            increment: coinsEarned,
          },
        },
      });
    }

    logger.info(`User ${userId} donated ₦${amount} to event ${id}, earned ${coinsEarned} coins`);

    res.status(200).json({
      success: true,
      message: `Donation of ₦${amount} successful! You earned ${coinsEarned} Charity Coins.`,
      data: {
        donation: donationCycle,
        coinsEarned,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get event donations/fundraising progress
 */
export const getEventDonations = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    // Check if event exists and is fundraising
    const event = await prisma.communityEvent.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        fundraisingGoal: true,
        eventType: true,
        status: true
      },
    });

    if (!event) {
      throw new AppError('Event not found', 404, 'EVENT_NOT_FOUND');
    }

    if (event.eventType !== 'fundraising' || !event.fundraisingGoal) {
      throw new AppError('This event does not have fundraising', 400, 'NOT_FUNDRAISING_EVENT');
    }

    // Get donations linked to this event
    const donations = await prisma.cycle.findMany({
      where: {
        eventId: id,
        status: 'fulfilled',
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            trustScore: true,
          },
        },
      },
      orderBy: { receivedAt: 'desc' },
      skip,
      take: parseInt(limit as string),
    });

    const totalDonations = await prisma.cycle.count({
      where: {
        eventId: id,
        status: 'fulfilled',
      },
    });

    // Calculate total raised
    const totalRaised = donations.reduce((sum, donation) => sum + donation.amount, 0);

    res.status(200).json({
      success: true,
      data: {
        event: {
          id: event.id,
          title: event.title,
          fundraisingGoal: event.fundraisingGoal,
          totalRaised,
          progressPercentage: Math.min((totalRaised / event.fundraisingGoal) * 100, 100),
        },
        donations,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total: totalDonations,
          pages: Math.ceil(totalDonations / parseInt(limit as string)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};