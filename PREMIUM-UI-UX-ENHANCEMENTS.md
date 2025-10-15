# 🎯 ChainGive Premium UI/UX Enhancement Plan (REVISED)
## Coin-Powered Philanthropic Experience - Triggering the Philanthropist in Everyone

---

## 🌟 **CORE PHILOSOPHY**
*"Make giving feel like winning, spending coins feel like investing in humanity"*

Every interaction should make users feel:
- 🏆 **Accomplished** - Visual rewards for every coin spent and earned
- 🔥 **Urgent** - FOMO triggers for coin opportunities
- 💎 **Special** - Premium, exclusive coin-gated experiences
- 🎨 **Delighted** - Beautiful, smooth animations
- 👥 **Connected** - Part of a coin-powered community
- 💰 **Wealthy** - Coin balance feels valuable and growing

---

## 💰 **COIN-CENTRIC DESIGN PRINCIPLES**

### **1. Coin Visibility Everywhere**
```typescript
// Every screen should show:
- Current coin balance (top right, always visible)
- Coin earning opportunities (highlighted)
- Coin spending options (clear pricing)
- Coin transaction history (easy access)
- Coin value indicators (₦1 = 1 coin)
```

### **2. Coin Animation System**
```typescript
// Coin interactions should be delightful:
- Earning coins: ✨ Sparkle + fly to balance
- Spending coins: 💸 Smooth deduction animation
- Low balance: ⚠️ Gentle warning glow
- Milestone reached: 🎊 Celebration burst
- Coin purchase: 💰 Coin rain effect
```

### **3. Coin Psychology**
```typescript
// Make coins feel valuable:
- Show coin value in Naira (₦)
- Display earning potential
- Highlight savings from coins
- Show coin growth over time
- Celebrate coin milestones
```

---

## 🎨 **1. NFT-LIKE ACHIEVEMENT CARDS**

### **Visual Design**
- ✨ Holographic gradient backgrounds
- 🌈 Animated shimmer effects
- 💫 Particle systems on unlock
- 🎭 3D card flip animations
- 🖼️ Collectible card gallery view
- 💰 **Coin value displayed** on each card

### **Rarity System with Coin Rewards**
```
🟢 Common (70%) - Green glow - 10-50 coins
🔵 Rare (20%) - Blue glow - 100-500 coins
🟣 Epic (8%) - Purple glow - 1,000-5,000 coins
🟠 Legendary (2%) - Orange glow - 10,000-50,000 coins
⭐ Mythic (0.1%) - Rainbow animated - 100,000+ coins
```

### **Card Features**
- Serial numbers (#0001/10000)
- Unlock timestamps
- **Coin reward amount** (prominently displayed)
- Progress bars to next tier
- Share as image (social proof)
- **Mint as NFT option** (100 coins)
- Animated unlock ceremony
- Sound effects on reveal
- **Tradeable for coins** in marketplace

### **Achievement Card Components**
```typescript
interface AchievementCard {
  id: string;
  name: string;
  description: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
  coinReward: number; // Coins earned
  serialNumber: number;
  totalSupply: number;
  unlockedAt: Date;
  canMintNFT: boolean;
  mintCost: 100; // coins
  isTradeable: boolean;
  marketValue: number; // coins
  glowColor: string;
  animationType: string;
}
```

---

## 🔥 **2. BUILT-IN FOMO ENGINE**

### **Real-Time Activity Feed**
```
"🎉 Sarah just earned 500 coins from a donation!"
"🏆 Michael unlocked 'Generous Heart' worth 1,000 coins!"
"💎 3 people bought Premium with coins in the last hour"
"⚡ Only 2 spots left in today's 10,000 coin challenge!"
"💰 Agent John just restocked 50,000 coins!"
```

### **Coin-Focused Urgency Triggers**
- ⏰ **Time-Limited Coin Opportunities**
  - "Earn 2x coins in next 30 mins!"
  - "Flash sale: Premium 50% off (1,000 coins)!"
  - "Bonus 500 coins if you donate now!"
  - Countdown timers everywhere
  
- 📊 **Coin Scarcity Indicators**
  - "Only 5,000 coins left in agent inventory"
  - "Last chance to earn this 10,000 coin achievement"
  - "3/10 people claimed this 5,000 coin reward"
  - "Agent running low on coins!"
  
- 🎯 **Coin Social Proof**
  - "1,247 people earned coins today"
  - "Your friends earned 15,000 coins this week"
  - "Top 10% of coin earners this month"
  - "Average user has 8,500 coins"

### **Coin Streak System**
- 🔥 Daily giving streak counter
- 💪 Streak freeze power-ups (50 coins)
- 🎁 Milestone rewards (500, 1,000, 5,000 coins)
- 📈 Streak leaderboard with coin prizes
- 💔 "Don't break your 47-day streak! Earn 2,000 coins today!"

### **Coin Milestone Celebrations**
```typescript
const coinMilestones = {
  1000: { message: "First 1K coins! 🎉", bonus: 100 },
  5000: { message: "5K Club! 💎", bonus: 500 },
  10000: { message: "10K Achiever! 🏆", bonus: 1000 },
  50000: { message: "Coin Master! 👑", bonus: 5000 },
  100000: { message: "Coin Legend! ⭐", bonus: 10000 },
};
```

---

## 💎 **3. PREMIUM UI/UX ENHANCEMENTS**

### **A. Coin-Aware Micro-Interactions**
- 💫 Button press animations (scale + haptic + coin sound)
- 🌊 Liquid swipe gestures with coin trails
- ✨ Particle trails on scroll (coins floating)
- 🎨 Color transitions on coin balance changes
- 🔊 Satisfying coin clink sounds
- 💰 Coin counter animations (rolling numbers)

### **B. Coin Celebration Moments**
- 🎊 Confetti + coins on donation complete
- 🎆 Fireworks + coin rain on cycle completion
- 💫 Star burst + coin explosion on achievement unlock
- 🌟 Coin fountain on rewards
- 🎉 Full-screen celebrations for coin milestones
- 💸 Coin shower animation when earning

### **C. Coin Progress Visualization**
- 📊 Animated coin progress rings
- 📈 Real-time coin counter
- 🗺️ Coin earning heatmap
- 📉 Coin spending history graphs
- 🎯 Coin goal completion animations
- 💰 Coin balance growth chart

### **D. Premium Coin-Themed Card Designs**
- 🎴 Glassmorphism with coin watermarks
- 🌈 Gold gradient overlays for coin cards
- 💎 Elevated shadows with coin glow
- ✨ Shimmer on hover/press (coin sparkle)
- 🎨 Dynamic color theming based on coin balance
- 🪙 3D coin icons throughout

### **E. Coin Balance Widget**
```typescript
interface CoinBalanceWidget {
  position: 'top-right'; // Always visible
  display: {
    current: number;
    trend: 'up' | 'down' | 'stable';
    change24h: number;
    animation: 'pulse' | 'glow' | 'none';
  };
  quickActions: [
    'Buy Coins',
    'Earn Coins',
    'Spend Coins',
    'Coin History'
  ];
  notifications: {
    lowBalance: boolean; // < 100 coins
    milestone: boolean;
    earning: boolean;
  };
}
```

---

## 🎮 **4. GAMIFICATION LAYERS**

### **Daily Coin Missions** (FOMO Driver)
```
☀️ Morning Mission (6am-12pm)
  "Donate ₦1,000 for 200 bonus coins!"
  
🌆 Afternoon Challenge (12pm-6pm)
  "Match with 3 people for 500 coins + badge"
  
🌙 Evening Bonus (6pm-12am)
  "Last chance: 3x coins on next donation!"
```

### **Weekly Coin Challenges**
- 🎯 Progressive difficulty with coin rewards
- 🏆 Exclusive badges worth coins
- 📊 Leaderboard with 50,000 coin prize pool
- 🎁 Completion bonus: 5,000 coins

### **Monthly Coin Events**
- 🎪 Themed giving campaigns with coin multipliers
- 🏅 Special edition achievements (tradeable for coins)
- 💰 Mega coin bonuses (up to 100,000 coins)
- 👑 VIP status for top coin earners

### **Coin Battle Pass**
```typescript
interface CoinBattlePass {
  cost: 1000; // coins (one-time per season)
  freeTiers: {
    rewards: 5000; // coins total
    badges: 10;
  };
  premiumTiers: {
    rewards: 15000; // coins total
    badges: 30;
    exclusives: 10;
  };
  xpPerCoin: 10; // XP earned per coin spent/earned
}
```

---

## 🌟 **5. SOCIAL PROOF & COMPETITION**

### **Live Coin Leaderboard Features**
- ⚡ Real-time coin balance updates
- 🔔 "You moved up 5 spots! Earned 100 bonus coins!"
- 👀 See who's ahead/behind (coin amounts)
- 🎯 "Earn 500 more coins to overtake John!"
- 🏆 Crown animations for #1 (10,000 coin prize)
- 💰 Top 10 weekly coin prize pool: 100,000 coins

### **Friend Coin Activity**
- 👥 See friends' coin balances (with permission)
- 🎉 Celebrate friends' coin milestones
- 🤝 Challenge friends to coin races
- 📊 Compare coin stats
- 🏅 Friend coin leaderboards
- 💸 Send coins to friends (with fee)

### **Community Coin Milestones**
```
"🎉 ChainGive Community Hit 100M Coins Circulating!"
"🌍 10M Coins Donated This Month"
"🔥 Highest Coin Day Ever: 5M Coins Earned!"
"💰 1,000 Agents Now Selling Coins!"
```

---

## 💫 **6. PREMIUM ANIMATIONS**

### **Coin Entrance Animations**
- 🎬 Fade in + slide up with coin trail
- 🌊 Wave reveal with coin splash
- ✨ Sparkle entrance with coin particles
- 🎭 Curtain reveal with coin shower

### **Coin Loading States**
- 🎨 Skeleton screens with coin placeholders
- 💫 Shimmer effects (gold shimmer)
- 🌊 Wave loaders (coin waves)
- ✨ Particle loaders (floating coins)
- 🪙 Spinning coin loader

### **Coin Transition Animations**
- 📱 Smooth page transitions with coin trails
- 🎴 Card flip reveals (coin on back)
- 🌀 Morph transitions (coin morphing)
- 🎯 Zoom focus with coin burst

### **Coin Earning Animation**
```typescript
const coinEarnAnimation = {
  trigger: 'on_coin_earn',
  steps: [
    { action: 'show_coin_icon', duration: 200 },
    { action: 'scale_up', scale: 1.5, duration: 300 },
    { action: 'sparkle_effect', duration: 500 },
    { action: 'fly_to_balance', duration: 800, curve: 'ease-out' },
    { action: 'update_balance', duration: 300, effect: 'count_up' },
    { action: 'glow_balance', duration: 500 },
    { action: 'haptic_feedback', type: 'success' },
    { action: 'sound_effect', sound: 'coin_collect' },
  ],
};
```

---

## 🎁 **7. REWARD PSYCHOLOGY**

### **Variable Coin Rewards**
- 🎰 Random bonus coins (slot machine effect)
  - "Spin for 10-1000 bonus coins!"
- 🎁 Mystery coin boxes
  - "Open for 50-5000 coins!"
- 🎲 Lucky coin draws
  - "Daily lucky draw: Win up to 10,000 coins!"
- 💎 Surprise coin achievements
  - "Hidden achievement unlocked: 2,500 coins!"

### **Coin Endowment Effect**
- 💰 "You've earned 5,000 coins today!"
- 📈 "Your coin balance grew 23% this week"
- 🏆 "You're in top 5% of coin holders"
- ⭐ "You've earned 47,000 coins total"
- 💎 "Your coins helped 100 people"

### **Coin Loss Aversion**
- ⚠️ "Your streak expires in 2 hours! Lose 2,000 coin bonus!"
- 📉 "You'll lose Premium benefits (5,000 coins) tomorrow"
- 🔥 "Don't lose your 30-day streak worth 10,000 coins!"
- ⏰ "Bonus 1,000 coins expires at midnight!"
- 💸 "Agent running out of coins! Buy now!"

---

## 🎨 **8. VISUAL HIERARCHY**

### **Coin Color Psychology**
- 💛 **Gold** - Coins, wealth, premium
- 💚 **Green** - Earning, growth, success
- 🔵 **Blue** - Trust, stability, balance
- 🔴 **Red** - Urgency, FOMO, low balance
- 🟣 **Purple** - Rare, special, exclusive
- 🟠 **Orange** - Rewards, bonuses, achievements

### **Coin Typography Scale**
- 📏 Clear hierarchy with coin amounts prominent
- 💪 Bold for coin numbers
- ✨ Elegant for coin achievements
- 🎯 Readable for coin descriptions
- 🪙 Coin symbol (₵) throughout

### **Coin Visual Elements**
```typescript
const coinVisuals = {
  icon: '🪙', // Coin emoji
  symbol: '₵', // Coin symbol
  colors: {
    primary: '#FFD700', // Gold
    secondary: '#FFA500', // Orange
    accent: '#FFEC8B', // Light gold
  },
  gradients: {
    gold: ['#FFD700', '#FFA500'],
    premium: ['#FFD700', '#FF6B35'],
    rare: ['#9D4EDD', '#FFD700'],
  },
  shadows: {
    glow: '0 0 20px rgba(255, 215, 0, 0.5)',
    elevated: '0 8px 16px rgba(255, 215, 0, 0.3)',
  },
};
```

---

## 📱 **9. COIN-CENTRIC SCREEN DESIGNS**

### **Home Screen**
```typescript
interface HomeScreen {
  header: {
    coinBalance: {
      amount: number;
      trend: 'up' | 'down';
      animation: 'pulse';
    };
    quickActions: ['Buy Coins', 'Earn More'];
  };
  widgets: [
    {
      type: 'coin_earning_opportunities',
      items: [
        { action: 'Donate', reward: '200 coins' },
        { action: 'Refer', reward: '300 coins' },
        { action: 'Complete Mission', reward: '500 coins' },
      ],
    },
    {
      type: 'coin_spending_options',
      items: [
        { item: 'Premium', cost: '2,000 coins' },
        { item: 'Boost', cost: '100 coins' },
        { item: 'Theme', cost: '100 coins' },
      ],
    },
    {
      type: 'coin_milestones',
      current: 8500,
      next: 10000,
      reward: '1,000 bonus coins',
    },
  ];
}
```

### **Coin Purchase Screen (User)**
```typescript
interface CoinPurchaseScreen {
  header: 'Buy Coins from Agents';
  agentList: {
    filters: ['Nearest', 'Best Price', 'Most Coins'];
    agents: [
      {
        name: string;
        rating: number;
        coinBalance: number;
        pricePerCoin: number;
        distance: string;
        badge: 'verified' | 'premium';
      },
    ];
  };
  selectedAgent: {
    coinInventory: number;
    priceCalculator: {
      quantity: number;
      total: number;
      savings: number;
    };
    paymentMethods: ['Bank', 'Mobile Money', 'Cash'];
  };
  urgency: {
    lowStock: boolean;
    message: 'Only 5,000 coins left!';
  };
}
```

### **Coin Replenishment Screen (Agent)**
```typescript
interface AgentCoinReplenishScreen {
  header: 'Replenish Coin Inventory';
  currentBalance: {
    coins: number;
    value: string; // in Naira
    lowStockWarning: boolean;
  };
  purchaseOptions: [
    {
      amount: 10000,
      price: '$100',
      discount: '0%',
      recommended: false,
    },
    {
      amount: 50000,
      price: '$450',
      discount: '10%',
      recommended: true,
    },
    {
      amount: 200000,
      price: '$1,600',
      discount: '20%',
      recommended: false,
    },
  ];
  cryptoGateways: ['BTCPay', 'Coinbase', 'Cryptomus'];
  cryptoCurrencies: ['BTC', 'ETH', 'USDT', 'USDC'];
  paymentFlow: {
    step1: 'Select amount',
    step2: 'Choose gateway',
    step3: 'Select crypto',
    step4: 'Generate invoice',
    step5: 'Send payment',
    step6: 'Confirm & receive coins',
  };
}
```

### **Marketplace Screen**
```typescript
interface MarketplaceScreen {
  header: {
    coinBalance: number;
    categories: ['Airtime', 'Data', 'Vouchers', 'NFTs'];
  };
  items: [
    {
      name: string;
      image: string;
      price: number; // coins
      originalPrice?: number; // coins
      discount?: string;
      badge?: 'hot' | 'new' | 'exclusive';
      coinback?: number; // coins earned back
    },
  ];
  filters: {
    priceRange: [min: number, max: number]; // coins
    sortBy: 'price' | 'popular' | 'new';
  };
  urgency: {
    limitedTime: boolean;
    stockLeft: number;
    message: 'Only 3 left at this price!';
  };
}
```

### **Premium Subscription Screen**
```typescript
interface SubscriptionScreen {
  header: 'Upgrade with Coins';
  plans: [
    {
      name: 'Plus',
      price: 2000, // coins/month
      features: [
        '2x Coin Earning',
        'Priority Matching',
        'Exclusive Items',
        'Zero Fees',
      ],
      badge: 'Popular',
      savings: '1,000 coins vs buying features separately',
    },
    {
      name: 'Pro',
      price: 5000, // coins/month
      features: [
        '3x Coin Earning',
        'All Plus Features',
        'Advanced Analytics',
        'Dedicated Support',
      ],
      badge: 'Best Value',
      savings: '3,000 coins vs buying features separately',
    },
  ];
  coinBalance: {
    current: number;
    afterPurchase: number;
    warning: boolean; // if balance too low
  };
  benefits: {
    coinMultiplier: 'Earn back your investment in 2 weeks!',
    exclusiveAccess: 'Access to 10,000+ coin items',
  };
}
```

---

## 📊 **10. COIN DASHBOARD WIDGETS**

### **Coin Balance Card**
```typescript
interface CoinBalanceCard {
  balance: {
    current: number;
    trend: {
      direction: 'up' | 'down';
      percentage: number;
      period: '24h' | '7d' | '30d';
    };
    animation: 'pulse' | 'glow';
  };
  quickStats: {
    earned24h: number;
    spent24h: number;
    netFlow: number;
  };
  actions: ['Buy', 'Earn', 'Spend', 'History'];
}
```

### **Coin Earning Widget**
```typescript
interface CoinEarningWidget {
  title: 'Earn Coins Now';
  opportunities: [
    {
      action: 'Donate ₦5,000',
      reward: 500,
      timeLeft: '2 hours',
      difficulty: 'easy',
    },
    {
      action: 'Complete Cycle',
      reward: 2000,
      timeLeft: '1 day',
      difficulty: 'medium',
    },
    {
      action: 'Refer 3 Friends',
      reward: 900,
      timeLeft: 'No limit',
      difficulty: 'hard',
    },
  ];
  totalPotential: 3400; // coins
}
```

### **Coin Milestone Widget**
```typescript
interface CoinMilestoneWidget {
  current: 8500;
  next: 10000;
  progress: 0.85;
  reward: {
    coins: 1000,
    badge: 'Coin Master',
    nft: true,
  };
  message: 'Just 1,500 coins away from Coin Master!';
  animation: 'progress-bar-glow';
}
```

---

## 🎯 **11. COIN FOMO TRIGGERS**

### **Scarcity Indicators**
```typescript
const scarcityTriggers = {
  agentInventory: {
    low: 'Only 2,000 coins left with this agent!',
    medium: 'Agent has 15,000 coins available',
    high: 'Fully stocked: 50,000 coins',
  },
  marketplaceItem: {
    limited: 'Only 5 left at 500 coins!',
    selling: '23 people bought this today',
    exclusive: 'Exclusive: Only 100 available',
  },
  challenge: {
    spots: 'Only 3 spots left in 10,000 coin challenge!',
    time: 'Challenge ends in 2 hours!',
    participants: '247 people competing for 50,000 coins',
  },
};
```

### **Urgency Timers**
```typescript
interface UrgencyTimer {
  type: 'countdown' | 'expiring' | 'limited';
  message: string;
  timeLeft: number; // seconds
  action: string;
  reward: number; // coins
  animation: 'pulse' | 'blink' | 'shake';
  color: 'red' | 'orange' | 'yellow';
}
```

### **Social Proof Notifications**
```typescript
const socialProofNotifications = [
  {
    type: 'earning',
    message: '🎉 Sarah just earned 500 coins!',
    action: 'Earn coins too',
  },
  {
    type: 'spending',
    message: '💎 Michael bought Premium with 2,000 coins',
    action: 'Upgrade now',
  },
  {
    type: 'milestone',
    message: '🏆 John reached 50,000 coins!',
    action: 'See leaderboard',
  },
  {
    type: 'achievement',
    message: '⭐ 3 people unlocked Legendary achievement (10,000 coins)',
    action: 'View achievements',
  },
];
```

---

## 🚀 **12. IMPLEMENTATION PHASES**

### **Phase 1: Foundation (Week 1-2)**
- ✅ Coin balance widget (always visible)
- ✅ Coin earning/spending animations
- ✅ Basic FOMO triggers
- ✅ Coin milestone tracking
- ✅ Celebration animations

### **Phase 2: Engagement (Week 3-4)**
- ✅ NFT-like achievement cards
- ✅ Daily coin missions
- ✅ Live coin activity feed
- ✅ Real-time coin leaderboard
- ✅ Coin social proof elements

### **Phase 3: Polish (Week 5-6)**
- ✅ Advanced micro-interactions
- ✅ Premium coin animations
- ✅ Coin sound effects
- ✅ Haptic feedback refinement
- ✅ Coin particle systems

---

## 🎯 **SUCCESS METRICS**

### **Engagement**
- 📈 Daily coin transactions +300%
- 🔥 Coin earning rate +250%
- 🎯 Achievement unlock rate +400%
- ⏱️ Session duration +100%
- 💰 Average coin balance +150%

### **Retention**
- 📊 Day 7 retention: 60% → 90%
- 📈 Day 30 retention: 30% → 70%
- 🔄 Monthly coin activity +200%
- 💎 Premium conversion +180%

### **Monetization**
- 💰 Coin purchases +200%
- 💎 Coin spending +150%
- 🏆 Premium subscriptions (coins) +250%
- 🎮 Battle pass sales +300%

---

## 💡 **PSYCHOLOGICAL TRIGGERS**

### **Coin-Specific Triggers**

**Reciprocity**
"Someone donated to you. Earn 200 coins by paying it forward!"

**Social Proof**
"1,247 people earned coins today. Join them and earn 500 coins!"

**Scarcity**
"Only 3,000 coins left with nearby agents!"

**Authority**
"Top 5% of coin earners this month (10,000+ coins)"

**Commitment**
"You've earned coins 30 days in a row! Keep your 5,000 coin streak!"

**Liking**
"Your friends earned 25,000 coins this week!"

**Loss Aversion**
"Don't lose your 10,000 coin milestone bonus!"

---

## 🎨 **DESIGN PRINCIPLES**

1. **Coin Delight First** - Every coin interaction should spark joy
2. **Instant Coin Feedback** - No coin action goes unnoticed
3. **Visual Coin Rewards** - Show coins, don't just tell
4. **Smooth Coin Transitions** - Butter-smooth coin animations
5. **Clear Coin Hierarchy** - Coin amounts always prominent
6. **Emotional Coin Connection** - Make users feel wealthy

---

## 🔥 **THE COIN FOMO FORMULA**

```
COIN FOMO = Urgency × Scarcity × Social Proof × Coin Value × Earning Potential
```

**Every screen should have:**
- ⏰ A countdown timer (coin opportunity expiring)
- 📊 A scarcity indicator (coins running out)
- 👥 Social proof element (others earning/spending coins)
- 🎁 A visible coin reward
- 💰 Coin balance always visible

---

## 🎯 **FINAL GOAL**

Transform ChainGive from a donation app into an **addictive coin-powered giving game** where users:
- 🎮 Can't wait to open the app (to check coin balance)
- 🔥 Fear missing coin opportunities
- 🏆 Compete to earn more coins
- 💎 Collect rare coin-rewarding achievements
- 👥 Share their coin wealth proudly
- 💰 Feel rich with their coin balance
- 🪙 See coins as valuable currency
- 🎯 Always have coin goals to chase

**Make coin-powered philanthropy irresistible!** 🚀💚🪙

---

## 📱 **COIN UI COMPONENTS LIBRARY**

### **CoinBalance Component**
```typescript
<CoinBalance
  amount={8500}
  trend="up"
  change24h={+500}
  animation="pulse"
  size="large"
  showQuickActions={true}
/>
```

### **CoinEarning Animation**
```typescript
<CoinEarningAnimation
  amount={500}
  source="donation"
  destination="balance"
  duration={800}
  particles={true}
  sound={true}
  haptic={true}
/>
```

### **CoinMilestone Progress**
```typescript
<CoinMilestoneProgress
  current={8500}
  target={10000}
  reward={1000}
  badge="Coin Master"
  glowColor="#FFD700"
/>
```

### **CoinFOMO Banner**
```typescript
<CoinFOMOBanner
  message="Only 2 hours left to earn 2x coins!"
  urgency="high"
  timer={7200}
  action="Donate Now"
  reward={1000}
/>
```

### **CoinAchievement Card**
```typescript
<CoinAchievementCard
  name="Generous Heart"
  rarity="epic"
  coinReward={5000}
  serialNumber={1234}
  canMint={true}
  mintCost={100}
  tradeable={true}
  marketValue={7500}
/>
```

---

**Every pixel should celebrate coins. Every interaction should feel rewarding. Every user should feel wealthy.** 🪙✨💚