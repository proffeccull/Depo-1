**Version:** 2.2  
**Last Updated:** November 15, 2025  
**Status:** Enhanced for Development

---

## 📖 Table of Contents

1.  [Executive Summary](#1-executive-summary)
2.  [Product Overview](#2-product-overview)
3.  [User Experience (UX) and User Interface (UI) Design](#3-user-experience-ux-and-user-interface-ui-design)
4.  [Core Feature Specifications](#4-core-feature-specifications)
5.  [System Architecture](#5-system-architecture)
6.  [Security and Privacy Framework](#6-security-and-privacy-framework)
7.  [Implementation Roadmap](#7-implementation-roadmap)
8.  [Success Metrics & KPIs](#8-success-metrics--kpis)
9.  [Risk Management Plan](#9-risk-management-plan)
10. [Compliance Framework](#10-compliance-framework)
11. [Appendices](#11-appendices)

---

## 1. Executive Summary

ChainGive is a mobile-first, peer-to-peer giving platform designed to foster sustainable community support networks in Nigeria. It leverages the "pay it forward" model, allowing users to receive financial help in times of need and contribute back to the community when they are able. The platform is built on the principles of dignity and transparency, creating a system of ethical altruism without incurring debt.

This document outlines the complete specification for ChainGive v2.2, detailing a product that is secure, scalable, and intuitive. It introduces a modern, dark-themed user interface focused on clarity and data visualization to build user trust and engagement. The primary goal is to launch a Minimum Viable Product (MVP) in Lagos by Q2 2026, contingent on regulatory approval, with a five-year vision of empowering 500,000 active users and generating sustainable revenue through transaction fees and a value-added marketplace.

**Enhancements in v2.2 include:**
- AI-powered matching algorithms using scikit-learn for optimal donor-recipient pairing
- Community events with RSVP functionality and integrated fundraising
- Enhanced fraud detection with AI-driven anomaly detection
- Personalized marketplace recommendations based on analytics
- Advanced analytics features in My Impact screen
- Biometric authentication support for enhanced security
- Comprehensive testing suites (unit, integration, e2e tests)

---

## 2. Product Overview

### 2.1 Mission & Vision
*   **Mission:** To create sustainable community support networks where generosity flows forward, breaking the cycle of poverty through ethical peer-to-peer giving.
*   **Vision:** To be the leading platform for community-driven financial support in Africa, built on the philosophy of Ubuntu ("I am because we are").

### 2.2 Core Values
1.  **Dignity First:** Every feature is designed to be empowering and avoid shame.
2.  **Community Power:** Governance and support are rooted in local communities.
3.  **Absolute Transparency:** All transactions are logged and verifiable.
4.  **Radical Inclusivity:** The platform is designed to be accessible to all Nigerians, regardless of their banking status.

### 2.3 User Personas

#### **Primary Persona: Amaka (The Daily User)**
*   **Age:** 32
*   **Occupation:** Small-scale tailor
*   **Income:** ₦75,000/month
*   **Goals:** Cover unexpected expenses (medical bills, school fees for her children, sewing machine repairs) without falling into debt. She wants to be part of a community that supports each other.
*   **Tech Savviness:** Comfortable using smartphones for WhatsApp and social media. Needs a simple, clear interface with minimal jargon.

#### **Secondary Persona: Chike (The Agent)**
*   **Age:** 45
*   **Occupation:** Owns a local convenience store
*   **Income:** ₦150,000/month from his store
*   **Goals:** Earn a reliable secondary income by leveraging his position as a trusted community member. He wants to help his community access digital financial services safely.
*   **Role:** Onboard and verify new users, facilitate cash-to-digital (Charity Coin) conversions, and act as a local ChainGive ambassador.

#### **Tertiary Persona: Ngozi (The Community Leader)**
*   **Age:** 38
*   **Occupation:** Community organizer and small business owner
*   **Income:** ₦100,000/month
*   **Goals:** Promote ChainGive within her network to build trust and encourage participation. She seeks tools for tracking community impact and organizing local events.
*   **Tech Savviness:** Moderate; uses social media and basic apps regularly.

---

## 3. User Experience (UX) and User Interface (UI) Design

The design of ChainGive is engineered to inspire trust, promote clarity, and make financial data feel empowering. The aesthetic is modern, clean, and data-rich, drawing inspiration from leading neobank and fintech applications.

### 3.1 Design Philosophy
*   **Theme:** A **dark theme** will be used as the primary interface. This creates a premium, secure feel, reduces eye strain in low-light conditions, and allows vibrant accent colors and data visualizations to stand out.
*   **Clarity & Focus:** The layout will prioritize a clear visual hierarchy. Key information, such as balances and calls-to-action, will be prominent. Ample whitespace and a card-based structure will be used to organize information cleanly.
*   **Data as Empowerment:** Complex data will be presented through simple, elegant charts and graphs, enabling users to understand their impact and financial activity at a glance.

### 3.2 Design System

#### **Color Palette**
*   **Primary Background:** Deep Charcoal (`#121212`)
*   **Secondary Background (Cards):** Dark Grey (`#1E1E1E`)
*   **Primary Accent (Buttons, CTAs, Highlights):** Growth Green (`#2E8B57`)
*   **Secondary Accent (Links, Icons):** Trust Blue (`#007AFF`)
*   **Text (Primary):** Pure White (`#FFFFFF`)
*   **Text (Secondary):** Light Grey (`#8E8E93`)
*   **Chart Palette:** A vibrant, high-contrast palette of Violet, Yellow, and Red for chart segments.
*   **Semantic Colors:**
    *   **Success:** Growth Green (`#34C759`)
    *   **Error:** Bright Red (`#FF3B30`)

#### **Typography**
*   **Font Family:** Inter (A clean, highly legible sans-serif font).
*   **Scale & Weight:**
    *   **Display (Balances):** 34px, Medium
    *   **H1 (Screen Titles):** 28px, Bold
    *   **H2 (Card Titles):** 20px, SemiBold
    *   **Body:** 16px, Regular
    *   **Sub-headline:** 14px, SemiBold
    *   **Caption:** 12px, Regular

#### **Component Library**
*   **Buttons:**
    *   **Primary:** Solid `Growth Green` fill with white text. A subtle press-state animation (scale down to 0.98).
    *   **Secondary:** White outline with `Growth Green` text.
*   **Cards:** Use the `Dark Grey` background with a subtle border or drop shadow to create a sense of depth and separation from the main background.
*   **Navigation:** A clean bottom tab bar with four active-state icons: **Home, Give/Request, My Impact, Profile**.
*   **Input Fields:** A simple line at the bottom that turns `Growth Green` when active/focused.
*   **Lists:** Transaction and recipient lists will use circular avatars, clear typography for names and amounts, and secondary text for dates.

### 3.3 Core Screen Blueprints

#### **1. Home Dashboard**
*   **Layout:** A vertically scrolling screen providing an at-a-glance summary.
*   **Header:** "Hello, [Amaka]" with a user avatar and a notification bell icon on the right.
*   **Balance Card:** A prominent card at the top with a subtle green gradient. It will display **"Your Charity Coin Balance"** in the Display font size.
*   **Primary Actions:** Two large, distinct buttons directly below the balance card: "**Give Help**" and "**Request Help**".
*   **Recent Activity:** A section titled "Recent Activity" with a "See all" link. It will display the last 3-4 transactions in a vertical list of cards. Each card will show an icon (for give/receive), recipient/donor name, amount, and date.

#### **2. "My Impact" (Analytics) Screen**
*   **Layout:** A data-rich screen inspired by the best fintech analytics displays.
*   **Header:** "My Impact" title. A date range filter (e.g., "This Month") will be available.
*   **Primary Chart:** A large, animated donut chart visualizing the user's giving broken down by category (e.g., *Emergency, Education, Health*). The center will display the **"Total Given"** amount for the selected period.
*   **Giving Trend:** A simple bar chart below the donut chart showing giving activity over the past 7 days or 4 weeks.
*   **Impact Breakdown:** A list of giving categories with their total amounts and a slim progress bar indicating their percentage of the total giving, providing a detailed, scannable summary.

#### **3. Community Feed Screen (New in v2.2)**
*   **Layout:** A social-media-inspired feed to foster community engagement.
*   **Header:** "Community Feed" with a search icon and filter for categories.
*   **Feed Items:** Cards showing anonymized success stories, upcoming community events, or user testimonials. Each card includes a like/share button and a link to related actions (e.g., donate to a featured request).
*   **Interaction:** Users can post their own stories (moderated) to build trust and encourage participation.

#### **4. Enhanced "My Impact" (Analytics v2.2)**
*   **Advanced Features:** Interactive charts, geographic heatmaps, progress rings, detailed breakdowns, recipient stories, and achievement tracking.

#### **5. Event Details Screen (New in v2.2)**
*   **Layout:** Comprehensive event information with RSVP functionality and fundraising progress.
*   **Components:** Event metadata, attendee lists, donation tracking, and creator management tools.

#### **6. Marketplace Recommendations Screen (New in v2.2)**
*   **Layout:** Personalized item recommendations with AI-powered scoring and reasoning.
*   **Features:** Confidence indicators, recommendation reasons, and user interaction feedback.

---

## 4. Core Feature Specifications

### 4.1 User Onboarding & Authentication

*   **User Story:** As a new user, I want to create an account quickly and securely so I can start using the platform.
*   **UI/UX Flow:**
    1.  **Welcome Screen:** A clean screen with the ChainGive logo and the "Ubuntu" tagline. A single `Growth Green` "Get Started" button.
    2.  **Phone Number Entry:** A simple screen to input a phone number. The country code for Nigeria (+234) will be pre-selected.
    3.  **OTP Verification:** An auto-submitting 6-digit OTP input screen.
    4.  **Profile Creation:** A single screen asking for First Name, Last Name, and City.
    5.  **Tutorial:** A brief, skippable 3-screen interactive tutorial explaining the "Give -> Receive -> Pay it Forward" cycle.
*   **Acceptance Criteria:**
    *   User can create an account using only a valid Nigerian phone number.
    *   SMS OTP is delivered within 30 seconds.
    *   User can log in using their phone number and a new OTP.
    *   Session is managed securely using JWT with refresh tokens.

### 4.2 The Donation Cycle

#### **4.2.1 Requesting Help**
*   **User Story:** As Amaka, when I have an emergency, I want to easily request a specific amount of money and clearly state my need so the community can help me.
*   **UI/UX Flow:**
    1.  From the Home screen, tap the "**Request Help**" button.
    2.  **Amount Screen:** A screen with a large, editable number input for the amount. A slider can also be used for quick selection. Pre-set amount chips (e.g., ₦1000, ₦5000) are available.
    3.  **Details Screen:** The user selects a `Category` (e.g., Medical, Education, Business) from a dropdown and writes a short, optional `Message` explaining their need.
    4.  **Confirmation:** A summary screen shows the requested amount and details. A final "Confirm Request" button submits it to the matching engine.
*   **Acceptance Criteria:**
    *   Users can request amounts within the platform limits (e.g., ₦500 - ₦50,000).
    *   Requests are submitted to a "pending_match" state.
    *   The user receives a push notification when their request is matched with a donor.

#### **4.2.2 Giving Help**
*   **User Story:** As a user with a positive balance, I want to find and fund a request that resonates with me so I can help someone in the community.
*   **UI/UX Flow:**
    1.  From the Home screen, tap the "**Give Help**" button.
    2.  **Matching Screen:** The app presents a card-based view of an anonymized request matched by the AI. The card displays the requested `Amount`, `Category`, `Message`, and the recipient's `Trust Score`.
    3.  **Actions:** The user has two options: "**Accept & Give**" or "**See Another**" to get a new match.
    4.  **Confirmation:** Tapping "Accept & Give" brings up a confirmation modal. On confirmation, funds are moved from the user's wallet to a secure escrow.
*   **Acceptance Criteria:**
    *   The AI matching algorithm prioritizes users based on location, need, and trust score.
    *   Funds are successfully transferred to an escrow wallet upon donor confirmation.
    *   Both donor and recipient are notified of the successful match and fund transfer to escrow.
    *   Recipient must confirm receipt of funds (after cash-out via an agent, if applicable) for funds to be released from escrow to them.

### 4.3 Charity Coin & Marketplace

*   **User Story:** As a user who has given to the community, I want to use my earned Charity Coins to get real-world value, like mobile airtime or grocery vouchers.
*   **UI/UX Flow:**
    1.  Navigate to the "**Profile**" tab and select "**Marketplace**".
    2.  **Marketplace Home:** A visually engaging grid of cards, each representing a redemption option (e.g., "MTN Airtime," "Shoprite Voucher"). A filter bar at the top allows sorting by category.
    3.  **Item Details:** Tapping a card opens a detail screen with a description of the item and its cost in Charity Coins.
    4.  **Redemption:** A clear "Redeem for [X] Coins" button initiates the transaction. A success screen displays the voucher code or confirmation.
*   **Acceptance Criteria:**
    *   Users earn a set amount of Charity Coins for every completed donation cycle they fund.
    *   The user's Charity Coin balance must be sufficient for the redemption.
    *   Redemptions are processed instantly, and the user's coin balance is updated in real-time.

### 4.4 Community Features (New in v2.2)

*   **User Story:** As Ngozi, I want to engage with my community through ChainGive to share stories and organize support events.
*   **Features:**
    *   **Community Feed:** A moderated feed for sharing success stories and event announcements.
    *   **Event Creation:** Agents and verified users can create local events (e.g., donation drives) with RSVP functionality.
    *   **Event Donations:** Direct fundraising integration with donation cycles.
    *   **Leaderboards:** Monthly leaderboards for top givers and recipients to gamify participation.
*   **Acceptance Criteria:**
    *   All posts are moderated to ensure dignity and prevent misuse.
    *   Events integrate with the donation cycle for seamless fundraising.
    *   Users can RSVP to events and track attendance.
    *   Event creators can manage attendees and fundraising progress.

### 4.5 AI-Powered Features (New in v2.2)

#### **4.5.1 AI Matching Algorithm**
*   **Description:** Uses scikit-learn to optimize donor-recipient matching based on multiple weighted factors.
*   **Features:**
    - Location proximity (30% weight)
    - Trust score (25% weight)
    - Time waiting urgency (20% weight)
    - Donor preferences (15% weight)
    - Randomization for fairness (10% weight)
*   **API Endpoints:** Integrated with `match.controller.ts` for real-time matching.

#### **4.5.2 Fraud Detection with AI**
*   **Description:** AI-driven anomaly detection using transaction pattern analysis.
*   **Features:**
    - Real-time transaction scoring
    - Behavioral pattern analysis
    - Network attack detection
    - Statistical anomaly detection
*   **Integration:** Backend analytics with scikit-learn models.

#### **4.5.3 Personalized Marketplace**
*   **Description:** AI-powered recommendations based on user behavior and analytics.
*   **Features:**
    - Personalized item suggestions
    - Category recommendations
    - Trend analysis and insights
    - User interaction feedback loop
*   **Analytics:** Comprehensive marketplace performance tracking.

### 4.6 Security Enhancements (New in v2.2)

#### **4.6.1 Biometric Authentication**
*   **Features:**
    - Fingerprint recognition for login
    - Face ID support
    - Biometric fallback to PIN
    - Secure key storage
*   **Integration:** Mobile and web applications with platform-specific biometric APIs.

---

## 5. System Architecture

### 5.1 Technology Stack
*   **Frontend (Mobile):** React Native 0.72+ with Redux Toolkit & RTK Query.
*   **Backend (API):** Node.js 18+ with TypeScript, Express.js, and Prisma ORM.
*   **Database:** PostgreSQL 15+ for relational data, Redis 7+ for caching and job queues.
*   **Infrastructure:** Deployed via Docker containers on Railway (primary) and AWS (backup), with Cloudflare for CDN and security.
*   **Monitoring & Logging:** Sentry for error tracking, DataDog for performance metrics.
*   **AI/ML:** Python with scikit-learn for matching algorithms and fraud detection.

### 5.2 API Architecture
The API will be a versioned RESTful service.

**Endpoint Structure:** `/api/v1/`

**Core Endpoints:**
*   `/auth/`: User registration, login, token refresh, biometric authentication.
*   `/users/`: Profile management, trust score display.
*   `/cycles/`: Creating requests, accepting donations, AI matching logic.
*   `/transactions/`: Financial ledger for all movements (deposits, donations, fees).
*   `/marketplace/`: Item listings, redemptions, personalized recommendations.
*   `/agents/`: Verification workflows, coin sales.
*   `/community/`: Feed management, event creation, RSVP functionality.
*   `/analytics/`: User impact tracking, marketplace insights, fraud monitoring.

**New Endpoints in v2.2:**
*   `/community/events`: Event CRUD operations
*   `/community/events/:id/rsvp`: Event RSVP management
*   `/community/events/:id/donate`: Event fundraising donations
*   `/marketplace/recommendations`: AI-powered personalized recommendations
*   `/marketplace/analytics`: Marketplace performance insights
*   `/fraud/check`: Real-time fraud assessment (internal)

---

## 6. Security and Privacy Framework

*   **Authentication & Authorization:**
    *   **JWT System:** Short-lived access tokens (15 mins) and securely stored, rotating refresh tokens (30 days).
    *   **Biometric Authentication:** Fingerprint and Face ID support for enhanced login security.
    *   **Multi-Factor Authentication (MFA):** Mandatory SMS OTP for login and high-value transactions.
*   **Data Protection:**
    *   **Encryption:** All data is encrypted at rest (AES-256) and in transit (TLS 1.3). Sensitive user data will have an additional layer of application-level encryption.
    *   **Data Minimization:** We will only collect data that is absolutely necessary for the functioning of the service.
*   **Fraud Prevention:**
    *   **AI-Driven Anomaly Detection:** Real-time transaction monitoring with machine learning models to identify unusual patterns.
    *   **Velocity Checks:** Multi-tier transaction rate limiting based on time windows.
    *   **Behavioral Analysis:** User behavior pattern recognition to detect account compromise.
    *   **Network Monitoring:** Detection of coordinated attacks and suspicious IP patterns.
*   **Privacy & Compliance:**
    *   Full compliance with the Nigeria Data Protection Regulation (NDPR).
    *   Users will have self-service tools to access, amend, or delete their data, in line with their data subject rights.

---

## 7. Implementation Roadmap

This roadmap outlines parallel workstreams for a realistic 5-month MVP launch.

| Month | Engineering Track | Product & Design Track | Business & Operations Track |
| :--- | :--- | :--- | :--- |
| **1. Setup** | - Setup dev env & CI/CD<br>- DB schema v1<br>- User authentication | - Finalize MVP UI mockups & prototypes<br>- Conduct initial user interviews | - **Initiate Money Transfer License app**<br>- Draft agent onboarding criteria |
| **2. Core Logic** | - Build donation request engine<br>- Implement AI matching v1<br>- Agent verification workflow | - Usability testing on prototypes<br>- Refine UI based on feedback<br>- Write all in-app copy | - Begin sourcing initial agent partners<br>- Legal review of user T&Cs |
| **3. Payments** | - Integrate Flutterwave<br>- Implement multi-sig escrow<br>- Charity Coin ledger backend | - Design marketplace UI<br>- Create onboarding tutorial content | - Develop agent training materials<br>- Setup compliance monitoring tools |
| **4. Frontend**| - Build all mobile app screens<br>- Connect frontend to APIs<br>- Implement push notifications | - Conduct internal UAT<br>- Finalize app store assets | - Finalize contracts with 20+ agents<br>- Train first cohort of agents |
| **5. Test & Deploy**| - End-to-end testing<br>- Security audit & pen testing<br>- Deploy to app stores | - Coordinate external beta test (50 users)<br>- Prepare user guides & FAQ | - Onboard first 500 users<br>- **Go-live in Lagos (closed beta)** |

**v2.2 Enhancements Timeline:**
- **Month 1-2:** AI matching algorithm, community events backend
- **Month 2-3:** Fraud detection AI, marketplace personalization
- **Month 3-4:** Biometric auth, advanced analytics, mobile app updates
- **Month 4-5:** Comprehensive testing, UI/UX refinements, deployment

---

## 8. Success Metrics & KPIs

*   **User Growth & Retention:**
    *   **Monthly Active Users (MAU):** 50K by end of Year 1.
    *   **Day 30 Retention:** > 35%.
*   **Product Engagement:**
    *   **Donation Cycles per Active User per Month:** > 1.5.
    *   **Giver to Recipient Ratio:** Maintain > 1.2 to ensure ecosystem health.
    *   **Community Events:** 500+ events created monthly by Year 2.
    *   **Marketplace Conversion:** 15% of earned coins redeemed.
*   **Financial & Operational:**
    *   **Customer Acquisition Cost (CAC):** < ₦2,000.
    *   **LTV/CAC Ratio:** > 3.
    *   **Fraudulent Transaction Rate:** < 0.5%.
    *   **System Uptime:** > 99.9%.
    *   **AI Matching Accuracy:** > 85% user satisfaction rate.

---

## 9. Risk Management Plan

| Risk | Level | Likelihood | Mitigation Strategy |
| :--- | :--- | :--- | :--- |
| **Regulatory Non-Compliance** | Critical | Medium | Prioritize obtaining the Money Transfer License before launch. Retain expert legal counsel. |
| **Community Imbalance** | Critical | High | Implement gamification and a trust score that heavily rewards giving. AI matching prioritizes givers. |
| **Payment & Security Fraud**| High | High | Multi-sig escrow wallets, AI-powered real-time fraud detection, quarterly security audits. |
| **Low User Adoption** | High | Medium | Invest in community-based marketing, create a seamless onboarding experience, and leverage the agent network for trust-building. |
| **AI Model Accuracy** | Medium | Medium | Implement fallback rule-based systems, continuous model training, and user feedback loops. |
| **Data Privacy Compliance** | High | Low | Regular NDPR audits, data minimization practices, and transparent privacy policies. |

---

## 10. Compliance Framework

The ChainGive platform will operate in full compliance with all relevant Nigerian regulations.

*   **Money Transfer License:** This is the most critical regulatory requirement. The application process will be initiated in Month 1 of the development roadmap and is a mandatory prerequisite for public launch.
*   **NDPR:** A Data Protection Officer will be appointed. The platform will undergo an annual audit to ensure compliance with data protection laws.
*   **AML/CFT:** The platform will implement KYC procedures (via agents) and continuous transaction monitoring to prevent money laundering and terrorist financing.
*   **PCI DSS:** While we will use compliant payment processors like Flutterwave and will not store card details directly, we will adhere to best practices to ensure the security of the payment ecosystem.

---

## 11. Appendices

### Appendix A: API Endpoint Examples

**AI Matching Endpoint:**
```
POST /api/v1/cycles/match
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "donorId": "uuid",
  "amount": 5000,
  "preferences": {
    "location": "Lagos",
    "category": "education"
  }
}
```

**Event Creation Endpoint:**
```
POST /api/v1/community/events
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "title": "Community Health Drive",
  "description": "Free medical checkups for our community",
  "eventDate": "2025-12-01",
  "eventTime": "10:00",
  "location": "Lagos Community Center",
  "maxAttendees": 100,
  "eventType": "fundraising",
  "fundraisingGoal": 50000
}
```

**Personalized Recommendations Endpoint:**
```
GET /api/v1/marketplace/recommendations?limit=10&category=airtime
Authorization: Bearer <jwt_token>
```

### Appendix B: Database Schema Extensions (v2.2)

**Community Events:**
```sql
CREATE TABLE community_events (
  id UUID PRIMARY KEY,
  creator_id UUID REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  event_time TIME NOT NULL,
  location VARCHAR(255) NOT NULL,
  max_attendees INTEGER,
  current_attendees INTEGER DEFAULT 0,
  event_type VARCHAR(50) DEFAULT 'community',
  fundraising_goal DECIMAL(12,2),
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE event_rsvps (
  id UUID PRIMARY KEY,
  event_id UUID REFERENCES community_events(id),
  user_id UUID REFERENCES users(id),
  status VARCHAR(20) DEFAULT 'attending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);
```

**Marketplace Interactions:**
```sql
CREATE TABLE marketplace_interactions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  item_id UUID REFERENCES marketplace_items(id),
  action VARCHAR(20) NOT NULL,
  rating DECIMAL(2,1),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_interaction TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Appendix C: AI Model Specifications

**Matching Algorithm Features:**
- Location proximity (30% weight)
- Trust score (25% weight)
- Time waiting urgency (20% weight)
- Donor preferences (15% weight)
- Randomization (10% weight)

**Fraud Detection Features:**
- Transaction amount anomalies
- Velocity patterns (transactions per time window)
- Geographic inconsistencies
- Device fingerprint changes
- Behavioral pattern deviations
- Network analysis for attack patterns

**Recommendation Engine Features:**
- Purchase history analysis
- Donation pattern matching
- Category preferences
- Temporal trends
- Social proof indicators
- Price sensitivity modeling

### Appendix D: Testing Strategy (v2.2)

**Unit Tests:**
- AI algorithm accuracy validation
- Fraud detection rule testing
- API endpoint response validation
- Database operation verification

**Integration Tests:**
- End-to-end donation cycles
- AI matching workflow
- Community event creation and RSVP
- Marketplace recommendation flow

**E2E Tests:**
- Complete user journeys
- Cross-platform compatibility
- Performance under load
- Security vulnerability assessment

**AI Model Testing:**
- Model accuracy benchmarks
- A/B testing frameworks
- Continuous learning validation
- Fallback mechanism verification