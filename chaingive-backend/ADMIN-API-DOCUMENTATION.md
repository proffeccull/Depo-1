# ChainGive Admin API Documentation

## Overview

This document provides comprehensive OpenAPI 3.0 specification for all ChainGive admin endpoints. The admin API is organized into several modules:

- **Core Admin** (`admin.controller.ts`) - User management, KYC, analytics
- **Advanced Admin** (`adminAdvanced.controller.ts`) - Role management, feature flags, audit logs
- **Coin Management** (`adminCoin.controller.ts`) - Coin purchases, wallets, minting/burning
- **God Mode** (`adminGodMode.controller.ts`) - Override operations (highest privilege)
- **System Admin** (`adminSystem.controller.ts`) - Health monitoring, maintenance

## Authentication

All admin endpoints require JWT authentication with admin role (`csc_council` or `agent`). God Mode endpoints require `csc_council` role only.

```yaml
components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
      description: JWT token obtained from /auth/login endpoint
```

## API Endpoints

### Core Admin Endpoints

#### User Management

**GET /admin/users**
- **Summary**: Get all users with filters and pagination
- **Parameters**:
  - `page` (query, integer, default: 1)
  - `limit` (query, integer, default: 20)
  - `role` (query, string) - Filter by user role
  - `tier` (query, integer) - Filter by user tier (1-3)
  - `kycStatus` (query, string) - Filter by KYC status
  - `isActive` (query, boolean) - Filter by active status
  - `isBanned` (query, boolean) - Filter by banned status
  - `city` (query, string) - Filter by city
  - `search` (query, string) - Search in name, phone, email
- **Response**: Paginated user list with full user details

**GET /admin/users/{userId}**
- **Summary**: Get detailed user information with activity history
- **Parameters**:
  - `userId` (path, string, required) - User UUID
- **Response**: Complete user profile with cycles, transactions, KYC records

**POST /admin/users/{userId}/ban**
- **Summary**: Ban a user account
- **Parameters**:
  - `userId` (path, string, required)
- **Body**:
  ```json
  {
    "reason": "Violation of terms of service"
  }
  ```

**POST /admin/users/{userId}/unban**
- **Summary**: Unban a user account
- **Parameters**:
  - `userId` (path, string, required)

**POST /admin/users**
- **Summary**: Create new user (admin only)
- **Body**:
  ```json
  {
    "phoneNumber": "+2348012345678",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "beginner",
    "tier": 1,
    "locationCity": "Lagos",
    "locationState": "Lagos",
    "isActive": true
  }
  ```

**PATCH /admin/users/{userId}**
- **Summary**: Update user details
- **Parameters**:
  - `userId` (path, string, required)
- **Body**: Partial user update object

**DELETE /admin/users/{userId}**
- **Summary**: Soft delete user account
- **Parameters**:
  - `userId` (path, string, required)
- **Body**:
  ```json
  {
    "reason": "Account closure requested"
  }
  ```

**GET /admin/users/{userId}/permissions**
- **Summary**: Get user permissions and roles
- **Response**: Role-based and tier-based permissions

#### KYC Management

**GET /admin/kyc/pending**
- **Summary**: Get pending KYC verifications
- **Parameters**:
  - `limit` (query, integer, default: 50)

**POST /admin/kyc/{kycId}/approve**
- **Summary**: Approve KYC verification

**POST /admin/kyc/{kycId}/reject**
- **Summary**: Reject KYC verification
- **Body**:
  ```json
  {
    "reason": "Document quality insufficient"
  }
  ```

#### Analytics & Reports

**GET /admin/dashboard/stats**
- **Summary**: Get platform dashboard statistics
- **Response**: Overview metrics, today's stats, pending items

**GET /admin/reports/revenue**
- **Summary**: Get revenue report
- **Parameters**:
  - `startDate` (query, date)
  - `endDate` (query, date)

**GET /admin/reports/user-growth**
- **Summary**: Get user growth metrics
- **Parameters**:
  - `period` (query, string, enum: 7d, 30d, 90d, default: 30d)

#### Donation Management

**PATCH /admin/donations/{transactionId}/override**
- **Summary**: Override donation transaction status
- **Parameters**:
  - `transactionId` (path, string, required)
- **Body**:
  ```json
  {
    "amount": 50000,
    "status": "completed",
    "reason": "Manual correction for processing error"
  }
  ```

### Advanced Admin Endpoints

#### User Role Management

**POST /admin/advanced/users/{userId}/promote-to-agent**
- **Summary**: Promote user to agent role

**PATCH /admin/advanced/users/{userId}/role**
- **Summary**: Update user role
- **Body**:
  ```json
  {
    "role": "power_partner"
  }
  ```

#### Feature Flags

**GET /admin/advanced/features**
- **Summary**: Get all feature flags

**POST /admin/advanced/features/toggle**
- **Summary**: Toggle feature flag
- **Body**:
  ```json
  {
    "featureName": "gamification_system",
    "isEnabled": true
  }
  ```

#### Audit Logs

**GET /admin/advanced/logs**
- **Summary**: Get admin action logs
- **Parameters**:
  - `limit` (query, integer, default: 100)
  - `actionType` (query, string)

#### Leaderboard Management

**POST /admin/advanced/leaderboard/reset**
- **Summary**: Reset entire leaderboard
- **Body**:
  ```json
  {
    "reason": "Monthly competition reset"
  }
  ```

**PATCH /admin/advanced/leaderboard/users/{userId}/score**
- **Summary**: Adjust user leaderboard score
- **Body**:
  ```json
  {
    "scoreAdjustment": 500,
    "reason": "Bonus for community contribution"
  }
  ```

### Coin Management Endpoints

#### Purchase Management

**GET /admin/coins/purchases/pending**
- **Summary**: Get pending coin purchase requests

**GET /admin/coins/purchases**
- **Summary**: Get all coin purchase requests with filters

**POST /admin/coins/purchases/{purchaseId}/approve**
- **Summary**: Approve coin purchase and credit agent
- **Body**:
  ```json
  {
    "notes": "Payment verified via blockchain"
  }
  ```

**POST /admin/coins/purchases/{purchaseId}/reject**
- **Summary**: Reject coin purchase
- **Body**:
  ```json
  {
    "rejectionReason": "Invalid transaction hash"
  }
  ```

#### Wallet Management

**GET /admin/coins/wallets**
- **Summary**: Get crypto wallet addresses

**POST /admin/coins/wallets**
- **Summary**: Create crypto wallet address
- **Body**:
  ```json
  {
    "currency": "BTC",
    "network": "Bitcoin",
    "address": "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
    "qrCodeUrl": "https://example.com/qr/btc-wallet"
  }
  ```

**DELETE /admin/coins/wallets/{walletId}**
- **Summary**: Deactivate crypto wallet

#### Coin Operations

**GET /admin/coins/stats**
- **Summary**: Get platform coin statistics

**POST /admin/coins/agents/{agentId}/mint**
- **Summary**: Mint coins to agent (admin override)
- **Body**:
  ```json
  {
    "amount": 10000,
    "reason": "Initial coin allocation"
  }
  ```

**POST /admin/coins/agents/{agentId}/burn**
- **Summary**: Burn coins from agent (admin override)
- **Body**:
  ```json
  {
    "amount": 5000,
    "reason": "Coin redemption adjustment"
  }
  ```

**POST /admin/coins/agents/transfer**
- **Summary**: Transfer coins between agents
- **Body**:
  ```json
  {
    "fromAgentId": "uuid-1",
    "toAgentId": "uuid-2",
    "amount": 2500,
    "reason": "Agent inventory rebalancing"
  }
  ```

### God Mode Endpoints (CSC Council Only)

#### Transaction Overrides

**PATCH /admin/god-mode/transactions/{transactionId}/status**
- **Summary**: Override any transaction status (bypasses all validations)
- **Body**:
  ```json
  {
    "status": "completed",
    "notes": "Emergency transaction completion"
  }
  ```

**POST /admin/god-mode/escrows/{escrowId}/release**
- **Summary**: Force release any escrow
- **Body**:
  ```json
  {
    "reason": "Emergency escrow release required"
  }
  ```

#### Balance Overrides

**PATCH /admin/god-mode/users/{userId}/balance**
- **Summary**: Override user balance (add/subtract any amount)
- **Body**:
  ```json
  {
    "amount": 50000,
    "reason": "Account correction",
    "balanceType": "wallet"
  }
  ```

**PATCH /admin/god-mode/users/{userId}/verification**
- **Summary**: Override user verification status
- **Body**:
  ```json
  {
    "tier": 3,
    "kycStatus": "approved",
    "trustScore": 4.5,
    "reason": "Manual verification override"
  }
  ```

#### Destructive Operations

**DELETE /admin/god-mode/records/{tableName}/{recordId}**
- **Summary**: Force delete any record (bypasses foreign key constraints)
- **Body**:
  ```json
  {
    "reason": "Data cleanup - duplicate record"
  }
  ```

#### Database Operations

**POST /admin/god-mode/database/query**
- **Summary**: Execute raw SQL query (READ-ONLY)
- **Body**:
  ```json
  {
    "query": "SELECT COUNT(*) FROM users WHERE created_at > $1",
    "params": ["2024-01-01"]
  }
  ```

### System Admin Endpoints

#### Health Monitoring

**GET /admin/system/health**
- **Summary**: Get comprehensive system health overview

**GET /admin/system/health/database**
- **Summary**: Get detailed database health metrics

**GET /admin/system/metrics**
- **Summary**: Get application performance metrics
- **Parameters**:
  - `period` (query, string, enum: 1h, 24h, 7d, default: 1h)

**GET /admin/system/logs**
- **Summary**: Get system logs with filtering
- **Parameters**:
  - `level` (query, string, default: error)
  - `limit` (query, integer, default: 100)
  - `startDate` (query, date-time)
  - `endDate` (query, date-time)

#### Maintenance

**POST /admin/system/maintenance**
- **Summary**: Trigger system maintenance operations
- **Body**:
  ```json
  {
    "action": "cleanup",
    "reason": "Regular system maintenance"
  }
  ```

**GET /admin/system/backup**
- **Summary**: Get backup status and history

## Error Responses

All endpoints return errors in the following format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {}
  }
}
```

### Common Error Codes

- `USER_NOT_FOUND` (404) - User does not exist
- `TRANSACTION_NOT_FOUND` (404) - Transaction does not exist
- `PURCHASE_NOT_FOUND` (404) - Coin purchase not found
- `AGENT_NOT_FOUND` (404) - Agent not found
- `INVALID_AMOUNT` (400) - Invalid amount provided
- `INVALID_STATUS` (400) - Invalid status value
- `INSUFFICIENT_BALANCE` (400) - Insufficient balance for operation
- `MISSING_TX_HASH` (400) - Transaction hash required but missing
- `ALREADY_APPROVED` (400) - Resource already approved
- `ALREADY_REJECTED` (400) - Resource already rejected
- `ALREADY_DEACTIVATED` (400) - User already deactivated
- `CONFIG_ERROR` (500) - Configuration error
- `BACKUP_FAILED` (500) - Backup operation failed

## Data Schemas

### User Object
```json
{
  "id": "uuid",
  "phoneNumber": "+2348012345678",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "beginner",
  "tier": 1,
  "trustScore": 4.2,
  "totalCyclesCompleted": 15,
  "totalDonated": 150000,
  "totalReceived": 120000,
  "charityCoinsBalance": 5000,
  "kycStatus": "approved",
  "isActive": true,
  "isBanned": false,
  "locationCity": "Lagos",
  "locationState": "Lagos",
  "createdAt": "2024-01-01T00:00:00Z",
  "lastLoginAt": "2024-01-15T10:30:00Z"
}
```

### Transaction Object
```json
{
  "id": "uuid",
  "fromUserId": "uuid",
  "toUserId": "uuid",
  "amount": 50000,
  "status": "completed",
  "type": "donation",
  "notes": "Charity donation",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

### Coin Purchase Object
```json
{
  "id": "uuid",
  "agentId": "uuid",
  "quantity": 10000,
  "totalPrice": 100000,
  "currency": "NGN",
  "status": "confirmed",
  "txHash": "0x123...",
  "paymentMethod": "crypto",
  "createdAt": "2024-01-01T00:00:00Z",
  "approvedAt": "2024-01-01T01:00:00Z"
}
```

### System Health Object
```json
{
  "timestamp": "2024-01-01T00:00:00Z",
  "uptime": 86400,
  "environment": "production",
  "version": "1.0.0",
  "services": {
    "database": {
      "status": "healthy",
      "responseTime": "45ms"
    },
    "redis": {
      "status": "healthy",
      "memory": "256MB"
    }
  },
  "system": {
    "memory": {
      "rss": "512MB",
      "heapUsed": "256MB",
      "usagePercent": 50
    },
    "cpu": {
      "cores": 4,
      "usage": "25%"
    }
  }
}
```

## Security Considerations

1. **God Mode Access**: Only CSC Council members should have access to God Mode endpoints
2. **Audit Logging**: All admin actions are logged in the `adminAction` table
3. **Rate Limiting**: Consider implementing rate limiting for admin endpoints
4. **Input Validation**: All inputs are validated using Joi schemas
5. **SQL Injection Protection**: Raw queries are restricted to read-only operations

## Usage Examples

### Approve KYC Verification
```bash
curl -X POST \
  https://api.chaingive.com/admin/kyc/kyc-123/approve \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get Dashboard Statistics
```bash
curl -X GET \
  https://api.chaingive.com/admin/dashboard/stats \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Mint Coins to Agent
```bash
curl -X POST \
  https://api.chaingive.com/admin/coins/agents/agent-123/mint \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 5000,
    "reason": "Monthly coin distribution"
  }'
```

This documentation provides a complete reference for all admin API endpoints. For implementation details, refer to the controller files and route definitions.