import { findBestMatch } from '../src/services/matching.service';
import { predictMatchScore } from '../src/services/ml-matching.service';
import prisma from '../src/utils/prisma';

// Mock the ML service
jest.mock('../src/services/ml-matching.service', () => ({
  predictMatchScore: jest.fn(),
}));

// Mock Prisma
jest.mock('../src/utils/prisma', () => ({
  __esModule: true,
  default: {
    user: {
      findMany: jest.fn(),
    },
    match: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  },
}));

describe('AI Matching Algorithm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findBestMatch', () => {
    it('should return null when no candidates found', async () => {
      (prisma.user.findMany as jest.Mock).mockResolvedValue([]);

      const result = await findBestMatch('donor-id', 5000);

      expect(result).toBeNull();
    });

    it('should score candidates using AI model when available', async () => {
      const mockCandidates = [
        {
          id: 'candidate-1',
          trustScore: 0.8,
          locationCity: 'Lagos',
          createdAt: new Date(),
          cycles: [],
          qualification: { completedCycles: 5 },
        },
      ];

      (prisma.user.findMany as jest.Mock).mockResolvedValue(mockCandidates);
      (predictMatchScore as jest.Mock).mockResolvedValue(0.85);

      const result = await findBestMatch('donor-id', 5000);

      expect(predictMatchScore).toHaveBeenCalledWith(
        expect.objectContaining({
          trustScore: 0.8,
          locationProximity: 1,
          completedCycles: 5,
        }),
        5000
      );
      expect(result).toBeDefined();
    });

    it('should fallback to rule-based scoring when AI fails', async () => {
      const mockCandidates = [
        {
          id: 'candidate-1',
          trustScore: 0.8,
          locationCity: 'Lagos',
          createdAt: new Date(),
          cycles: [],
          qualification: { completedCycles: 5 },
        },
      ];

      (prisma.user.findMany as jest.Mock).mockResolvedValue(mockCandidates);
      (predictMatchScore as jest.Mock).mockRejectedValue(new Error('AI service unavailable'));

      const result = await findBestMatch('donor-id', 5000);

      expect(result).toBeDefined();
      expect(result?.score).toBeGreaterThan(0);
    });

    it('should prioritize candidates by score', async () => {
      const mockCandidates = [
        {
          id: 'candidate-1',
          trustScore: 0.5,
          locationCity: 'Lagos',
          createdAt: new Date(),
          cycles: [],
          qualification: { completedCycles: 2 },
        },
        {
          id: 'candidate-2',
          trustScore: 0.9,
          locationCity: 'Lagos',
          createdAt: new Date(),
          cycles: [],
          qualification: { completedCycles: 8 },
        },
      ];

      (prisma.user.findMany as jest.Mock).mockResolvedValue(mockCandidates);
      (predictMatchScore as jest.Mock)
        .mockResolvedValueOnce(0.6)  // Lower score for first candidate
        .mockResolvedValueOnce(0.9); // Higher score for second candidate

      const result = await findBestMatch('donor-id', 5000);

      expect(result?.id).toBe('candidate-2');
      expect(result?.score).toBe(0.9);
    });
  });

  describe('Scoring Algorithm', () => {
    it('should calculate location proximity correctly', async () => {
      const mockCandidates = [
        {
          id: 'candidate-1',
          trustScore: 0.8,
          locationCity: 'Lagos',
          createdAt: new Date(),
          cycles: [],
          qualification: { completedCycles: 5 },
        },
      ];

      (prisma.user.findMany as jest.Mock).mockResolvedValue(mockCandidates);
      (predictMatchScore as jest.Mock).mockResolvedValue(0.85);

      await findBestMatch('donor-id', 5000, { location: 'Lagos' });

      expect(predictMatchScore).toHaveBeenCalledWith(
        expect.objectContaining({
          locationProximity: 1, // Same location
        }),
        5000
      );
    });

    it('should calculate time waiting correctly', async () => {
      const fiveDaysAgo = new Date();
      fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

      const mockCandidates = [
        {
          id: 'candidate-1',
          trustScore: 0.8,
          locationCity: 'Lagos',
          createdAt: new Date(),
          cycles: [{ createdAt: fiveDaysAgo }],
          qualification: { completedCycles: 5 },
        },
      ];

      (prisma.user.findMany as jest.Mock).mockResolvedValue(mockCandidates);
      (predictMatchScore as jest.Mock).mockResolvedValue(0.85);

      await findBestMatch('donor-id', 5000);

      expect(predictMatchScore).toHaveBeenCalledWith(
        expect.objectContaining({
          timeWaiting: 5, // 5 days waiting
        }),
        5000
      );
    });
  });
});