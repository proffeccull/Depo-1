# Database Seeding Guide

## Quick Start

### 1. Apply Migrations First
```bash
npx prisma migrate deploy
```

### 2. Run Seed Script
```bash
npm run db:seed
```

## What Gets Seeded

### Users (3)
- **Admin** - admin@chaingive.com / admin123 (CSC Council role)
- **John Doe** - +2348023456789 / user123 (Beginner)
- **Sarah Agent** - agent@chaingive.com / agent123 (Agent role)

### Core Data
- ✅ User profiles & wallets
- ✅ Donation categories (Education, Healthcare, Food Security)
- ✅ Donation cycles & donations
- ✅ Transactions between users
- ✅ KYC records

### Premium Features
- ✅ **Merchant**: Sarah's Store with payment requests
- ✅ **Corporate**: TechCorp Nigeria with bulk donations
- ✅ **Social**: Lagos Givers circle with posts & comments
- ✅ **AI**: Donation timing recommendations
- ✅ **Analytics**: User login events

### Gamification
- ✅ Challenges & user completions
- ✅ Rewards & user claims
- ✅ Leaderboard rankings
- ✅ Referral system

### System
- ✅ Feature flags (AI, Social)
- ✅ Subscriptions (Premium plan)
- ✅ Notifications
- ✅ Admin actions log

## Test Credentials

| User | Login | Password | Role |
|------|-------|----------|------|
| Admin | admin@chaingive.com | admin123 | csc_council |
| John | +2348023456789 | user123 | beginner |
| Sarah | agent@chaingive.com | agent123 | agent |

## Verify Seeding

### Using Prisma Studio
```bash
npx prisma studio
```

### Using SQL
```bash
psql $DATABASE_URL -c "SELECT COUNT(*) FROM \"User\";"
```

## Re-seed Database

To clear and re-seed:
```bash
npx prisma migrate reset
npm run db:seed
```

⚠️ **Warning**: `migrate reset` will delete all data!

## Custom Seeding

Edit `prisma/seed.ts` to add more demo data or modify existing records.
