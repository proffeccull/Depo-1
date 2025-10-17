# Database Migration Guide - Premium Features

## Overview
This migration adds support for premium features including AI recommendations, merchant payments, corporate donations, and social features.

## New Tables Added

### AI & Analytics
- **AIRecommendation**: AI-powered donation and purchase recommendations
- **AnalyticsEvent**: Event tracking for user behavior analytics

### Merchant System
- **Merchant**: Merchant business profiles
- **MerchantPaymentRequest**: Payment requests from merchants to users
- **MerchantPayment**: Completed merchant payments

### Corporate System
- **Corporate**: Corporate account profiles
- **CorporateBulkDonation**: Bulk donation campaigns
- **CorporateTeamMember**: Corporate team member management

### Social Features
- **SocialCircle**: User groups/circles
- **SocialCircleMember**: Circle membership
- **SocialPost**: Social posts within circles
- **SocialComment**: Comments on posts
- **SocialLike**: Post likes
- **SocialCommentLike**: Comment likes

## Migration Steps

### 1. Apply Migration (When Database is Available)
```bash
cd chaingive-backend
npx prisma migrate deploy
```

### 2. Generate Prisma Client
```bash
npx prisma generate
```

### 3. Verify Migration
```bash
npx prisma migrate status
```

## Schema Changes

### User Model Updates
Added new relations to User model:
- `aiRecommendations`
- `merchant`
- `merchantPayments`
- `merchantPaymentRequests`
- `corporate`
- `corporateTeamMemberships`
- `createdSocialCircles`
- `socialCircleMemberships`
- `socialPosts`
- `socialComments`
- `socialLikes`
- `socialCommentLikes`

## Testing Checklist

- [ ] AI Recommendation endpoints
- [ ] Merchant registration and payment flows
- [ ] Corporate bulk donation processing
- [ ] Social circle creation and membership
- [ ] Social post creation and interactions
- [ ] Analytics event tracking

## Rollback

If needed, rollback using:
```bash
npx prisma migrate resolve --rolled-back 20251016211251_add_premium_features
```

## Notes

- All tables use `IF NOT EXISTS` to prevent errors on re-run
- Foreign key constraints ensure data integrity
- Indexes added for query performance
- Default values set for status fields
