# Server Start Instructions

## ✅ HTTP/3 Configuration Complete

SSL certificates generated and .env configured.

## Database Setup (First Time)

### 1. Apply Migrations
```bash
cd chaingive-backend
npx prisma migrate deploy
```

### 2. Seed Demo Data
```bash
npm run db:seed
```

This creates:
- 3 demo users (admin, user, agent)
- Merchant & corporate accounts
- Social circles with posts
- AI recommendations
- Challenges, rewards & leaderboard

**Test Credentials:**
- Admin: admin@chaingive.com / admin123
- User: +2348023456789 / user123
- Agent: agent@chaingive.com / agent123

## Start Server

### Development Mode (Recommended)
```bash
cd chaingive-backend
npm run dev
```

### Production Mode
```bash
cd chaingive-backend
npm run build
npm start
```

## Verify HTTP/3

Once server is running:

```bash
# Check health
curl http://localhost:3000/health

# Expected response includes:
{
  "status": "healthy",
  "protocols": {
    "http1": true,
    "http2": true,
    "http3": true
  }
}
```

## Ports

- **3000**: HTTP/1.1 (always available)
- **3443**: HTTP/2 + HTTP/3 (with SSL)

## Current Status

✅ HTTP/3 enabled in .env
✅ SSL certificates created
✅ Configuration complete

**Ready to start!**

Run: `npm run dev` in chaingive-backend directory
