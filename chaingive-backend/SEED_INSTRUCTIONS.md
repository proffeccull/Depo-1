# Database Seeding Instructions

## ⚠️ Database Connection Required

The seed script requires a working database connection. Current status:
- Database server: `aws-1-eu-north-1.pooler.supabase.com`
- Status: Connection failed (check credentials)

## Option 1: Fix Database Connection

### Update .env with correct credentials
```bash
# Get full database password from Supabase dashboard
DATABASE_URL="postgresql://postgres.yrqoaxadlomalmakwzsa:FULL_PASSWORD_HERE@aws-1-eu-north-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.yrqoaxadlomalmakwzsa:FULL_PASSWORD_HERE@aws-1-eu-north-1.pooler.supabase.com:5432/postgres"
```

### Then run:
```bash
# Apply migrations
npx prisma migrate deploy

# Seed database
npm run db:seed
```

## Option 2: Use Local PostgreSQL

### Install PostgreSQL locally
```bash
# Ubuntu/Debian
sudo apt install postgresql postgresql-contrib

# macOS
brew install postgresql
brew services start postgresql
```

### Update .env
```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/chaingive"
DIRECT_URL="postgresql://postgres:postgres@localhost:5432/chaingive"
```

### Create database and seed
```bash
# Create database
createdb chaingive

# Apply migrations
npx prisma migrate deploy

# Seed data
npm run db:seed
```

## Option 3: Use SQLite (Development Only)

### Update prisma/schema.prisma
```prisma
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}
```

### Update .env
```bash
DATABASE_URL="file:./dev.db"
```

### Run migrations and seed
```bash
npx prisma migrate dev --name init
npm run db:seed
```

## Verify Seeding

Once database is connected and seeded:

```bash
# View data in browser
npx prisma studio

# Check user count
npx prisma db execute --stdin <<< "SELECT COUNT(*) FROM \"User\";"
```

## What Gets Seeded

✅ 3 Users (Admin, User, Agent)
✅ Merchant with payment requests
✅ Corporate with bulk donations
✅ Social circles with posts
✅ AI recommendations
✅ Analytics events
✅ Challenges & rewards
✅ Leaderboard
✅ All other tables with sample data

## Test Credentials

After seeding:
- **Admin**: admin@chaingive.com / admin123
- **User**: +2348023456789 / user123
- **Agent**: agent@chaingive.com / agent123

## Troubleshooting

### Connection timeout
- Check if database server is running
- Verify firewall allows connection
- Confirm credentials are correct

### Migration errors
- Ensure database exists
- Check user has CREATE TABLE permissions
- Try `npx prisma migrate reset` (⚠️ deletes all data)

### Seed script errors
- Run `npx prisma generate` first
- Check all required fields are provided
- Verify foreign key relationships

## Need Help?

1. Check Supabase dashboard for correct connection string
2. Test connection: `npx prisma db pull`
3. View logs: Check terminal output for specific errors
