# Prisma Database Management

## Setup & Seeding

### First Time Setup
```bash
# 1. Apply migrations
npx prisma migrate deploy

# 2. Seed demo data
npm run db:seed

# 3. Open Prisma Studio to view data
npx prisma studio
```

## Seed Data Overview

The seed script (`seed.ts`) creates comprehensive demo data:

### Users (3)
- Admin (CSC Council) - Full access
- John Doe (Beginner) - Regular user
- Sarah Agent (Agent) - Coin seller

### All Tables Populated
✅ User profiles & wallets
✅ Donations & cycles
✅ Transactions
✅ KYC records
✅ Merchant system
✅ Corporate donations
✅ Social circles & posts
✅ AI recommendations
✅ Analytics events
✅ Challenges & rewards
✅ Leaderboard
✅ Subscriptions
✅ Feature flags
✅ Notifications

## Commands

```bash
# Generate Prisma Client
npx prisma generate

# Apply migrations
npx prisma migrate deploy

# Create new migration
npx prisma migrate dev --name description

# Seed database
npm run db:seed

# Reset & reseed (⚠️ deletes all data)
npx prisma migrate reset

# Open database GUI
npx prisma studio

# Validate schema
npx prisma validate
```

## Files

- `schema.prisma` - Database schema definition
- `seed.ts` - Demo data seeding script
- `migrations/` - Migration history
