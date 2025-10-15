import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { useCoinSystem } from '../useCoinSystem';

// Mock dependencies
jest.mock('../components/coins', () => ({
  coinSounds: {
    playCoinEarn: jest.fn(),
    playCoinSpend: jest.fn(),
    playCoinPurchase: jest.fn(),
    playAchievementUnlock: jest.fn(),
  },
}));

jest.mock('../../services/coinApi', () => ({
  coinWebSocket: {
    connect: jest.fn(),
    disconnect: jest.fn(),
    send: jest.fn(),
  },
}));

const mockStore = configureStore([]);

describe('useCoinSystem', () => {
  let store: any;

  beforeEach(() => {
    store = mockStore({
      coin: {
        balance: {
          current: 1000,
          trend: 'up',
          change24h: 50,
          lastUpdated: new Date().toISOString(),
        },
        transactions: [],
        achievements: [],
        battlePass: null,
        loading: false,
        error: null,
      },
      analytics: {
        analytics: {},
      },
    });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );

  it('initializes with default state', () => {
    const { result } = renderHook(() => useCoinSystem('user-1'), { wrapper });

    expect(result.current.balance).toEqual({
      current: 1000,
      trend: 'up',
      change24h: 50,
      lastUpdated: expect.any(String),
    });
    expect(result.current.transactions).toEqual([]);
    expect(result.current.loading).toBe(false);
  });

  it('formats coin amounts correctly', () => {
    const { result } = renderHook(() => useCoinSystem('user-1'), { wrapper });

    expect(result.current.formatCoinAmount(1000)).toBe('1,000');
    expect(result.current.formatCoinAmount(1000000)).toBe('1,000,000');
  });

  it('calculates trends correctly', () => {
    const { result } = renderHook(() => useCoinSystem('user-1'), { wrapper });

    expect(result.current.calculateTrend(100, 90)).toBe('up');
    expect(result.current.calculateTrend(90, 100)).toBe('down');
    expect(result.current.calculateTrend(100, 99)).toBe('stable');
  });

  it('returns achievement progress', () => {
    const { result } = renderHook(() => useCoinSystem('user-1'), { wrapper });

    // Should return 0 for non-existent achievement
    expect(result.current.getAchievementProgress('non-existent')).toBe(0);
  });

  it('handles earnCoins action', async () => {
    const mockDispatch = jest.fn();
    store.dispatch = mockDispatch;

    const { result } = renderHook(() => useCoinSystem('user-1'), { wrapper });

    await act(async () => {
      await result.current.earnCoinsAction(100, 'donation', 'Test donation');
    });

    expect(mockDispatch).toHaveBeenCalled();
  });

  it('handles spendCoins action', async () => {
    const mockDispatch = jest.fn();
    store.dispatch = mockDispatch;

    const { result } = renderHook(() => useCoinSystem('user-1'), { wrapper });

    await act(async () => {
      await result.current.spendCoinsAction(50, 'marketplace', 'Test purchase');
    });

    expect(mockDispatch).toHaveBeenCalled();
  });

  it('handles purchaseCoins action', async () => {
    const mockDispatch = jest.fn();
    store.dispatch = mockDispatch;

    const { result } = renderHook(() => useCoinSystem('user-1'), { wrapper });

    await act(async () => {
      await result.current.purchaseCoinsAction('agent-1', 100);
    });

    expect(mockDispatch).toHaveBeenCalled();
  });

  it('handles unlockAchievement action', async () => {
    const mockDispatch = jest.fn();
    store.dispatch = mockDispatch;

    const { result } = renderHook(() => useCoinSystem('user-1'), { wrapper });

    await act(async () => {
      await result.current.unlockAchievementAction('achievement-1');
    });

    expect(mockDispatch).toHaveBeenCalled();
  });

  it('handles purchaseBattlePass action', async () => {
    const mockDispatch = jest.fn();
    store.dispatch = mockDispatch;

    const { result } = renderHook(() => useCoinSystem('user-1'), { wrapper });

    await act(async () => {
      await result.current.purchaseBattlePassAction('season-1');
    });

    expect(mockDispatch).toHaveBeenCalled();
  });

  it('tracks user events', async () => {
    const mockDispatch = jest.fn();
    store.dispatch = mockDispatch;

    const { result } = renderHook(() => useCoinSystem('user-1'), { wrapper });

    await act(async () => {
      await result.current.trackUserEvent('button_click', { button: 'earn_coins' });
    });

    expect(mockDispatch).toHaveBeenCalled();
  });

  it('handles null userId gracefully', () => {
    const { result } = renderHook(() => useCoinSystem(null), { wrapper });

    expect(result.current.balance).toEqual({
      current: 1000,
      trend: 'up',
      change24h: 50,
      lastUpdated: expect.any(String),
    });
  });

  it('disables analytics when configured', () => {
    const { result } = renderHook(
      () => useCoinSystem('user-1', { enableAnalytics: false }),
      { wrapper }
    );

    // Should still work but without analytics calls
    expect(result.current.trackUserEvent).toBeDefined();
  });

  it('disables WebSocket when configured', () => {
    const { result } = renderHook(
      () => useCoinSystem('user-1', { enableWebSocket: false }),
      { wrapper }
    );

    // Should still work but without WebSocket connection
    expect(result.current.balance).toBeDefined();
  });
});