# 🎨 **ChainGive UI/UX Specification Guide**

> *Design system for consistency, accessibility, and emotional resonance*

**Version:** 2.4  
**Last Updated:** October 3, 2025  
**Companion to:** ChainGive Product Bible v2.4

---

## 📖 Table of Contents

1. [Color Palette](#1-color-palette)
2. [Typography](#2-typography)
3. [Iconography](#3-iconography)
4. [Spacing & Layout](#4-spacing--layout)
5. [Component Library](#5-component-library-core-ui-elements)
6. [Visual Language Principles](#6-visual-language-principles)
7. [Screen Specifications](#7-screen-specifications)
8. [Interaction Patterns](#8-interaction-patterns)
9. [Accessibility Guidelines](#9-accessibility-guidelines)
10. [Animation & Motion](#10-animation--motion)
11. [Error States & Empty States](#11-error-states--empty-states)
12. [Trauma-Informed Design Patterns](#12-trauma-informed-design-patterns)
13. [Localization & Cultural Adaptation](#13-localization--cultural-adaptation)
14. [Documentation Templates](#14-documentation-templates)

---

## 1. Color Palette

### Primary Colors

| Purpose | Color | HEX | RGB | Usage |
|---------|-------|-----|-----|--------|
| **Primary Brand** | Growth Green | `#2E8B57` | `rgb(46, 139, 87)` | Buttons, headers, progress bars |
| **Secondary** | Trust Blue | `#1E90FF` | `rgb(30, 144, 255)` | Agent features, links |
| **Tertiary** | Honor Gold | `#FFD700` | `rgb(255, 215, 0)` | Power Partner tier, VIP status |

### Neutral Colors

| Purpose | Color | HEX | RGB | Usage |
|---------|-------|-----|-----|--------|
| **Neutral Light** | Soft White | `#F8F9FA` | `rgb(248, 249, 250)` | Backgrounds |
| **Neutral Medium** | Silver Gray | `#6C757D` | `rgb(108, 117, 125)` | Disabled states, borders |
| **Neutral Dark** | Charcoal | `#212529` | `rgb(33, 37, 41)` | Text, icons |

### Semantic Colors

| Purpose | Color | HEX | RGB | Usage |
|---------|-------|-----|-----|--------|
| **Success** | Forest Green | `#28A745` | `rgb(40, 167, 69)` | Confirmations, completed cycles |
| **Warning** | Amber | `#FFC107` | `rgb(255, 193, 7)` | Info alerts, pending actions |
| **Error** | Crimson | `#DC3545` | `rgb(220, 53, 69)` | Errors, failed transactions |
| **Info** | Sky Blue | `#17A2B8` | `rgb(23, 162, 184)` | Informational messages |

### Tier-Specific Colors

| Tier | Color | HEX | Usage |
|------|-------|-----|--------|
| **Beginner** | Leaf Green | `#90EE90` | Profile badges, tier indicators |
| **Agent** | Ocean Blue | `#4169E1` | Agent dashboard, verification status |
| **Power Partner** | Royal Gold | `#DAA520` | Premium features, leaderboards |
| **CSC Council** | Noble Purple | `#6A5ACD` | Council badges, governance features |

### Color Usage Guidelines

> 🟢 **Accessibility Requirement**: All text meets WCAG AA contrast ratio (4.5:1 minimum)

**Text on Backgrounds:**
- Dark text (#212529) on light backgrounds (#F8F9FA)
- White text (#FFFFFF) on dark/colored backgrounds (Primary Green, Trust Blue)
- Never use color alone to convey information (always pair with icons/text)

**Color Psychology:**
- **Green**: Growth, hope, progress (aligned with African values of community prosperity)
- **Blue**: Trust, security, professionalism
- **Gold**: Achievement, honor, excellence

---

## 2. Typography

### Font Family

**Primary Font**: [Inter](https://rsms.me/inter/)
- Open-source, excellent readability
- Optimized for UI with multiple weights
- Supports extended Latin, Cyrillic (future expansion)

**Fallback Stack:**
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
```

### Type Scale

| Element | Font | Size | Weight | Line Height | Usage |
|---------|------|------|--------|-------------|-------|
| **H1 - Page Title** | Inter Bold | 24px | 700 | 32px | Main screen headers |
| **H2 - Section Title** | Inter Bold | 20px | 700 | 28px | Card headers, modal titles |
| **H3 - Subsection** | Inter Semibold | 18px | 600 | 24px | List section headers |
| **Body Large** | Inter Regular | 16px | 400 | 24px | Main content, descriptions |
| **Body Regular** | Inter Regular | 14px | 400 | 20px | Secondary text |
| **Caption** | Inter Regular | 12px | 400 | 16px | Timestamps, metadata |
| **Button Text** | Inter Medium | 16px | 500 | 48px | Primary/Secondary buttons |
| **Label** | Inter Medium | 14px | 500 | 20px | Form labels, tags |
| **Overline** | Inter Medium | 12px | 500 | 16px | Categories, uppercase labels |

### Typography Guidelines

**Readability:**
- Minimum body text size: 14px (16px preferred)
- Maximum line length: 60-70 characters
- Paragraph spacing: 16px between paragraphs

**Hierarchy:**
- Use size, weight, and color to establish hierarchy
- Limit to 3 levels of hierarchy per screen
- Maintain consistent spacing between heading levels

**Localization:**
- Support for English, Pidgin, Yoruba, Hausa, Igbo
- Adjust line height for tonal mark languages (+20% for Yoruba)
- Test with longest expected translations

---

## 3. Iconography

### Icon System

**Source**: [Feather Icons](https://feathericons.com/) + Custom ChainGive Icons

**Specifications:**
- Stroke width: 2px
- Canvas size: 24×24px
- Stroke cap: Round
- Stroke join: Round
- Color: Inherit from parent (default: #212529)

### Core Icon Set

| Purpose | Icon | Feather Name | Example Use | Custom? |
|---------|------|--------------|-------------|---------|
| **Kindness** | ❤️ | `heart` | Donation actions, giving | No |
| **Time** | ⏳ | `clock` | Queue estimates, cycle duration | No |
| **Security** | 🛡️ | `shield` | KYC, verification, trust score | No |
| **Achievement** | 🏅 | `award` | Tier upgrades, badges | No |
| **Charity Coins** | 💰 | `coins` (custom) | Coin balance, marketplace | **Yes** |
| **Leaderboard** | 📈 | `trending-up` | Rankings, statistics | No |
| **Help** | ❓ | `help-circle` | Support, tooltips | No |
| **Verified** | ✅ | `check-circle` | Completed actions, KYC status | No |
| **Profile** | 👤 | `user` | User profile, account | No |
| **Wallet** | 💳 | `credit-card` | Wallet, payments | No |
| **History** | 📋 | `list` | Transaction history | No |
| **Settings** | ⚙️ | `settings` | Preferences, config | No |
| **Notification** | 🔔 | `bell` | Alerts, reminders | No |
| **Community** | 👥 | `users` | CSC, agent network | No |
| **Location** | 📍 | `map-pin` | Geographic info | No |
| **Upload** | ⬆️ | `upload` | Payment proof, documents | No |
| **Download** | ⬇️ | `download` | Reports, receipts | No |
| **Link** | 🔗 | `link` | External links, sharing | No |
| **Close** | ❌ | `x` | Dismiss, cancel | No |
| **Back** | ⬅️ | `arrow-left` | Navigation back | No |
| **Forward** | ➡️ | `arrow-right` | Next step, progression | No |

### Custom Icons (ChainGive Specific)

**Charity Coin Icon:**
```
- Circular coin with "C" monogram
- Subtle shine/gradient effect
- Available in: 16px, 24px, 32px, 48px
- Color variants: Gold (#FFD700), Gray (disabled)
```

**Cycle Status Icons:**
- **Pending**: Outlined circle with dotted stroke
- **In Progress**: Half-filled circle with animated gradient
- **Completed**: Filled circle with checkmark
- **Defaulted**: Circle with exclamation mark (amber)

### Icon Usage Guidelines

> ✅ **All icons paired with text labels for clarity** (except in tab bars where space is limited)

**Sizing:**
- Navigation/Tab bar: 24px
- Inline with text: 16px
- Feature cards: 32px
- Hero sections: 48px+

**Color:**
- Default: Inherit text color
- Active state: Primary Green (#2E8B57)
- Disabled: Neutral Medium (#6C757D)

---

## 4. Spacing & Layout

### 8-Point Grid System

All spacing values are multiples of 8px for consistency:

| Token | Value | Usage |
|-------|-------|-------|
| `space-xxs` | 4px | Icon margins, tight groupings |
| `space-xs` | 8px | Input padding, small gaps |
| `space-sm` | 12px | List item padding |
| `space-md` | 16px | Card padding, screen margins |
| `space-lg` | 24px | Section spacing |
| `space-xl` | 32px | Major section breaks |
| `space-xxl` | 48px | Screen top/bottom padding |

### Layout Structure

#### Mobile (Default: 375px width)

```
┌─────────────────────────────┐
│  [Header Bar - 56px]        │
├─────────────────────────────┤
│                             │
│  [Main Content Area]        │
│  - 16px horizontal padding  │
│  - Scrollable               │
│                             │
├─────────────────────────────┤
│  [Bottom Nav Bar - 64px]    │
└─────────────────────────────┘
```

#### Tablet (768px+)

```
┌───────────────────────────────────────┐
│  [Header Bar - 64px]                  │
├───────────────────────────────────────┤
│                                       │
│  [Main Content - Max 1024px centered] │
│  - 24px horizontal padding            │
│                                       │
├───────────────────────────────────────┤
│  [Footer - 80px] (web only)           │
└───────────────────────────────────────┘
```

### Touch Targets

**Minimum Sizes:**
- Buttons: 48×48px
- Icons (tappable): 44×44px
- Form inputs: 48px height
- List items: 56px height

**Safe Areas:**
- iOS: Respect notch (top) and home indicator (bottom)
- Android: Account for navigation bar
- Minimum 16px padding from screen edges

### Component Spacing

**Cards:**
- Padding: 16px
- Margin between cards: 12px
- Border radius: 8px

**Forms:**
- Label to input: 8px
- Input to input: 16px
- Input to button: 24px

**Lists:**
- Item height: 56px (with avatar), 48px (text only)
- Divider: 1px, color #E9ECEF

---

## 5. Component Library (Core UI Elements)

### Buttons

#### Primary Button
```
Background: #2E8B57 (Growth Green)
Text: #FFFFFF, Inter Medium, 16px
Height: 48px
Padding: 12px 24px
Border Radius: 8px
Shadow: 0 2px 4px rgba(0,0,0,0.1)

States:
- Hover: Background #257547 (10% darker)
- Active: Background #1E5A35 (20% darker)
- Disabled: Background #6C757D, Opacity 0.5
- Loading: Spinner (white), text "Processing..."
```

#### Secondary Button
```
Background: Transparent
Border: 2px solid #2E8B57
Text: #2E8B57, Inter Medium, 16px
Height: 48px
Padding: 12px 24px
Border Radius: 8px

States:
- Hover: Background rgba(46, 139, 87, 0.1)
- Active: Background rgba(46, 139, 87, 0.2)
- Disabled: Border #6C757D, Text #6C757D, Opacity 0.5
```

#### Text Button
```
Background: Transparent
Text: #1E90FF (Trust Blue), Inter Medium, 14px
Height: 32px
Padding: 8px 16px
Underline: None (on hover: underline)

States:
- Hover: Underline
- Active: Text #1266CC (darker)
- Disabled: Text #6C757D, Opacity 0.5
```

### Cards

#### Standard Card
```
Background: #FFFFFF
Border: 1px solid #E9ECEF
Border Radius: 8px
Padding: 16px
Shadow: 0 1px 3px rgba(0,0,0,0.08)

Interactive:
- Hover: Shadow 0 4px 8px rgba(0,0,0,0.12)
- Active: Scale 0.98
```

#### Leaderboard Card
```
Structure:
┌─────────────────────────────┐
│ [Avatar] Name              │
│         Location           │
│         [Badge #7] 🏅      │
│         125 cycles         │
└─────────────────────────────┘

Avatar: 48px circle
Badge: Position number in circle
Tier glow: Subtle shadow in tier color
```

#### Charity Coin Listing Card
```
Structure:
┌─────────────────────────────┐
│ Vendor: MTN Airtime         │
│ ⭐ 4.8 (234 reviews)        │
│ 💰 50 Coins = ₦100         │
│ 📦 In Stock                 │
│ [Payment Methods Badges]    │
│ [Redeem Button]             │
└─────────────────────────────┘

Payment badges: Small pills (Bank, Opay, etc.)
Stock indicator: Green dot + "In Stock" / Red dot + "Out of Stock"
```

### Progress Indicators

#### Progress Bar
```
Height: 8px
Background: #E9ECEF
Fill: #2E8B57 (Growth Green)
Border Radius: 4px
Animation: Smooth fill from left to right (300ms ease)

With Label:
Above bar: "3 of 5 cycles completed"
Inside bar: Percentage (if >20% filled)
```

#### Cycle Status Ring
```
Size: 120px
Stroke width: 8px
Background stroke: #E9ECEF
Progress stroke: Gradient (Green → Blue)
Center: Percentage or icon
Animation: Clockwise fill (500ms ease-out)
```

### Forms

#### Text Input
```
Height: 48px
Padding: 12px 16px
Border: 1px solid #CED4DA
Border Radius: 8px
Font: Inter Regular, 16px
Placeholder: #6C757D

States:
- Focus: Border #2E8B57 (2px), Shadow 0 0 0 3px rgba(46,139,87,0.1)
- Error: Border #DC3545, Helper text in red below
- Disabled: Background #E9ECEF, Text #6C757D
```

#### Dropdown/Select
```
Height: 48px
Padding: 12px 16px
Border: 1px solid #CED4DA
Border Radius: 8px
Icon: Chevron-down (right-aligned)

Menu:
- Max height: 240px (scrollable)
- Item height: 44px
- Selected: Background rgba(46,139,87,0.1), Checkmark icon
```

#### Radio Buttons
```
Size: 20px circle
Border: 2px solid #6C757D
Selected: Fill #2E8B57, inner circle 10px
Label: 16px, 8px left margin

Group spacing: 16px between options
```

#### Checkboxes
```
Size: 20px square
Border: 2px solid #6C757D
Border Radius: 4px
Selected: Fill #2E8B57, white checkmark
Label: 16px, 8px left margin
```

### Alerts

#### Warning Alert
```
Background: #FFF3CD
Border-left: 4px solid #FFC107
Padding: 12px 16px
Icon: ❗ (Amber)
Text: #856404 (dark amber)
Border Radius: 4px

Example:
┌─────────────────────────────┐
│ ❗ Your cycle is due in 3   │
│    days. Open app to give.  │
└─────────────────────────────┘
```

#### Error Alert
```
Background: #F8D7DA
Border-left: 4px solid #DC3545
Padding: 12px 16px
Icon: ❌ (Crimson)
Text: #721C24 (dark red)
Action: [Dismiss] button (optional)
```

#### Success Alert
```
Background: #D4EDDA
Border-left: 4px solid #28A745
Padding: 12px 16px
Icon: ✅ (Green)
Text: #155724 (dark green)
Auto-dismiss: After 3 seconds (optional)
```

#### Info Alert
```
Background: #D1ECF1
Border-left: 4px solid #17A2B8
Padding: 12px 16px
Icon: ℹ️ (Blue)
Text: #0C5460 (dark cyan)
```

### Modals

#### Standard Modal
```
Overlay: rgba(0, 0, 0, 0.5)
Modal:
- Background: #FFFFFF
- Border Radius: 12px (top corners on mobile)
- Max Width: 480px (web), full width (mobile)
- Padding: 24px
- Shadow: 0 8px 24px rgba(0,0,0,0.2)

Header:
- Title: H2 (20px Bold)
- Close button: Top-right, X icon

Content:
- Scrollable if exceeds viewport

Footer:
- Buttons: Right-aligned
- Primary + Secondary (optional)
```

#### Quiz Modal (Educational)
```
Non-dismissible: No close button
Progress: Question 2 of 5 (top)
Content: Question + 3-4 options (radio buttons)
Feedback: 
- Correct: Green checkmark, brief explanation
- Wrong: Soft shake animation, try again
Submit: Disabled until option selected
```

### Badges

#### Tier Badge
```
Circular: 32px diameter
Border: 2px solid tier color
Glow: Box-shadow in tier color
Icon: Tier-specific symbol
  - Beginner: Seedling 🌱
  - Agent: Shield 🛡️
  - Power Partner: Star ⭐
  - CSC Council: Gavel ⚖️
```

#### Status Badge (Pill)
```
Height: 24px
Padding: 4px 12px
Border Radius: 12px (fully rounded)
Font: Inter Medium, 12px

Variants:
- Active: Background #D4EDDA, Text #155724
- Pending: Background #FFF3CD, Text #856404
- Completed: Background #D4EDDA, Text #155724
- Failed: Background #F8D7DA, Text #721C24
```

### Navigation

#### Bottom Tab Bar (Mobile)
```
Height: 64px
Background: #FFFFFF
Border-top: 1px solid #E9ECEF
Shadow: 0 -2px 4px rgba(0,0,0,0.05)

Tabs: 4-5 items
Layout:
┌──────┬──────┬──────┬──────┐
│ Home │ Give │Coins │Profile│
│  🏠  │  ❤️  │ 💰  │  👤  │
└──────┴──────┴──────┴──────┘

Active:
- Icon: Primary Green (#2E8B57)
- Label: Primary Green, Inter Medium
- Indicator: 3px bar above icon (optional)

Inactive:
- Icon: #6C757D
- Label: #6C757D, Inter Regular
```

#### Header Bar
```
Height: 56px (mobile), 64px (tablet+)
Background: #FFFFFF
Border-bottom: 1px solid #E9ECEF
Padding: 0 16px

Layout:
┌─────────────────────────────┐
│ [←] Title         [🔔] [⚙️] │
└─────────────────────────────┘

Left: Back button (when nested)
Center: Page title (H3)
Right: Action icons (max 2)
```

---

## 6. Visual Language Principles

### Design Philosophy

| Principle | Implementation | Example |
|-----------|----------------|---------|
| **Warmth** | Rounded corners, soft shadows, human-centered illustrations | All cards use 8px border radius, shadows never harsh |
| **Clarity** | One primary action per screen, clear visual hierarchy | Homepage: Single CTA "Start Giving" |
| **Trust** | Lock/shield icons near sensitive actions, visible security measures | Payment screen: Shield icon + "Bank-level encryption" |
| **Joy** | Subtle confetti on achievements, micro-interactions | Cycle completion: Confetti animation + success sound |
| **Respect** | No exploitative urgency, empathetic language | ❌ "LAST CHANCE!" ✅ "When you're ready..." |
| **Dignity** | No imagery that exploits poverty, trauma-aware design | Stock photos: Smiling people, not distressing scenes |

### Visual Hierarchy

**Information Priority:**
1. **Primary**: Main action/content (largest, boldest, primary color)
2. **Secondary**: Supporting info (medium size, regular weight)
3. **Tertiary**: Metadata (smallest, light weight, muted color)

**Example (Donation Card):**
```
┌─────────────────────────────┐
│ You received ₦5,000         │ ← Primary (H2, Bold)
│ from Emeka in Lagos         │ ← Secondary (Body, Regular)
│ 2 hours ago                 │ ← Tertiary (Caption, Muted)
│ [Confirm Receipt]           │ ← Primary CTA
└─────────────────────────────┘
```

### Illustration Style

**Characteristics:**
- Flat design with subtle gradients
- Diverse, realistic skin tones (Nigerian demographic)
- Simple geometric shapes
- Warm, inviting expressions
- No cultural stereotypes

**Usage:**
- Onboarding screens (full-screen illustrations)
- Empty states (small spot illustrations)
- Success/achievement moments (celebratory graphics)

**Avoid:**
- Clip art or generic stock images
- Overly complex or detailed illustrations
- Culturally insensitive imagery

---

## 7. Screen Specifications

### Core Screens (Mobile)

#### 1. Onboarding Flow

**Screen 1: Welcome**
```
[Full-screen illustration: Diverse people in circle]
Headline: "Welcome to ChainGive"
Subhead: "Where generosity flows forward"
[Next Button]
[Skip →]
```

**Screen 2: How It Works**
```
[Illustration: Donation cycle diagram]
Headline: "You receive. You give. You earn."
Body: 3-step explanation
[Next Button]
[← Back]
```

**Screen 3: Values**
```
[Illustration: Handshake with shield]
Headline: "Built on trust, not debt"
Body: Core principles (bullet points)
[Get Started Button]
[← Back]
```

**Screen 4: Sign Up**
```
[ChainGive Logo - small, top-center]
Headline: "Create your account"
[Phone Number Input]
[Email Input]
[Password Input]
[Checkbox] "I agree to Terms & Privacy Policy"
[Sign Up Button]
"Already have an account? [Log In]"
```

#### 2. Home Dashboard

```
┌─────────────────────────────┐
│ ChainGive        [🔔] [⚙️]  │ ← Header
├─────────────────────────────┤
│ Welcome back, Adeyemi! 👋   │ ← Greeting
│                             │
│ Your Cycle Status:          │
│ [Progress Ring: 60%]        │ ← Visual progress
│ 3 of 5 cycles completed     │
│                             │
│ ┌─────────────────────────┐ │
│ │ 💰 Charity Coins: 245   │ │ ← Quick stats
│ └─────────────────────────┘ │
│                             │
│ Quick Actions:              │
│ [❤️ Give Now]  [🛍️ Shop]   │ ← Primary CTAs
│                             │
│ Recent Activity:            │
│ ┌─────────────────────────┐ │
│ │ You received ₦5,000     │ │
│ │ from Emeka              │ │ ← Activity feed
│ │ 2 hours ago             │ │
│ └─────────────────────────┘ │
│ ┌─────────────────────────┐ │
│ │ You gave ₦3,000         │ │
│ │ to Fatima               │ │
│ │ Yesterday               │ │
│ └─────────────────────────┘ │
│                             │
├─────────────────────────────┤
│ 🏠   ❤️   💰   👤          │ ← Bottom nav
└─────────────────────────────┘
```

#### 3. Give/Donate Screen

```
┌─────────────────────────────┐
│ [←] Give Forward            │ ← Header
├─────────────────────────────┤
│                             │
│ You're ready to give:       │
│ [Amount Display: ₦5,000]    │ ← Locked amount
│ (from your last receipt)    │
│                             │
│ Choose Recipient:           │
│ ○ Let algorithm match me    │ ← Radio options
│ ○ I'll choose               │
│                             │
│ Preferences (Optional):     │
│ [Dropdown: Location]        │
│ [Dropdown: Faith alignment] │
│                             │
│ Your wallet balance:        │
│ ₦5,000 Available            │ ← Wallet status
│                             │
│ [Confirm Donation]          │ ← Primary CTA
│                             │
│ 🛡️ Your donation is         │
│ secured in escrow until     │ ← Trust message
│ confirmed by recipient      │
│                             │
└─────────────────────────────┘
```

#### 4. Charity Coin Marketplace

```
┌─────────────────────────────┐
│ [←] Marketplace     [🔍]    │ ← Header with search
├─────────────────────────────┤
│ Your Balance: 💰 245 Coins  │ ← Balance sticky header
├─────────────────────────────┤
│ Categories:                 │
│ [All] [Airtime] [Data]      │ ← Filter tabs
│ [Vouchers] [Services]       │
│                             │
│ ┌─────────────────────────┐ │
│ │ MTN Airtime ₦100        │ │
│ │ ⭐ 4.8 (234)            │ │ ← Listing card
│ │ 💰 50 Coins             │ │
│ │ 📦 In Stock             │ │
│ │ [Bank] [Opay]           │ │
│ │ [Redeem →]              │ │
│ └─────────────────────────┘ │
│                             │
│ ┌─────────────────────────┐ │
│ │ 1GB Data Bundle         │ │
│ │ ⭐ 4.9 (567)            │ │
│ │ 💰 80 Coins             │ │
│ │ 📦 In Stock             │ │
│ │ [Palmpay] [Card]        │ │
│ │ [Redeem →]              │ │
│ └─────────────────────────┘ │
│                             │
└─────────────────────────────┘
```

#### 5. Profile/Account

```
┌─────────────────────────────┐
│ Profile             [⚙️]    │ ← Header
├─────────────────────────────┤
│      [Avatar - 80px]        │ ← Profile header
│      Adeyemi Okonkwo        │
│      🏅 Power Partner       │ ← Tier badge
│      ⭐ Trust Score: 4.8    │
│                             │
│ Stats:                      │
│ ┌──────┬──────┬──────┐      │
│ │  12  │ 245  │  8   │      │ ← Quick stats
│ │Cycles│Coins │Weeks │      │
│ └──────┴──────┴──────┘      │
│                             │
│ Achievements:               │
│ 🌱 🔥 🏆 💎 ⚡             │ ← Badge row
│                             │
│ Account:                    │
│ [👤 Edit Profile]           │
│ [💳 Wallet & Payments]      │ ← Menu items
│ [📊 Transaction History]    │
│ [🛡️ Security & KYC]         │
│ [❓ Help & Support]         │
│ [⚖️ Terms & Privacy]        │
│                             │
│ [Log Out]                   │ ← Secondary action
│                             │
└─────────────────────────────┘
```

---

## 8. Interaction Patterns

### Micro-Interactions

| Action | Feedback | Duration | Purpose |
|--------|----------|----------|---------|
| **Button Tap** | Scale 0.95, haptic feedback | 100ms | Tactile confirmation |
| **Successful Donation** | Confetti + success icon | 2s | Celebration |
| **Coin Earned** | Coin flips in + sound | 500ms | Reward feedback |
| **Progress Update** | Progress bar animates | 300ms | Visual progress |
| **Wrong Quiz Answer** | Gentle shake (5px) | 200ms | Non-punitive error |
| **Pull to Refresh** | Spinner at top | Until loaded | Standard pattern |
| **Swipe to Delete** | Red background reveals | 200ms | iOS pattern |

### Loading States

**Inline Spinners:**
```
Button: Replace text with spinner (same color)
Card: Skeleton screen (gray placeholders)
List: Shimmer effect on loading items
```

**Full-Screen Loader:**
```
Overlay: rgba(255, 255, 255, 0.9)
Spinner: ChainGive animated logo
Text: "Processing your donation..." (contextual)
Max duration: 5s before timeout warning
```

### Gestures

| Gesture | Action | Screen |
|---------|--------|--------|
| **Swipe Left** | View details (list items) | Transaction history |
| **Swipe Right** | Go back (iOS pattern) | All nested screens |
| **Pull Down** | Refresh content | Home, marketplace |
| **Long Press** | Context menu / info tooltip | Badges, stats |
| **Pinch** | Zoom (images only) | Receipt uploads |

### Transitions

**Screen Transitions:**
- Push: Slide from right (300ms ease-out)
- Pop: Slide to right (300ms ease-in)
- Modal: Slide up from bottom (400ms ease-out)
- Tab Switch: Fade (200ms)

**Element Transitions:**
- Fade In: Opacity 0 → 1 (200ms)
- Slide Up: Transform Y +20px → 0 (300ms)
- Scale Up: Scale 0.9 → 1 (200ms)

---

## 9. Accessibility Guidelines

### WCAG 2.1 AA Compliance

**Color Contrast:**
- Text: Minimum 4.5:1 (AA standard)
- Large text (18pt+): Minimum 3:1
- UI components: Minimum 3:1

**Keyboard Navigation:**
- All interactive elements tabbable
- Focus indicators visible (2px outline, Primary Green)
- Skip links for screen readers

**Screen Reader Support:**

```jsx
// Example: Accessible button
<button
  aria-label="Confirm donation of ₦5,000 to Fatima"
  role="button"
  tabIndex={0}
>
  Confirm Donation
</button>
```

**Semantic HTML:**
- Use proper heading hierarchy (H1 → H2 → H3)
- Label all form inputs
- ARIA landmarks for navigation

### Inclusive Design

**Low Vision:**
- Support system font size adjustments
- High contrast mode option
- Minimum touch target: 44×44px

**Motor Impairments:**
- No hover-only interactions
- Generous touch targets (48×48px)
- Undo options for critical actions

**Cognitive Accessibility:**
- Simple language (Grade 8 reading level)
- Consistent navigation patterns
- Progress indicators for multi-step flows
- Confirmation dialogs for irreversible actions

**Language Support:**
- English (primary)
- Pidgin English
- Yoruba (with tonal marks)
- Hausa
- Igbo

### Alternative Text

**Images:**
```
Decorative: alt="" (empty, ignored by screen readers)
Informative: alt="Graph showing 12 completed donation cycles"
Functional: alt="Upload payment receipt photo"
```

**Icons:**
```
With text label: aria-hidden="true"
Without text: aria-label="Help and support"
```

---

## 10. Animation & Motion

### Principles

1. **Purposeful**: Every animation serves a function
2. **Quick**: Most animations 200-400ms
3. **Natural**: Ease-out for entrances, ease-in for exits
4. **Respectful**: Respect `prefers-reduced-motion` setting

### Animation Catalog

#### Entrances

**Fade In:**
```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
/* Duration: 200ms, Easing: ease-out */
```

**Slide Up:**
```css
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
/* Duration: 300ms, Easing: ease-out */
```

**Scale In:**
```css
@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
/* Duration: 200ms, Easing: ease-out */
```

#### Exits

**Fade Out:**
```css
@keyframes fadeOut {
  from { opacity: 1; }
  to { opacity: 0; }
}
/* Duration: 150ms, Easing: ease-in */
```

**Slide Down:**
```css
@keyframes slideDown {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(20px);
  }
}
/* Duration: 200ms, Easing: ease-in */
```

#### Feedback Animations

**Success Confetti:**
```
Particles: 20-30 colored shapes
Colors: Primary Green, Trust Blue, Honor Gold
Duration: 2000ms
Physics: Gravity + random velocity
Trigger: Cycle completion, badge earned
```

**Coin Flip:**
```
Animation: rotateY(0deg → 360deg)
Duration: 500ms
Easing: cubic-bezier(0.68, -0.55, 0.265, 1.55)
Trigger: Charity Coin earned
```

**Shake (Error):**
```css
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}
/* Duration: 200ms, Iterations: 2 */
```

**Pulse (Notification):**
```css
@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}
/* Duration: 600ms, Iterations: infinite */
```

#### Progress Animations

**Loading Spinner:**
```css
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
/* Duration: 800ms, Iterations: infinite, Easing: linear */
```

**Progress Bar Fill:**
```css
@keyframes fillProgress {
  from { width: 0%; }
  to { width: var(--progress-value); }
}
/* Duration: 500ms, Easing: ease-out */
```

**Skeleton Shimmer:**
```css
@keyframes shimmer {
  0% { background-position: -468px 0; }
  100% { background-position: 468px 0; }
}
/* Duration: 1200ms, Iterations: infinite, Easing: linear */
```

### Reduced Motion

**Respect User Preferences:**
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

**Alternative Feedback:**
- Animations → Instant state changes
- Confetti → Static success icon
- Spinners → Progress percentage text

---

## 11. Error States & Empty States

### Error States

#### Form Validation Errors

**Inline Error (Real-time):**
```
[Email Input Field]
Border: 2px solid #DC3545 (Crimson)
Icon: ❌ (inside field, right)
Helper Text: "Please enter a valid email address"
  - Color: #DC3545
  - Font: Inter Regular, 12px
  - Position: Below input, 4px gap
```

**Error Summary (On Submit):**
```
┌─────────────────────────────┐
│ ❌ Please fix these errors: │
│                             │
│ • Email is invalid          │
│ • Password too short        │
│ • Phone number required     │
└─────────────────────────────┘
Color: #F8D7DA background
Position: Top of form
Dismissible: Yes (X button)
```

#### Network Errors

**Connection Lost:**
```
[Illustration: Disconnected plug]
Headline: "No internet connection"
Body: "Check your connection and try again"
[Retry Button]
```

**Timeout:**
```
[Illustration: Clock with X]
Headline: "Request timed out"
Body: "This is taking longer than expected"
[Try Again] [Go Back]
```

**Server Error (500):**
```
[Illustration: Wrench on server]
Headline: "Something went wrong"
Body: "We're working on it. Please try again shortly."
[Retry] [Contact Support]
Error ID: #ERR-20251003-1423
  - Copyable for support tickets
```

#### Transaction Errors

**Insufficient Funds:**
```
┌─────────────────────────────┐
│ ❌ Insufficient Balance     │
│                             │
│ Required: ₦5,000            │
│ Available: ₦3,500           │
│ Shortfall: ₦1,500           │
│                             │
│ [Add Funds] [Cancel]        │
└─────────────────────────────┘
```

**Duplicate Transaction:**
```
┌─────────────────────────────┐
│ ⚠️ Already Processed        │
│                             │
│ This donation was completed │
│ 5 minutes ago.              │
│                             │
│ [View Transaction] [OK]     │
└─────────────────────────────┘
```

### Empty States

#### First-Time User (No History)

**Transaction History (Empty):**
```
[Illustration: Empty folder with smile]
Headline: "No transactions yet"
Body: "Your giving journey starts here. Complete your first cycle to see your impact!"
[Start Giving]
```

**Marketplace (Empty Cart):**
```
[Illustration: Empty shopping bag]
Headline: "No items in cart"
Body: "Earn Charity Coins by completing cycles, then redeem for rewards."
[Explore Marketplace]
```

#### Temporary Empty State

**No Search Results:**
```
[Illustration: Magnifying glass with ∅]
Headline: "No results for 'airtime voucher'"
Suggestions:
• Check your spelling
• Try more general keywords
• Browse categories below

[All Items] [Airtime] [Data]
```

**No Notifications:**
```
[Illustration: Bell with checkmark]
Headline: "You're all caught up!"
Body: "No new notifications"
```

#### Error Empty State

**Failed to Load:**
```
[Illustration: Broken link]
Headline: "Couldn't load content"
Body: "Something went wrong while loading this page."
[Try Again]
```

### Loading States (Skeleton Screens)

**List Loading:**
```
┌─────────────────────────────┐
│ ▓▓▓▓▓▓▓▓▓░░░░░░░░░          │
│ ▓▓▓▓░░░░░░░░░░░░            │ ← Shimmer effect
│                             │
│ ▓▓▓▓▓▓▓▓▓░░░░░░░░░          │
│ ▓▓▓▓░░░░░░░░░░░░            │
└─────────────────────────────┘
Gray: #E9ECEF
Shimmer: Linear gradient moving left-to-right
```

**Card Loading:**
```
┌─────────────────────────────┐
│ ▓▓▓▓▓ ▓▓▓▓▓▓▓▓▓▓▓▓▓        │ ← Avatar + text
│                             │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │ ← Content block
│ ▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░        │
│                             │
│ ▓▓▓▓▓▓▓░░░░░░              │ ← Button placeholder
└─────────────────────────────┘
```

---

## 12. Trauma-Informed Design Patterns

### Language Guidelines

**Avoid Shame-Based Language:**

| ❌ Don't Say | ✅ Do Say |
|-------------|----------|
| "You owe ₦5,000" | "Your forward donation: ₦5,000" |
| "URGENT: Payment overdue!" | "Gentle reminder: Cycle due soon" |
| "Failed to pay" | "Cycle not yet completed" |
| "Debt" | "Obligation to community" |
| "Default" | "Cycle extended" |
| "You're late" | "When you're ready..." |

**Empathetic Messaging:**

```
Reminder Notification (7 days before due):
"Hi Adeyemi 👋
Your cycle is due in 7 days. We know life can be unpredictable.
If you need more time, just let us know."

[I'm Ready] [Request Extension]
```

```
Extension Request Confirmation:
"No problem! 🙏
We've extended your cycle by 30 days. Give when you're able."
```

### Visual Cues for Safety

**Trust Indicators:**
```
[🛡️ Bank-level encryption]
[✅ Verified by Agent Fatima]
[🔒 Your info is private]
[👥 Used by 50,000+ Nigerians]
```

**Non-Aggressive Reminders:**
```
Color: Amber (#FFC107), NOT red
Icon: 🔔 (bell), NOT ⚠️ (warning triangle)
Tone: Gentle, not urgent
Dismiss option: Always available
```

### Dignity-Preserving Features

**Anonymous Leaderboard Option:**
```
Settings → Privacy → Leaderboard
○ Show my name
● Show as "User #12345"
○ Hide me completely
```

**Private Impact Stories:**
```
When sharing impact:
□ Share my story publicly
☑ Keep my identity anonymous
□ Share only with ChainGive team
```

**Quiet Mode (Reduce Notifications):**
```
Settings → Notifications → Quiet Hours
From: 10:00 PM
To: 8:00 AM
☑ Pause all notifications during quiet hours
```

### Stress-Reducing Design

**No Countdown Timers:**
- Use progress indicators, not ticking clocks
- "Due in 7 days" instead of "6d 23h 59m remaining"

**Soft Color Palette:**
- Avoid harsh reds except for critical errors
- Use greens, blues, golds (positive associations)

**Breathing Room:**
- Generous whitespace
- Never cram multiple CTAs on one screen
- Allow users to "just browse" without pressure

---

## 13. Localization & Cultural Adaptation

### Language Support

**Supported Languages (Launch):**
1. English (Primary)
2. Pidgin English
3. Yoruba
4. Hausa
5. Igbo

**Translation Guidelines:**

| Principle | Implementation |
|-----------|----------------|
| **Context-Aware** | "Give" → Yoruba: "Fún" (context: donation), not "Pèsè" (provide) |
| **Culturally Appropriate** | Avoid direct translations; adapt idioms |
| **Tonal Marks** | Support diacritics (Yoruba: ẹ, ọ, ṣ) |
| **RTL Support** | Future: Arabic (for Northern Nigeria) |

**Example Translations:**

| English | Pidgin | Yoruba | Hausa | Igbo |
|---------|--------|--------|-------|------|
| Welcome | Welcom | Káàbọ̀ | Barka da zuwa | Nnọọ |
| Give | Give | Fún | Bayarwa | Nye |
| Thank you | Tenki | Ẹ ṣé | Na gode | Daalụ |
| Cycle | Saik | Ìpele | Zagaye | Usoro |

### Cultural Adaptations

#### Faith Integration (Optional)

**Prayer Time Reminders:**
```
Settings → Preferences → Faith
☑ Show prayer time reminders (Islamic)
Time zone: Lagos (WAT)
```

**Faith-Based Matching:**
```
When giving:
Preferences:
□ Match with same faith (optional)
  Options: Christian, Muslim, Other, Any
```

#### Regional Customization

**Location-Based Greetings:**
```
Lagos: "How far?" (Pidgin)
Kano: "Sannu" (Hausa)
Enugu: "Kedu" (Igbo)
Ibadan: "Báwo ni?" (Yoruba)
```

**Local Currency Display:**
```
Primary: ₦ (Naira)
Future: GH₵ (Ghana), KSh (Kenya), R (South Africa)
Format: ₦5,000.00 (Nigerian style)
```

#### Date & Time

**Format:**
```
English: Jan 15, 2025, 3:30 PM
Yoruba: Ọjọ́ 15, Oṣù Ṣẹ̀rẹ́, 2025, 3:30 PM
Time: 12-hour format (Nigeria standard)
```

**Relative Time:**
```
English: "2 hours ago"
Pidgin: "Like 2 hours wey don pass"
Yoruba: "Wákàtí méjì sẹ́yìn"
```

### Accessibility for Low Literacy

**Audio Guides:**
```
[🔊] Tap to hear
Available for:
- Onboarding instructions
- Transaction confirmations
- Marketplace descriptions
```

**Visual Step Indicators:**
```
Step 1 of 4: [●][○][○][○]
Large, clear numbers
Icon-based navigation
```

**Simplified Language Mode:**
```
Settings → Language → Simple Mode
☑ Use simpler words and shorter sentences
(Grade 6 reading level)
```

---

## 14. Documentation Templates

### For Developers

#### 🛠️ React Native Component Template

```jsx
/**
 * ChainGive Component: DonationCard
 * 
 * Displays donation transaction details
 * 
 * @param {object} donation - Donation object
 * @param {function} onConfirm - Callback for confirmation
 * @returns {JSX.Element}
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../theme';
import Icon from '../components/Icon';

export const DonationCard = ({ donation, onConfirm }) => {
  return (
    <View style={styles.card}>
      <Icon name="heart" size={32} color={colors.primary} />
      
      <Text style={styles.amount}>
        You received ₦{donation.amount.toLocaleString()}
      </Text>
      
      <Text style={styles.donor}>
        from {donation.donorName} in {donation.location}
      </Text>
      
      <Text style={styles.timestamp}>
        {donation.timeAgo}
      </Text>
      
      <TouchableOpacity 
        style={styles.button}
        onPress={onConfirm}
        accessibilityLabel={`Confirm receipt of ₦${donation.amount}`}
      >
        <Text style={styles.buttonText}>Confirm Receipt</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  amount: {
    ...typography.h2,
    color: colors.charcoal,
    marginTop: spacing.sm,
  },
  donor: {
    ...typography.bodyRegular,
    color: colors.charcoal,
    marginTop: spacing.xs,
  },
  timestamp: {
    ...typography.caption,
    color: colors.neutralMedium,
    marginTop: spacing.xxs,
  },
  button: {
    backgroundColor: colors.primary,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  buttonText: {
    ...typography.button,
    color: colors.white,
  },
});
```

#### 📐 Theme Configuration File

```javascript
// theme/colors.js
export const colors = {
  // Primary
  primary: '#2E8B57',       // Growth Green
  secondary: '#1E90FF',     // Trust Blue
  tertiary: '#FFD700',      // Honor Gold
  
  // Neutral
  white: '#FFFFFF',
  softWhite: '#F8F9FA',
  silverGray: '#6C757D',
  charcoal: '#212529',
  
  // Semantic
  success: '#28A745',       // Forest Green
  warning: '#FFC107',       // Amber
  error: '#DC3545',         // Crimson
  info: '#17A2B8',          // Sky Blue
  
  // Tiers
  tierBeginner: '#90EE90',  // Leaf Green
  tierAgent: '#4169E1',     // Ocean Blue
  tierPower: '#DAA520',     // Royal Gold
  tierCSC: '#6A5ACD',       // Noble Purple
};

// theme/typography.js
export const typography = {
  h1: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
  },
  h2: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 28,
  },
  h3: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
  },
  bodyLarge: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
  },
  bodyRegular: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },
  caption: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
  },
  button: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    fontWeight: '500',
  },
};

// theme/spacing.js
export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};
```

---

### For Designers

#### 🎨 Figma File Structure

**Recommended Organization:**

```
ChainGive Design System/
├── 📄 Cover Page
│   └── Version, contributors, last update
│
├── 🎨 Foundation/
│   ├── Colors (all swatches with names)
│   ├── Typography (type scale, examples)
│   ├── Spacing (8pt grid demo)
│   ├── Icons (all icons in 16, 24, 32, 48px)
│   └── Shadows (elevation system)
│
├── 🧱 Components/
│   ├── Buttons (all states)
│   ├── Forms (inputs, dropdowns, checkboxes)
│   ├── Cards (variants)
│   ├── Navigation (tabs, headers)
│   ├── Modals & Alerts
│   └── Custom (Charity Coin card, etc.)
│
├── 📱 Screens/
│   ├── Onboarding Flow
│   ├── Authentication
│   ├── Home Dashboard
│   ├── Give/Donate
│   ├── Marketplace
│   ├── Profile
│   └── Settings
│
└── 🔀 Prototypes/
    ├── User Journey: First Donation
    ├── User Journey: Marketplace Purchase
    └── User Journey: KYC Verification
```

**Component Guidelines:**
- Use Auto Layout for all components
- Create variants for states (default, hover, active, disabled)
- Name layers semantically (`button/primary/default`)
- Include annotations for developers

**Export Settings:**
- SVG for icons (no strokes, convert to outlines)
- PNG @2x and @3x for images
- PDF for print assets

---

### For Product Managers

#### 📊 User Story Template

```markdown
## User Story: [Feature Name]

**As a** [user role]  
**I want** [goal]  
**So that** [benefit]

### Acceptance Criteria
- [ ] Given [context], when [action], then [outcome]
- [ ] Given [context], when [action], then [outcome]
- [ ] Error handling: [specific scenario]
- [ ] Accessibility: [WCAG requirement]

### Design Specs
- Figma: [link to mockup]
- Prototype: [link to interactive flow]

### Technical Notes
- API endpoint: `/api/v1/donations/confirm`
- Required permissions: `WALLET_WRITE`
- Analytics event: `donation_confirmed`

### QA Test Cases
1. Happy path: [description]
2. Edge case: [description]
3. Error state: [description]

### Success Metrics
- Primary: [metric], Target: [value]
- Secondary: [metric], Target: [value]
```

---

### For Support Teams

#### 🆘 Support Response Templates

**Template 1: Transaction Not Received**

```
Subject: Your Donation Status – Ticket #[ID]

Hi [User Name],

Thank you for contacting ChainGive Support.

I've reviewed your account and can see that:
• Donor: [Name]
• Amount: ₦[Amount]
• Sent: [Date/Time]
• Status: [Pending/In Transit/etc.]

Next Steps:
[If pending] → The donor has 48 hours to confirm. We'll notify you when complete.
[If delayed] → I've escalated to our payments team. Expect update within 24 hours.

Your Transaction ID: [TXN-12345]

Need immediate help? WhatsApp us: +234-XXX-XXXX

Best,
[Agent Name]
ChainGive Support Team
```

**Template 2: KYC Verification Help**

```
Subject: Help with Identity Verification

Hi [User Name],

To complete your KYC verification, please:

1. Open ChainGive app
2. Go to Profile → Security & KYC
3. Upload:
   ✅ Clear selfie (face visible, good lighting)
   ✅ BVN or NIN
   ✅ Utility bill (if Tier 3)

Tips for Success:
• Use well-lit room
• Hold phone steady
• Ensure all text is readable

Can't access BVN/NIN? Visit a ChainGive Agent near you:
[Link to agent finder]

Processing time: 24-48 hours

Questions? Reply to this email.

Best,
[Agent Name]
```

---

### For Marketing

#### 📣 Social Media Templates

**Instagram Post: User Testimonial**

```
[Image: User photo with blur + quote overlay]

"ChainGive helped me pay school fees when I needed it most. 
Now I'm giving back to someone else. It feels good to help!" 
- Adeyemi, Lagos

💚 Join 50,000+ Nigerians giving forward
📱 Download: [link in bio]

#ChainGive #PayItForward #NigeriaGives #CommunityPower
```

**Twitter Thread: How It Works**

```
Tweet 1/5
Introducing ChainGive 🇳🇬

The peer-to-peer giving platform where generosity flows forward.

No loans. No interest. Just kindness. 💚

Here's how it works 🧵👇

---

Tweet 2/5
Step 1: You receive
Someone donates to you when you need help.
₦500 - ₦50,000

No strings attached. No shame.

---

Tweet 3/5
Step 2: You give forward
When you're able (7-90 days), you donate the SAME amount to someone else.

Not back to who gave you—forward to the next person.

That's the power of community. ✨

---

Tweet 4/5
Step 3: You earn
Complete cycles, earn Charity Coins.

Redeem for:
📱 Airtime
💾 Data
🎓 School fees
🏥 Health vouchers

Real value. Real impact.

---

Tweet 5/5
Ready to join?

📲 Download ChainGive
🌐 Visit chaingive.ng
📍 50 cities across Nigeria

Built on trust. Powered by you.

Let's give forward. 💚🇳🇬
```

---

### For Investors

#### 💼 Pitch Deck Outline (10 Slides)

**Slide 1: Cover**
- Logo
- Tagline: "The Ethical Peer-to-Peer Altruism Engine"
- Contact: invest@chaingive.ng

**Slide 2: Problem**
- 40% of Nigerians lack access to formal credit
- Loan sharks charge 10-30% monthly interest
- Existing platforms create debt cycles, not solutions

**Slide 3: Solution**
- Peer-to-peer giving (not lending)
- No interest, no repayment pressure
- Community-governed, blockchain-verified

**Slide 4: How It Works**
- Visual diagram of donation cycle
- 3 steps: Receive → Give Forward → Earn

**Slide 5: Market Opportunity**
- TAM: 200M Nigerians, 60M smartphone users
- SAM: 40M underbanked adults
- SOM: 500K users (Year 3 target)

**Slide 6: Business Model**
- 2% transaction fees
- 10-15% marketplace margin
- Agent network (5% share)
- LTV:CAC = 5.1 (Year 3)

**Slide 7: Traction**
- Users: 2K (pilot)
- GMV: ₦50M processed
- Agent network: 50 active
- Press: Featured in TechCabal, Techpoint

**Slide 8: Roadmap**
- Q1: Lagos MVP (2K users)
- Q2: Marketplace launch
- Q3: Expand to 5 cities (50K users)
- Q4: International pilot (Ghana)

**Slide 9: Team**
- Founder/CEO: [Name], [Background]
- CTO: [Name], [Background]
- Head of Community: [Name], [Background]
- Advisors: [Names, credentials]

**Slide 10: Ask**
- Raising: $500K Seed
- Use of Funds:
  - 40% Agent network expansion
  - 30% Product development
  - 20% Marketing
  - 10% Operations
- Contact: [Email, Calendar link]

---

## 🖱️ Quick Generation Commands

Below are **interactive commands** you can use to request specific documentation.

Simply type:

### ➤ **"Create Figma file"**
🟢 Generates:
- Full-screen mockups for onboarding, marketplace, leaderboard
- Component library with auto-layout
- Prototype flow: Beginner → Agent upgrade
- Export-ready assets (SVG, PNG)

---

### ➤ **"Create React Native architecture"**
🟢 Generates:
- Folder structure
- Navigation stack (React Navigation)
- State management plan (Redux Toolkit)
- API integration guide
- Sample components

---

### ➤ **"Create admin dashboard wireframes"**
🟢 Generates:
- Deposit review panel
- Fraud detection view
- Transaction audit log
- CSC voting interface
- User management table

---

### ➤ **"Create transparency report template"**
🟢 Generates:
- PowerPoint deck (PPTX structure)
- Excel tracker for donations, disbursements
- Field ambassador reporting form
- Public-facing PDF summary

---

### ➤ **"Create user support SOP"**
🟢 Generates:
- Tiered response protocol
- Chatbot script (FAQ automation)
- Escalation path flowchart
- Template replies (20+ scenarios)

---

### ➤ **"Create investor pitch deck"**
🟢 Generates:
- 10-slide presentation (PowerPoint outline)
- Market size, traction, roadmap
- Financial model (fee revenue, charity impact)
- Team slide template

---

### ➤ **"Create moderation handbook"**
🟢 Generates:
- Fraud classification matrix
- Account suspension workflow
- Dispute resolution steps (CSC escalation)
- Ban appeal process

---

### ➤ **"Create onboarding video scripts"**
🟢 Generates:
- 60-second explainer (English, Yoruba, Hausa, Igbo)
- Storyboard outline (scene-by-scene)
- Voice-over timing guide
- B-roll suggestions

---

### ➤ **"Create NDPR compliance pack"**
🟢 Generates:
- Data Processing Agreement (DPA)
- Consent logs template (Excel)
- Right to erasure process (step-by-step)
- Breach notification protocol

---

## 📞 Design System Governance

### Version Control

**Current Version:** 2.4  
**Last Updated:** October 3, 2025  
**Next Review:** January 2026

**Change Log:**
- v2.4: Removed USSD references, added crypto deposit UI
- v2.3: Added trauma-informed design patterns
- v2.2: Expanded localization (Hausa, Igbo)
- v2.1: Initial component library

### Contribution Guidelines

**Proposing Changes:**
1. Create Figma file with proposed update
2. Submit for design review (Slack: #design-system)
3. Document rationale (Why? What problem does it solve?)
4. Get approval from Design Lead + Product Manager
5. Update this guide + component library

**Approval Process:**
- Minor (color tweak, spacing): Design Lead approval
- Major (new component): Design Lead + PM + Engineering Lead
- Breaking (removing component): Full team vote

---

## 💌 Final Note

This UI/UX guide is a **living document**.

As ChainGive grows, our design system will evolve—but always with:
- **Accessibility first** (AA compliance minimum)
- **Trauma-aware language** (dignity over urgency)
- **Cultural respect** (built for Nigeria, by Nigerians)
- **Technical excellence** (clean code, smooth interactions)

Design is not decoration.  
Design is **empathy made visible**.

Let's build something beautiful. 🎨💚

---

**Document Owner:** Design Team  
**Questions?** design@chaingive.ng  
**Figma Library:** [Link to shared library]

---

*"Good design is honest." — Dieter Rams*
