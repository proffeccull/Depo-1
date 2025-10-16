# Security Configuration Guide

## Environment Variables Setup

### Required Variables
These must be set before running the application:

```bash
# Database
DATABASE_URL="postgresql://username:password@host:port/database"

# JWT Secrets (generate strong random strings)
JWT_SECRET="your-256-bit-secret"
JWT_REFRESH_SECRET="your-256-bit-refresh-secret"
```

### Generate Secure Secrets
```bash
# Generate JWT secrets
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Payment Provider Setup
```bash
# Flutterwave
FLUTTERWAVE_PUBLIC_KEY="FLWPUBK_TEST-xxx" # Test key
FLUTTERWAVE_SECRET_KEY="FLWSECK_TEST-xxx" # Test key
FLUTTERWAVE_ENCRYPTION_KEY="FLWSECK_TESTxxx"

# Paystack
PAYSTACK_PUBLIC_KEY="pk_test_xxx" # Test key
PAYSTACK_SECRET_KEY="sk_test_xxx" # Test key
```

### Email Configuration
```bash
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@domain.com"
SMTP_PASSWORD="your-app-password"
```

### AWS S3 Configuration
```bash
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="your-bucket-name"
```

## Security Checklist

- [ ] All hardcoded credentials removed
- [ ] Environment variables properly set
- [ ] Strong JWT secrets generated
- [ ] Production keys configured (not test keys)
- [ ] Database credentials secured
- [ ] CORS origins restricted
- [ ] Rate limiting enabled
- [ ] HTTPS enforced in production

## Never Commit
- `.env` files with real credentials
- Private keys
- API secrets
- Database passwords
- JWT secrets