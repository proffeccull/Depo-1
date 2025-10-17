# Quick Start: HTTP/3 & Gamification

## 🚀 Installation

```bash
./setup-gamification.sh
```

## 📡 API Endpoints

### Fundraising Thermometer
```
GET /v1/fundraising/thermometer/:categoryId
```

### Leaderboard with Badges
```
GET /v1/fundraising/leaderboard?type=donations&period=week
```

### User Badges
```
GET /v1/fundraising/badges
Authorization: Bearer {token}
```

## 📱 Mobile Components

### Import Components
```tsx
import { FundraisingThermometer } from '@/components/FundraisingThermometer';
import { LeaderboardWithBadges } from '@/components/LeaderboardWithBadges';
import { BadgeDisplay } from '@/components/BadgeDisplay';
```

### Use Thermometer
```tsx
<FundraisingThermometer
  raised={5000}
  goal={10000}
  percentage={50}
  donorCount={45}
  title="Education Fund"
/>
```

### Use Leaderboard
```tsx
<LeaderboardWithBadges data={leaderboardData} />
```

### Use Badges
```tsx
<BadgeDisplay badges={userBadges} />
```

## 🔧 HTTP/3 Setup

1. Generate SSL certificates:
```bash
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes
```

2. Update `.env`:
```env
HTTP3_ENABLED=true
HTTP3_PORT=3443
SSL_CERT_PATH=/path/to/cert.pem
SSL_KEY_PATH=/path/to/key.pem
```

3. Restart server

## 🎯 Badge Tiers

| Tier | Amount | Icon |
|------|--------|------|
| Diamond | $10,000+ | 💎 |
| Platinum | $5,000+ | 🏆 |
| Gold | $1,000+ | 🥇 |
| Silver | $500+ | 🥈 |
| Bronze | $100+ | 🥉 |

## 🏆 Special Badges

- **Century Club** (💯): 100+ donations
- **Generous Giver** (🎁): 50+ donations
- **Regular Donor** (⭐): 10+ donations

## 📊 Testing

```bash
# Test thermometer
curl http://localhost:3000/v1/fundraising/thermometer/category-id

# Test leaderboard
curl http://localhost:3000/v1/fundraising/leaderboard

# Test badges (authenticated)
curl -H "Authorization: Bearer TOKEN" http://localhost:3000/v1/fundraising/badges
```

## 📖 Full Documentation

See `HTTP3-GAMIFICATION-IMPLEMENTATION.md` for complete details.
