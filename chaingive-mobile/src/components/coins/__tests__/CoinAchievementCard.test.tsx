import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import CoinAchievementCard from '../CoinAchievementCard';

// Mock dependencies
jest.mock('react-native-vector-icons/MaterialIcons', () => 'Icon');
jest.mock('react-native-linear-gradient', () => 'LinearGradient');
jest.mock('expo-haptics', () => ({
  ImpactFeedbackStyle: { Medium: 'medium' },
  impactAsync: jest.fn(),
}));

const mockStore = configureStore([]);

describe('CoinAchievementCard', () => {
  let store: any;

  beforeEach(() => {
    store = mockStore({
      auth: { user: { id: '1' } },
    });
  });

  const defaultProps = {
    id: 'achievement-1',
    name: 'Generous Heart',
    description: 'Donate to 10 different causes',
    rarity: 'epic' as const,
    coinReward: 5000,
    serialNumber: 1234,
    totalSupply: 10000,
    unlockedAt: new Date('2024-01-01'),
    canMintNFT: true,
    mintCost: 100,
    isTradeable: true,
    marketValue: 7500,
    glowColor: '#9932CC',
    animationType: 'shimmer',
    unlocked: true,
    onPress: jest.fn(),
    onMintNFT: jest.fn(),
    onTrade: jest.fn(),
  };

  it('renders correctly with achievement data', () => {
    render(
      <Provider store={store}>
        <CoinAchievementCard {...defaultProps} />
      </Provider>
    );

    expect(screen.getByText('Generous Heart')).toBeTruthy();
    expect(screen.getByText('Donate to 10 different causes')).toBeTruthy();
    expect(screen.getByText('EPIC')).toBeTruthy();
    expect(screen.getByText('+#00001234')).toBeTruthy();
    expect(screen.getByText('+5,000')).toBeTruthy();
  });

  it('shows different rarity styles', () => {
    const { rerender } = render(
      <Provider store={store}>
        <CoinAchievementCard {...defaultProps} rarity="common" />
      </Provider>
    );

    expect(screen.getByText('COMMON')).toBeTruthy();

    rerender(
      <Provider store={store}>
        <CoinAchievementCard {...defaultProps} rarity="legendary" />
      </Provider>
    );

    expect(screen.getByText('LEGENDARY')).toBeTruthy();
  });

  it('displays NFT minting option when available', () => {
    render(
      <Provider store={store}>
        <CoinAchievementCard {...defaultProps} />
      </Provider>
    );

    expect(screen.getByText('Mint NFT (100 coins)')).toBeTruthy();
  });

  it('shows trading option when tradeable', () => {
    render(
      <Provider store={store}>
        <CoinAchievementCard {...defaultProps} />
      </Provider>
    );

    expect(screen.getByText('Trade (Worth 7,500 coins)')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const mockOnPress = jest.fn();

    render(
      <Provider store={store}>
        <CoinAchievementCard {...defaultProps} onPress={mockOnPress} />
      </Provider>
    );

    const card = screen.getByText('Generous Heart');
    fireEvent.press(card);

    expect(mockOnPress).toHaveBeenCalled();
  });

  it('calls onMintNFT when mint button pressed', () => {
    const mockOnMintNFT = jest.fn();

    render(
      <Provider store={store}>
        <CoinAchievementCard {...defaultProps} onMintNFT={mockOnMintNFT} />
      </Provider>
    );

    const mintButton = screen.getByText('Mint NFT (100 coins)');
    fireEvent.press(mintButton);

    expect(mockOnMintNFT).toHaveBeenCalled();
  });

  it('displays unlocked timestamp', () => {
    render(
      <Provider store={store}>
        <CoinAchievementCard {...defaultProps} unlocked={true} />
      </Provider>
    );

    expect(screen.getByText(/Unlocked/)).toBeTruthy();
  });

  it('handles locked state', () => {
    render(
      <Provider store={store}>
        <CoinAchievementCard {...defaultProps} unlocked={false} />
      </Provider>
    );

    // Should still render but with locked styling
    expect(screen.getByText('Generous Heart')).toBeTruthy();
  });

  it('displays correct coin reward formatting', () => {
    render(
      <Provider store={store}>
        <CoinAchievementCard {...defaultProps} coinReward={1000000} />
      </Provider>
    );

    expect(screen.getByText('+1,000,000')).toBeTruthy();
  });
});