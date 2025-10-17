# User Roles & Credentials

## Role Definitions

### 1. Admin
- **Purpose**: Platform administration and management
- **Permissions**: Full system access, user management, KYC approval, analytics
- **Features**: Dashboard, reports, moderation tools

### 2. Donor
- **Purpose**: Regular users who donate to causes
- **Permissions**: Make donations, receive funds, participate in cycles
- **Features**: Donation history, wallet, challenges, rewards

### 3. Sponsor
- **Purpose**: Corporate entities providing bulk donations
- **Permissions**: Bulk donations, CSR campaigns, team management
- **Features**: Corporate dashboard, bulk donation tools, analytics

### 4. Agent
- **Purpose**: Local agents who sell charity coins
- **Permissions**: Sell coins, manage inventory, view sales
- **Features**: Agent dashboard, coin sales tracking, commission

## Test Accounts

| Role | Name | Email | Phone | Password | Tier |
|------|------|-------|-------|----------|------|
| **Admin** | Admin User | admin@chaingive.com | +2348012345678 | admin123 | 3 |
| **Donor** | John Doe | john.doe@example.com | +2348023456789 | user123 | 2 |
| **Donor** | Mary Jane | mary.jane@example.com | +2348056789012 | donor123 | 1 |
| **Sponsor** | TechCorp Nigeria | sponsor@chaingive.com | +2348045678901 | sponsor123 | 3 |
| **Agent** | Sarah Williams | agent@chaingive.com | +2348034567890 | agent123 | 2 |

## Login Examples

### Admin Login
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@chaingive.com","password":"admin123"}'
```

### Donor Login (Phone)
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"+2348023456789","password":"user123"}'
```

### Sponsor Login
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"sponsor@chaingive.com","password":"sponsor123"}'
```

### Agent Login
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"agent@chaingive.com","password":"agent123"}'
```

## Role-Based Features

### Admin Features
- User management (ban, unban, update)
- KYC verification approval/rejection
- Platform analytics & reports
- Feature flag management
- System configuration

### Donor Features
- Make donations
- Receive donations
- Join donation cycles
- Participate in challenges
- Earn rewards
- View leaderboard

### Sponsor Features
- Create bulk donation campaigns
- Manage corporate team members
- View CSR impact reports
- Track donation distribution
- Corporate analytics

### Agent Features
- Sell charity coins to users
- Manage coin inventory
- Track sales & commissions
- View agent dashboard
- Location-based services

## Database Schema

User roles are stored in the `User` table:
```sql
SELECT "firstName", "lastName", role, email 
FROM "User" 
ORDER BY role;
```

Default role for new users: **Donor**
