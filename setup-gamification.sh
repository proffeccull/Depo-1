#!/bin/bash

echo "🎮 Setting up HTTP/3 and Gamification Features..."

# Backend setup
echo "📦 Installing backend dependencies..."
cd chaingive-backend
npm install http3@latest

# Update environment
echo "⚙️  Configuring environment..."
if ! grep -q "HTTP3_ENABLED" .env; then
  echo "" >> .env
  echo "# HTTP/3 Configuration" >> .env
  echo "HTTP3_ENABLED=false" >> .env
  echo "HTTP3_PORT=3443" >> .env
  echo "SSL_CERT_PATH=" >> .env
  echo "SSL_KEY_PATH=" >> .env
fi

# Build backend
echo "🔨 Building backend..."
npm run build

# Mobile setup
echo "📱 Setting up mobile components..."
cd ../chaingive-mobile
npm install expo-linear-gradient@latest

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Configure SSL certificates for HTTP/3 (optional)"
echo "2. Start backend: cd chaingive-backend && npm start"
echo "3. Start mobile: cd chaingive-mobile && npm start"
echo ""
echo "📚 See HTTP3-GAMIFICATION-IMPLEMENTATION.md for full documentation"
