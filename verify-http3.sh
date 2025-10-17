#!/bin/bash

echo "🔍 Verifying HTTP/3 Implementation..."
echo ""

# Check if server is running
echo "1. Checking server status..."
if curl -s http://localhost:3000/health > /dev/null; then
    echo "   ✅ Server is running"
else
    echo "   ❌ Server is not running"
    exit 1
fi

# Check health endpoint for protocol info
echo ""
echo "2. Checking protocol support..."
HEALTH=$(curl -s http://localhost:3000/health)
echo "$HEALTH" | jq '.protocols' 2>/dev/null || echo "   ⚠️  Install jq for better output"

# Check if HTTP/3 port is listening
echo ""
echo "3. Checking HTTP/3 port (3443)..."
if netstat -tuln 2>/dev/null | grep -q ":3443"; then
    echo "   ✅ Port 3443 is listening"
else
    echo "   ℹ️  Port 3443 not active (HTTP/3 may be disabled)"
fi

# Check environment configuration
echo ""
echo "4. Checking environment configuration..."
if [ -f "chaingive-backend/.env" ]; then
    if grep -q "HTTP3_ENABLED=true" chaingive-backend/.env; then
        echo "   ✅ HTTP3_ENABLED=true"
    else
        echo "   ℹ️  HTTP3_ENABLED=false or not set"
    fi
    
    if grep -q "SSL_CERT_PATH=" chaingive-backend/.env; then
        echo "   ✅ SSL_CERT_PATH configured"
    else
        echo "   ⚠️  SSL_CERT_PATH not configured"
    fi
else
    echo "   ⚠️  .env file not found"
fi

# Check logs for HTTP/3 initialization
echo ""
echo "5. Checking recent logs..."
if [ -f "chaingive-backend/logs/combined.log" ]; then
    if grep -q "HTTP/3" chaingive-backend/logs/combined.log | tail -5; then
        echo "   ✅ HTTP/3 initialization found in logs"
    else
        echo "   ℹ️  No HTTP/3 logs found"
    fi
else
    echo "   ℹ️  Log file not found"
fi

echo ""
echo "📊 Summary:"
echo "   - HTTP/1.1: Always available on port 3000"
echo "   - HTTP/2: Available when SSL configured"
echo "   - HTTP/3: Available when enabled + SSL configured"
echo ""
echo "📖 See HTTP3-DEPLOYMENT-GUIDE.md for full documentation"
