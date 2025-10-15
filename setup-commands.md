# ChainGive Setup Commands

## Database Setup

1. **Apply the new schema:**
```bash
cd chaingive-backend
mysql -u root -p chaingive_db < database-schema-expansion.sql
```

2. **Update Prisma schema (if using Prisma):**
```bash
npx prisma db pull
npx prisma generate
```

## Backend Dependencies

3. **Install new dependencies:**
```bash
npm install inversify reflect-metadata winston express-validator axios crypto
npm install --save-dev @types/express-validator
```

4. **Update your dependency injection container:**
```typescript
// Add to your container.ts or similar file
container.bind('AnalyticsService').to(AnalyticsService);
container.bind('SocialService').to(SocialService);
container.bind('AIService').to(AIService);
container.bind('CryptoGatewayService').to(CryptoGatewayService);
```

## Environment Variables

5. **Add to your .env file:**
```env
# Crypto Gateway Configuration
BTCPAY_SERVER_URL=https://your-btcpay-server.com
BTCPAY_API_KEY=your_btcpay_api_key
BTCPAY_STORE_ID=your_store_id
BTCPAY_WEBHOOK_SECRET=your_webhook_secret

COINBASE_API_KEY=your_coinbase_commerce_api_key
CRYPTOMUS_MERCHANT_ID=your_cryptomus_merchant_id
CRYPTOMUS_API_KEY=your_cryptomus_api_key

# Africa's Talking (for notifications)
AFRICAS_TALKING_API_KEY=your_africas_talking_api_key
AFRICAS_TALKING_USERNAME=your_username

# Frontend URLs
FRONTEND_URL=http://localhost:3000
API_BASE_URL=http://localhost:8000
```

## Route Registration

6. **Add routes to your server.ts:**
```typescript
import { AnalyticsController } from './controllers/analytics.controller';
import { SocialController } from './controllers/social.controller';
import { AIController } from './controllers/ai.controller';
import { CryptoGatewayController } from './controllers/cryptoGateway.controller';

// Register routes
app.use('/api/analytics', analyticsRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/crypto', cryptoGatewayRoutes);
```

## Start Development Server

7. **Run the backend:**
```bash
npm run dev
```

## Test the New Endpoints

8. **Test analytics endpoint:**
```bash
curl -X POST http://localhost:8000/api/analytics/track \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"eventType": "user_login", "eventData": {"source": "mobile"}}'
```

9. **Test crypto gateway:**
```bash
curl -X GET http://localhost:8000/api/crypto/gateways \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Next Steps

After completing the setup:
1. Complete remaining merchant and corporate services
2. Add validation schemas
3. Implement webhook handlers
4. Begin Phase 2: Mobile Foundation