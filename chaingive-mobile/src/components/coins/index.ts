// Coin Component Library - Premium UI/UX Enhancements
// Export all coin-related components for easy importing

export { default as CoinBalanceWidget } from './CoinBalanceWidget';
export { default as CoinAchievementCard } from './CoinAchievementCard';
export { default as CoinFOMOBanner } from './CoinFOMOBanner';
export { default as CoinEarningAnimation } from './CoinEarningAnimation';
export { default as CoinMilestoneWidget } from './CoinMilestoneWidget';
export { default as RealTimeActivityFeed } from './RealTimeActivityFeed';
export { default as CoinParticleSystem } from './CoinParticleSystem';
export { default as CoinSoundEffects, coinSounds } from './CoinSoundEffects';
export { default as CoinBattlePass } from './CoinBattlePass';
export { default as CoinLeaderboard } from './CoinLeaderboard';
export { default as CoinMarketplaceWidget } from './CoinMarketplaceWidget';
export { default as CoinStreakWidget } from './CoinStreakWidget';
export { default as CoinCelebrationModal } from './CoinCelebrationModal';
export { default as CoinAnalytics } from './CoinAnalytics';

// Utility exports
// export { coinMilestones } from './CoinMilestoneWidget';
// export { scarcityTriggers } from './CoinMarketplaceWidget';

// Constants and configurations
export const COIN_SYSTEM_CONFIG = {
  version: '2.0.0',
  features: [
    'balance_widget',
    'achievement_cards',
    'fomo_engine',
    'particle_systems',
    'sound_effects',
    'battle_pass',
    'leaderboard',
    'analytics',
    'marketplace',
    'social_proof',
    'urgency_timers',
    'theme_provider',
  ],
  psychology: {
    scarcity: true,
    social_proof: true,
    loss_aversion: true,
    endowment_effect: true,
    variable_rewards: true,
    achievement_unlocks: true,
  },
  animations: {
    entrance: true,
    transitions: true,
    celebrations: true,
    micro_interactions: true,
    loading_states: true,
  },
};

// Performance monitoring
export const COIN_PERFORMANCE_METRICS = {
  component_load_times: true,
  animation_frame_rates: true,
  memory_usage: true,
  network_requests: true,
  user_interactions: true,
};

// Accessibility features
export const COIN_ACCESSIBILITY_FEATURES = {
  screen_reader_support: true,
  haptic_feedback: true,
  high_contrast_mode: true,
  reduced_motion: true,
  voice_commands: false, // Future feature
};

// Export everything as a single object for convenience
const CoinComponents = {
  // Core Components
  CoinBalanceWidget,
  CoinAchievementCard,
  CoinFOMOBanner,
  CoinEarningAnimation,
  CoinMilestoneWidget,

  // Advanced Features
  RealTimeActivityFeed,
  CoinParticleSystem,
  CoinSoundEffects,
  CoinBattlePass,
  CoinLeaderboard,
  CoinMarketplaceWidget,

  // UI Elements
  CoinStreakWidget,
  CoinCelebrationModal,

  // System Components
  CoinAnalytics,

  // Utilities
  coinSounds,

  // Configuration
  COIN_SYSTEM_CONFIG,
  COIN_PERFORMANCE_METRICS,
  COIN_ACCESSIBILITY_FEATURES,
};

export default CoinComponents;

// Named exports for tree-shaking
export * from './CoinBalanceWidget';
export * from './CoinAchievementCard';
export * from './CoinFOMOBanner';
export * from './CoinEarningAnimation';
export * from './CoinMilestoneWidget';
export * from './RealTimeActivityFeed';
export * from './CoinParticleSystem';
export * from './CoinSoundEffects';
export * from './CoinBattlePass';
export * from './CoinLeaderboard';
export * from './CoinMarketplaceWidget';
export * from './CoinStreakWidget';
export * from './CoinCelebrationModal';
export * from './CoinAnalytics';