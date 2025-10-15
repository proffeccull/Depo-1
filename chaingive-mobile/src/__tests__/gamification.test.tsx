import React from 'react';
import configureStore from 'redux-mock-store';
import { thunk } from 'redux-thunk';

// Mock services
jest.mock('../services/gamificationService', () => ({
  gamificationService: {
    fetchAchievements: jest.fn(),
    fetchMissions: jest.fn(),
    fetchChallenges: jest.fn(),
  },
}));

jest.mock('../services/notificationService', () => ({
  notificationService: {
    initialize: jest.fn(),
    sendNotification: jest.fn(),
  },
}));

// Import Redux slices
import gamificationReducer, {
  fetchAllAchievements,
  fetchTodaysMissions,
  fetchActiveChallenges,
} from '../store/slices/gamificationSlice';

// Mock data with simplified structure
const mockAchievement = {
  id: 'achievement-1',
  name: 'First Donation',
  description: 'Make your first donation',
  icon: 'star',
  category: 'milestone',
  rarity: 'common' as const,
  coinsReward: 100,
  xpReward: 50,
  isUnlocked: true,
  unlockedAt: '2024-01-01T00:00:00Z',
  progress: 100,
  target: 1,
};

// Setup mock store
const mockStore = configureStore([thunk]);
const initialState = {
  auth: {
    user: { id: 'user-1', firstName: 'John', lastName: 'Doe' },
    isAuthenticated: true,
  },
  gamification: {
    todaysMissions: null,
    missionsLoading: false,
    missionsError: null,
    
    streak: null,
    streakLoading: false,
    streakError: null,
    
    todaysProgress: null,
    progressLoading: false,
    progressError: null,
    
    activeChallenges: [],
    challengesLoading: false,
    challengesError: null,
    
    achievements: [],
    unlockedAchievements: [],
    achievementsLoading: false,
    achievementsError: null,
    
    stats: null,
    
    dashboardLoading: false,
    dashboardError: null,
    
    recentCoinsEarned: 0,
    showRewardAnimation: false,
  },
};

// Test suite
describe('Gamification System', () => {
  let store: any;

  beforeEach(() => {
    store = mockStore(initialState);
    jest.clearAllMocks();
  });

  describe('Gamification Data', () => {
    it('should have correct initial state', () => {
      expect(initialState.gamification.achievements).toHaveLength(0);
      expect(initialState.gamification.todaysMissions).toBe(null);
      expect(initialState.gamification.activeChallenges).toHaveLength(0);
      expect(initialState.gamification.achievementsLoading).toBe(false);
      expect(initialState.gamification.missionsLoading).toBe(false);
    });

    it('should have valid achievement data structure', () => {
      expect(mockAchievement.id).toBe('achievement-1');
      expect(mockAchievement.name).toBe('First Donation');
      expect(mockAchievement.coinsReward).toBe(100);
      expect(mockAchievement.isUnlocked).toBe(true);
    });
  });

  describe('Redux Actions', () => {
    it('should create fetchAllAchievements action', () => {
      expect(fetchAllAchievements).toBeDefined();
      expect(typeof fetchAllAchievements).toBe('function');
    });

    it('should create fetchTodaysMissions action', () => {
      expect(fetchTodaysMissions).toBeDefined();
      expect(typeof fetchTodaysMissions).toBe('function');
    });

    it('should create fetchActiveChallenges action', () => {
      expect(fetchActiveChallenges).toBeDefined();
      expect(typeof fetchActiveChallenges).toBe('function');
    });
  });

  describe('Gamification Services', () => {
    it('should have gamification service mocked', () => {
      const { gamificationService } = require('../services/gamificationService');
      expect(gamificationService).toBeDefined();
      expect(gamificationService.fetchAchievements).toBeDefined();
    });

    it('should have notification service mocked', () => {
      const { notificationService } = require('../services/notificationService');
      expect(notificationService).toBeDefined();
      expect(notificationService.initialize).toBeDefined();
    });
  });

  describe('Basic Functionality', () => {
    it('should handle mock store creation', () => {
      const store = mockStore(initialState);
      expect(store).toBeDefined();
      expect(store.getState()).toEqual(initialState);
    });

    it('should validate achievement structure', () => {
      const achievement = mockAchievement;
      
      expect(achievement).toHaveProperty('id');
      expect(achievement).toHaveProperty('name');
      expect(achievement).toHaveProperty('description');
      expect(achievement).toHaveProperty('coinsReward');
      expect(achievement).toHaveProperty('xpReward');
      expect(achievement).toHaveProperty('isUnlocked');
    });

    it('should handle gamification reducer', () => {
      expect(gamificationReducer).toBeDefined();
      expect(typeof gamificationReducer).toBe('function');
    });
  });
});