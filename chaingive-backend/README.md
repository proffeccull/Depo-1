# ChainGive Backend API v2.2.0

A comprehensive microservices-based backend for the ChainGive peer-to-peer giving platform, designed to foster sustainable community support networks in Nigeria.

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Quick Start](#quick-start)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Deployment](#deployment)
- [Monitoring](#monitoring)
- [Security](#security)
- [Contributing](#contributing)

## 🎯 Overview

ChainGive is a mobile-first platform that leverages the "pay it forward" model to create sustainable community support networks. Users can receive financial help during times of need and contribute back to the community when they're able.

**Version 2.2.0** introduces AI-powered matching, enhanced community features, advanced marketplace functionality, and comprehensive fraud detection.

## 🏗️ Architecture

### Microservices Design

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   API Gateway   │    │  Auth Service   │    │  User Service   │
│   (Express)     │    │   (JWT/OAuth)   │    │   (Profiles)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │ Core Services  │
                    │ - Donations    │
                    │ - Community    │
                    │ - Marketplace  │
                    │ - Analytics    │
                    │ - Fraud Detect │
                    └─────────────────┘
                             │
                    ┌─────────────────┐
                    │   Database     │
                    │ (PostgreSQL)   │
                    └─────────────────┘
```

### Service Boundaries

- **API Gateway**: Request routing, rate limiting, authentication
- **Auth Service**: User authentication, authorization, biometric support
- **Core Services**: Business logic for donations, community, marketplace
- **Analytics**: User behavior tracking, AI model performance
- **Fraud Detection**: Real-time monitoring, risk assessment

## ✨ Features

### Core Functionality
- ✅ **Peer-to-Peer Donations**: Secure donation cycles with escrow
- ✅ **AI Matching**: Smart donor-recipient pairing using scikit-learn
- ✅ **Charity Coins**: Earned rewards for completed donation cycles
- ✅ **Community Events**: Event creation, RSVP, and fundraising integration

### Enhanced Features (v2.2)
- 🎯 **Advanced Analytics**: User impact tracking, engagement metrics
- 🛡️ **Fraud Detection**: AI-powered anomaly detection and risk assessment
- 🏪 **Marketplace**: Item redemption, auctions, escrow transactions
- 🎮 **Gamification**: Achievements, leaderboards, progress tracking
- 🌐 **Community Feed**: Social features, moderated content, testimonials
- 📱 **Biometric Auth**: Fingerprint and Face ID support
- 🔒 **Enhanced Security**: Multi-factor authentication, encryption

### Compliance & Security
- 🇳🇬 **NDPR Compliance**: Nigerian Data Protection Regulation
- 🔐 **Data Encryption**: AES-256 encryption at rest and in transit
- 🛡️ **Fraud Prevention**: Real-time monitoring and automated alerts
- 📊 **Audit Trails**: Comprehensive logging for regulatory compliance

## 🛠️ Technology Stack

### Backend Framework
- **Node.js 20+** with TypeScript
- **Express.js** with middleware ecosystem
- **Prisma ORM** for database operations
- **Redis** for caching and session management

### Database & Storage
- **PostgreSQL 15+** as primary database
- **Redis 7+** for caching and job queues
- **AWS S3** or **Cloudflare R2** for file storage

### AI & ML
- **scikit-learn** for matching algorithms
- **TensorFlow.js** for client-side ML
- **Python** microservices for heavy ML computations

### Security & Authentication
- **JWT** with refresh token rotation
- **bcrypt** for password hashing
- **OAuth 2.0** for third-party integrations
- **Biometric authentication** support

### Monitoring & Observability
- **Prometheus** for metrics collection
- **Grafana** for visualization
- **ELK Stack** for logging
- **Sentry** for error tracking

### Deployment & Infrastructure
- **Docker** for containerization
- **Kubernetes** for orchestration
- **NGINX** as reverse proxy
- **Cloudflare** for CDN and security

## 🚀 Quick Start

### Prerequisites

- Node.js 20.x or later
- PostgreSQL 15.x or later
- Redis 7.x or later
- Docker and Docker Compose (for local development)

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/chaingive-backend.git
   cd chaingive-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment configuration**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Database setup**
   ```bash
   # Start PostgreSQL and Redis with Docker
   docker-compose up -d postgres redis

   # Run database migrations
   npm run prisma:migrate

   # Seed initial data
   npm run db:seed
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3000`

### Docker Development

```bash
# Build and start all services
docker-compose up --build

# Run tests
docker-compose exec api npm test

# View logs
docker-compose logs -f api
```

## 📚 API Documentation

### Authentication

All API endpoints require authentication except for user registration and login.

```bash
# Get authentication token
POST /api/v2/auth/login
Content-Type: application/json

{
  "phoneNumber": "+2348012345678",
  "otp": "123456"
}

# Use token in subsequent requests
Authorization: Bearer <your-jwt-token>
```

### Core Endpoints

#### Community API
```bash
# Get community posts
GET /api/v2/community/posts?page=1&limit=20

# Create community post
POST /api/v2/community/posts
{
  "content": "Sharing my success story...",
  "type": "story"
}

# Create community event
POST /api/v2/community/events
{
  "title": "Community Health Drive",
  "eventDate": "2025-12-01",
  "location": "Lagos Community Center",
  "fundraisingGoal": 50000
}
```

#### Marketplace API
```bash
# Get marketplace listings
GET /api/v2/marketplace/listings?category=airtime

# Redeem item
POST /api/v2/marketplace/redeem
{
  "listingId": "uuid",
  "quantity": 1
}

# Get personalized recommendations
GET /api/v2/marketplace/recommendations?limit=10
```

#### Fraud Detection API
```bash
# Check transaction for fraud
POST /api/v2/fraud/check
{
  "transactionId": "uuid",
  "amount": 5000
}

# Report suspicious activity
POST /api/v2/fraud/report
{
  "type": "fraudulent_transaction",
  "description": "Suspicious transaction pattern"
}
```

### Rate Limiting

- Community posts: 10 per minute per user
- Marketplace transactions: 5 per minute per user
- General API calls: 100 per 15 minutes per IP

### Error Responses

```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Detailed error messages"],
  "code": "ERROR_CODE"
}
```

## 🗄️ Database Schema

### Core Tables

- **users**: User profiles and authentication
- **donations**: Donation cycles and transactions
- **community_posts**: Social content and interactions
- **community_events**: Event management and RSVPs
- **marketplace_items**: Redeemable items and pricing
- **marketplace_transactions**: Purchase history and escrow

### Analytics Tables

- **user_analytics_events**: User behavior tracking
- **user_engagement_metrics**: Calculated engagement scores
- **conversion_funnels**: User journey analytics
- **ai_model_performance**: ML model metrics

### Security Tables

- **fraud_detection_logs**: Risk assessment and alerts
- **user_achievements**: Gamification progress

See [schema.prisma](./prisma/schema.prisma) for complete database schema.

## 🚢 Deployment

### Production Environment

1. **Infrastructure Setup**
   ```bash
   # Using Railway (recommended)
   railway deploy

   # Or using Docker
   docker build -t chaingive-backend .
   docker run -p 3000:3000 chaingive-backend
   ```

2. **Environment Variables**
   ```env
   NODE_ENV=production
   DATABASE_URL=postgresql://...
   REDIS_URL=redis://...
   JWT_SECRET=your-secret-key
   ENCRYPTION_KEY=your-encryption-key
   ```

3. **SSL Configuration**
   - Use Cloudflare for SSL termination
   - Configure HSTS headers
   - Enable HTTP/2

### Kubernetes Deployment

```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: chaingive-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: chaingive-backend
  template:
    metadata:
      labels:
        app: chaingive-backend
    spec:
      containers:
      - name: api
        image: chaingive-backend:latest
        ports:
        - containerPort: 3000
        envFrom:
        - configMapRef:
            name: chaingive-config
        - secretRef:
            name: chaingive-secrets
```

## 📊 Monitoring

### Metrics Collection

- **Application Metrics**: Response times, error rates, throughput
- **Business Metrics**: User engagement, donation volumes, marketplace conversions
- **System Metrics**: CPU, memory, disk usage, network I/O

### Alerting

- Response time > 2s for 5 minutes
- Error rate > 5% for 10 minutes
- Database connection failures
- High fraud detection alerts

### Logging

- Structured JSON logging with Winston
- Log levels: ERROR, WARN, INFO, DEBUG
- Centralized logging with ELK stack
- Audit logs for compliance

## 🔒 Security

### Authentication & Authorization

- JWT tokens with 15-minute expiration
- Refresh token rotation
- Biometric authentication support
- Role-based access control (RBAC)

### Data Protection

- AES-256 encryption for sensitive data
- TLS 1.3 for data in transit
- Secure password hashing with bcrypt
- Data minimization and retention policies

### Fraud Prevention

- Real-time transaction monitoring
- AI-powered anomaly detection
- Velocity checks and pattern analysis
- Manual review workflows

### Compliance

- NDPR (Nigerian Data Protection Regulation) compliance
- Regular security audits and penetration testing
- Data breach notification procedures
- User data export/deletion capabilities

## 🤝 Contributing

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes and add tests
4. Run the test suite: `npm test`
5. Submit a pull request

### Code Standards

- **TypeScript**: Strict type checking enabled
- **ESLint**: Airbnb configuration with custom rules
- **Prettier**: Consistent code formatting
- **Testing**: Minimum 80% code coverage required

### Commit Convention

```
feat: add new API endpoint
fix: resolve authentication bug
docs: update API documentation
test: add integration tests
refactor: improve code structure
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [API Docs](./docs/api.md)
- **Issues**: [GitHub Issues](https://github.com/your-org/chaingive-backend/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/chaingive-backend/discussions)

## 🙏 Acknowledgments

- Built with ❤️ for the Nigerian community
- Inspired by the Ubuntu philosophy: "I am because we are"
- Special thanks to our beta testers and early adopters

---

**ChainGive Backend v2.2.0** - Building sustainable community support networks through technology.