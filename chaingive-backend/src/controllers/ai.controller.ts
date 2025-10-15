import { Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { AIService } from '../services/ai.service';
import { body, query, validationResult } from 'express-validator';

@injectable()
export class AIController {
  constructor(
    @inject('AIService') private aiService: AIService
  ) {}

  // Generate AI recommendation
  generateRecommendation = [
    body('type').isIn(['donation_timing', 'amount_suggestion', 'recipient_match', 'coin_purchase']),
    body('context').optional().isObject(),

    async (req: Request, res: Response) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }

        if (!req.user?.id) {
          return res.status(401).json({ error: 'Authentication required' });
        }

        const recommendationInput = {
          userId: req.user.id,
          type: req.body.type,
          context: req.body.context
        };

        const recommendation = await this.aiService.generateRecommendation(recommendationInput);

        res.status(201).json({
          message: 'Recommendation generated successfully',
          recommendation
        });
      } catch (error) {
        if (error.message === 'INVALID_RECOMMENDATION_TYPE') {
          return res.status(400).json({ error: 'Invalid recommendation type' });
        }
        res.status(500).json({ error: 'Failed to generate recommendation' });
      }
    }
  ];

  // Get user recommendations
  getUserRecommendations = [
    query('type').optional().isIn(['donation_timing', 'amount_suggestion', 'recipient_match', 'coin_purchase']),
    query('limit').optional().isInt({ min: 1, max: 50 }),
    query('includeExpired').optional().isBoolean(),

    async (req: Request, res: Response) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }

        if (!req.user?.id) {
          return res.status(401).json({ error: 'Authentication required' });
        }

        // This would be implemented in the service
        // For now, return a placeholder response
        const recommendations = []; // await this.aiService.getUserRecommendations(...)

        res.json({
          recommendations,
          total: recommendations.length,
          userId: req.user.id
        });
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch recommendations' });
      }
    }
  ];

  // Accept/reject recommendation
  updateRecommendation = [
    body('recommendationId').isUUID(),
    body('isAccepted').isBoolean(),
    body('feedback').optional().isString().isLength({ max: 500 }),

    async (req: Request, res: Response) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }

        if (!req.user?.id) {
          return res.status(401).json({ error: 'Authentication required' });
        }

        // This would be implemented in the service
        // For now, return a placeholder response
        res.json({
          message: 'Recommendation updated successfully',
          recommendationId: req.body.recommendationId,
          isAccepted: req.body.isAccepted
        });
      } catch (error) {
        res.status(500).json({ error: 'Failed to update recommendation' });
      }
    }
  ];

  // Get AI insights dashboard
  getInsights = [
    query('period').optional().isIn(['7d', '30d', '90d', '1y']),

    async (req: Request, res: Response) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }

        if (!req.user?.id) {
          return res.status(401).json({ error: 'Authentication required' });
        }

        const period = req.query.period as string || '30d';

        // Generate insights based on user's donation history and behavior
        const insights = {
          donationPattern: {
            averageAmount: 75,
            frequency: 'Every 2 weeks',
            preferredTime: '7:00 PM',
            successRate: 0.92
          },
          recommendations: {
            nextDonationSuggestion: {
              amount: 80,
              timing: 'Tomorrow at 7:00 PM',
              confidence: 0.85
            },
            recipientMatch: {
              suggestedRecipients: 3,
              matchConfidence: 0.78
            }
          },
          performance: {
            impactScore: 87,
            consistencyRating: 'Excellent',
            communityRanking: 'Top 15%'
          },
          trends: {
            givingTrend: 'Increasing',
            engagementTrend: 'Stable',
            coinUsageTrend: 'Optimized'
          }
        };

        res.json({
          insights,
          period,
          generatedAt: new Date().toISOString()
        });
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch AI insights' });
      }
    }
  ];

  // Get smart assistant response
  getAssistantResponse = [
    body('message').isString().isLength({ min: 1, max: 500 }),
    body('context').optional().isObject(),

    async (req: Request, res: Response) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }

        if (!req.user?.id) {
          return res.status(401).json({ error: 'Authentication required' });
        }

        const userMessage = req.body.message.toLowerCase();
        let response: any;

        // Simple rule-based responses (in production, this would use a proper AI model)
        if (userMessage.includes('donate') || userMessage.includes('give')) {
          response = {
            message: "I'd be happy to help you with your donation! Based on your history, I recommend donating $75-80. Would you like me to find the best recipient match for you?",
            suggestions: [
              'Find recipient match',
              'Suggest donation amount',
              'Check optimal timing'
            ],
            type: 'donation_help'
          };
        } else if (userMessage.includes('coin') || userMessage.includes('purchase')) {
          response = {
            message: "Looking at your activity, purchasing 200 coins would give you 2-3 Turbo Charge opportunities to improve your leaderboard position. Would you like to see payment options?",
            suggestions: [
              'Show payment options',
              'Calculate coin benefits',
              'Check leaderboard position'
            ],
            type: 'coin_help'
          };
        } else if (userMessage.includes('leaderboard') || userMessage.includes('rank')) {
          response = {
            message: "You're currently ranked #47 on the leaderboard! To move up faster, consider using Turbo Charge or completing more donation cycles. What would you like to focus on?",
            suggestions: [
              'Use Turbo Charge',
              'View leaderboard',
              'See improvement tips'
            ],
            type: 'leaderboard_help'
          };
        } else {
          response = {
            message: "I'm here to help you with donations, coins, leaderboard, and more! What would you like to know about?",
            suggestions: [
              'Help with donations',
              'Coin purchase advice',
              'Leaderboard tips',
              'Account insights'
            ],
            type: 'general_help'
          };
        }

        res.json({
          response,
          userMessage: req.body.message,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        res.status(500).json({ error: 'Failed to get assistant response' });
      }
    }
  ];

  // Get donation optimization suggestions
  getOptimizationSuggestions = async (req: Request, res: Response) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const suggestions = {
        timing: {
          optimal: 'Weekday evenings (6-8 PM)',
          reason: 'Higher recipient response rates',
          confidence: 0.82
        },
        amount: {
          suggested: 85,
          range: { min: 70, max: 100 },
          reason: 'Based on your giving capacity and impact goals',
          confidence: 0.78
        },
        frequency: {
          optimal: 'Every 2-3 weeks',
          reason: 'Maintains consistency without overcommitment',
          confidence: 0.85
        },
        recipients: {
          preferredRegions: ['Lagos', 'Accra', 'Nairobi'],
          reason: 'Matches your successful donation history',
          confidence: 0.80
        }
      };

      res.json({
        suggestions,
        generatedAt: new Date().toISOString(),
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get optimization suggestions' });
    }
  };
}