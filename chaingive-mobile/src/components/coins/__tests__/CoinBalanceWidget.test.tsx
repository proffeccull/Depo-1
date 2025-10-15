import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import CoinBalanceWidget from '../CoinBalanceWidget';

// Mock dependencies
jest.mock('react-native-vector-icons/MaterialIcons', () => 'Icon');
jest.mock('react-native-linear-gradient', () => 'LinearGradient');
jest.mock('expo-haptics', () => ({
  ImpactFeedbackStyle: { Light: 'light' },
  impactAsync: jest.fn(),
}));

const mockStore = configureStore([]);

describe('CoinBalanceWidget', () => {
  let store: any;

  beforeEach(() => {
    store = mockStore({
      auth: { user: { id: '1', charityCoins: 1250 } },
    });
  });

  const defaultProps = {
    balance: 1250,
    trend: 'up' as const,
    change24h: 150,
    animation: 'pulse' as const,
    size: 'medium' as const,
    showQuickActions: true,
    onQuickAction: jest.fn(),
  };

  it('renders correctly with balance', () => {
    render(
      <Provider store={store}>
        <CoinBalanceWidget {...defaultProps} />
      </Provider>
    );

    expect(screen.getByText('1,250')).toBeTruthy();
    expect(screen.getByText('+150 (24h)')).toBeTruthy();
  });

  it('shows quick actions when enabled', () => {
    render(
      <Provider store={store}>
        <CoinBalanceWidget {...defaultProps} />
      </Provider>
    );

    expect(screen.getByText('Buy')).toBeTruthy();
    expect(screen.getByText('Earn')).toBeTruthy();
    expect(screen.getByText('Spend')).toBeTruthy();
    expect(screen.getByText('History')).toBeTruthy();
  });

  it('calls onQuickAction when action pressed', () => {
    const mockOnQuickAction = jest.fn();

    render(
      <Provider store={store}>
        <CoinBalanceWidget
          {...defaultProps}
          onQuickAction={mockOnQuickAction}
        />
      </Provider>
    );

    const buyButton = screen.getByText('Buy');
    fireEvent.press(buyButton);

    expect(mockOnQuickAction).toHaveBeenCalledWith('buy');
  });

  it('displays different sizes correctly', () => {
    const { rerender } = render(
      <Provider store={store}>
        <CoinBalanceWidget {...defaultProps} size="small" />
      </Provider>
    );

    // Small size should render
    expect(screen.getByText('1,250')).toBeTruthy();

    rerender(
      <Provider store={store}>
        <CoinBalanceWidget {...defaultProps} size="large" />
      </Provider>
    );

    // Large size should render
    expect(screen.getByText('1,250')).toBeTruthy();
  });

  it('shows correct trend indicators', () => {
    const { rerender } = render(
      <Provider store={store}>
        <CoinBalanceWidget {...defaultProps} trend="up" />
      </Provider>
    );

    expect(screen.getByText('+150 (24h)')).toBeTruthy();

    rerender(
      <Provider store={store}>
        <CoinBalanceWidget {...defaultProps} trend="down" change24h={-50} />
      </Provider>
    );

    expect(screen.getByText('-50 (24h)')).toBeTruthy();
  });

  it('handles animation states', () => {
    render(
      <Provider store={store}>
        <CoinBalanceWidget {...defaultProps} animation="glow" />
      </Provider>
    );

    // Component should render without crashing with glow animation
    expect(screen.getByText('1,250')).toBeTruthy();
  });
});