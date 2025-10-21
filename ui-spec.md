# UI Specification Document

## Overview
This document outlines the complete UI specification for the ChainGive Flutter application, including all screens, colors, and UI components implemented in the project.

## Color Scheme

### Primary Colors
- **Primary Color**: `#1E3A8A` (Blue) - Used for primary actions, app bars, and key interactive elements
- **Secondary Color**: `#10B981` (Green) - Used for secondary actions and success states
- **Accent Color**: `#F59E0B` (Amber) - Used for highlights and accent elements
- **Error Color**: `#EF4444` (Red) - Used for error states and warnings
- **Warning Color**: `#F59E0B` (Amber) - Used for warning states
- **Success Color**: `#10B981` (Green) - Used for success states

### Background Colors
- **Background Color**: `#FFFFFF` (White) - Main background
- **Surface Color**: `#F8FAFC` - Card and surface backgrounds
- **Card Color**: `#FFFFFF` (White) - Card backgrounds

### Text Colors
- **Text Primary**: `#1E293B` - Primary text color
- **Text Secondary**: `#64748B` - Secondary text color
- **Text Hint**: `#94A3B8` - Hint text color

### Cultural Colors (Inspired by African Art)
- **Savanna Gold**: `#D4AF37` - Represents wealth and heritage
- **Baobab Brown**: `#8B4513` - Symbol of strength and resilience
- **Acacia Green**: `#228B22` - Represents growth and nature
- **Sunset Orange**: `#FF8C00` - Cultural warmth and energy
- **Indigo Blue**: `#4B0082` - Traditional African indigo dye
- **Kente Red**: `#DC143C` - From traditional Kente cloth patterns
- **Adire Blue**: `#00BFFF` - From Adire textile patterns
- **Gele Yellow**: `#FFD700` - Traditional Gele headwrap colors
- **Clay Beige**: `#F5F5DC` - Natural clay and earth tones
- **Charcoal**: `#36454F` - Deep, rich charcoal tones

## Typography

### Font Family
- **Primary Font**: Roboto (Material Design default)

### Text Styles
- **Display Large**: 32px, Bold, Primary text color
- **Display Medium**: 28px, W600, Primary text color
- **Display Small**: 24px, W600, Primary text color
- **Headline Large**: 22px, W600, Primary text color
- **Headline Medium**: 20px, W600, Primary text color
- **Headline Small**: 18px, W600, Primary text color
- **Title Large**: 16px, W600, Primary text color
- **Title Medium**: 14px, W500, Primary text color
- **Title Small**: 12px, W500, Primary text color
- **Body Large**: 16px, Normal, Primary text color
- **Body Medium**: 14px, Normal, Primary text color
- **Body Small**: 12px, Normal, Secondary text color
- **Label Large**: 14px, W500, Primary text color
- **Label Medium**: 12px, W500, Secondary text color
- **Label Small**: 11px, W500, Hint text color

## Screens

### 1. Login Screen (`/login`)
**Purpose**: User authentication entry point
**Components**:
- Cultural header with Adinkra Unity motif (80px)
- App title: "Welcome to ChainGive" (Headline Medium, Savanna Gold)
- Subtitle: "The Ethical Peer-to-Peer Altruism Engine" (Body Large, 70% opacity)
- Email TextField with validation
- Password TextField with visibility toggle
- Primary login button (Savanna Gold background)
- Social login buttons (Google, Biometric)
- Register link (Savanna Gold text)
- Forgot password link (Grey text)
- Cultural footer: "Building Ubuntu Through Technology"

### 2. Register Screen (`/register`)
**Purpose**: User registration
**Components**:
- Basic AppBar with "Register" title
- Centered placeholder text: "Register Screen"
**Status**: Placeholder implementation

### 3. Home Screen (`/home`)
**Purpose**: Main dashboard and navigation hub
**Components**:
- Custom AppBar with Ubuntu pattern (32px) and profile icon
- Welcome section with Sankofa symbol and Ubuntu greeting
- Quick Actions Grid (2x2):
  - Make Donation (Acacia Green, Baobab tree motif)
  - Coin Store (Indigo Blue, Kente pattern)
  - Community (Sunset Orange, Unity circles)
  - AI Insights (Kente Red, Sankofa symbol)
- Recent Activity list with activity items
- Cultural quote card with Maasai shield
- Bottom Navigation Bar (4 items: Home, Donate, Rankings, Community)

### 4. Donation Screen (`/donate`)
**Purpose**: Make donations to recipients
**Components**:
- AppBar: "Make a Donation" (Savanna Gold background)
- Cultural header: Adinkra Unity motif (60px)
- Title: "Give With Ubuntu" (Headline Small, Savanna Gold)
- AI recipient recommendations (horizontal scroll)
- Selected recipient card with ProgressiveImage
- Amount input field with currency selector
- Message input field (optional)
- Anonymous donation toggle
- Donate button (dynamic text based on selection)
- AI impact prediction display
- Cultural footer

### 5. Donation History Screen (`/donation-history`)
**Purpose**: View donation history
**Components**:
- AppBar: "Donation History"
- Centered placeholder text: "Donation History Screen"
**Status**: Placeholder implementation

### 6. Coin Store Screen (`/coins`)
**Purpose**: Purchase and manage coins
**Components**:
- AppBar: "Coin Store"
- Centered placeholder text: "Coin Store Screen"
**Status**: Placeholder implementation

### 7. AI Dashboard Screen (`/ai-dashboard`)
**Purpose**: AI-powered insights and analytics
**Components**:
- AppBar: "AI Dashboard"
- Centered placeholder text: "AI Dashboard Screen Content"
**Status**: Placeholder implementation

### 8. Profile Screen (`/profile`)
**Purpose**: User profile management
**Components**:
- AppBar: "Profile"
- Centered placeholder text: "Profile Screen Content"
**Status**: Placeholder implementation

### 9. Settings Screen (`/settings`)
**Purpose**: Application settings
**Components**:
- AppBar: "Settings"
- Centered placeholder text: "Settings Screen Content"
**Status**: Placeholder implementation

### 10. Community Screen (`/community`)
**Purpose**: Community interactions and discussions
**Components**:
- AppBar: "Community"
- Centered placeholder text: "Community Screen Content"
**Status**: Placeholder implementation

### 11. Rankings Screen (`/rankings`)
**Purpose**: Leaderboards and rankings
**Components**: Referenced in routes but screen file not found
**Status**: TODO implementation

### 12. Marketplace Screen (`/marketplace`)
**Purpose**: NFT marketplace
**Components**: Referenced in routes but screen file not found
**Status**: TODO implementation

## Shared Widgets and Components

### Cultural Motifs (`AfricanMotifs`)
**Purpose**: Cultural symbols and patterns inspired by African art
**Components**:
- **Baobab Tree**: Symbol of strength and resilience (CustomPaint)
- **Maasai Shield**: Protection and community (CustomPaint)
- **Kente Pattern**: Heritage and craftsmanship (Gradient with pattern overlay)
- **Sankofa Symbol**: Learning from past (Heart with bird, CustomPaint)
- **Ubuntu Pattern**: Community interconnectedness (CustomPaint)
- **Adinkra Unity**: Unity and togetherness (CustomPaint)
- **Unity Circles**: Community representation (CustomPaint)

### Accessibility Components

#### ProgressiveImage
**Purpose**: Progressive image loading with accessibility features
**Features**:
- Cached network image loading
- Alt text support with TTS
- Cultural context indicators
- Error handling with fallback icons
- Zoom functionality on double tap
- Loading progress indicators
- Accessibility overlay icons

#### CulturalGestureDetector
**Purpose**: Gesture detection with cultural haptic feedback
**Features**:
- Standard gestures (tap, double tap, long press, swipes)
- Haptic feedback patterns for different gestures
- Cultural gesture recognition (donation, community gestures)
- Vibration patterns for African cultural interactions

#### DonationGestureDetector
**Purpose**: Enhanced gesture detector for donation interactions
**Features**:
- Extends CulturalGestureDetector
- Special donation gesture recognition (downward swipe)
- Community gesture recognition (horizontal swipe)
- Enhanced haptic feedback for donation actions

### Core Widgets

#### ConnectivityBanner
**Purpose**: Network connectivity status indicator
**Components**:
- Red banner with "No internet connection" text
- SafeArea wrapper for proper display

## UI Patterns and Themes

### Material Design 3 Implementation
- Uses Material 3 design system
- Custom color scheme with cultural adaptations
- Consistent theming across all components

### Cultural Integration
- African motifs and symbols throughout the UI
- Ubuntu philosophy integration ("I am because we are")
- Cultural colors inspired by traditional African art
- Gesture patterns adapted for African cultural contexts

### Accessibility Features
- Screen reader support with TTS
- Progressive image loading with alt text
- Haptic feedback for interactions
- Cultural context announcements
- High contrast support through color schemes

### Responsive Design
- Adaptive layouts for different screen sizes
- Consistent spacing and padding
- Material Design breakpoints and guidelines

## Navigation

### Bottom Navigation Bar
**Items**:
1. Home (home icon)
2. Donate (volunteer_activism icon)
3. Rankings (leaderboard icon)
4. Community (chat icon)

### Route-based Navigation
- Go Router implementation
- Authentication guards
- Deep linking support
- Navigation observer for analytics

## Animation and Transitions

### Fade Animations
- Screen transitions with fade effects
- Loading state animations
- Progressive image fade-in

### Page Transitions
- Zoom transitions for Android
- Cupertino transitions for iOS
- Custom transitions for different platforms

## Error Handling

### Error States
- Network error displays
- Image loading error fallbacks
- Form validation error messages
- Authentication error handling

### Loading States
- Circular progress indicators
- Skeleton loading for lists
- Progressive loading for images

## Future Enhancements

### Screens to Implement
- Rankings Screen
- Marketplace Screen
- Enhanced Register Screen
- Donation History details
- Coin Store interface
- AI Dashboard analytics
- Profile editing
- Settings panels
- Community features

### Features to Add
- Dark theme implementation (partially defined)
- Advanced accessibility features
- Offline support
- Push notifications UI
- Gamification UI components
- Enhanced cultural adaptations

This specification covers all implemented screens and components as of the current codebase analysis.