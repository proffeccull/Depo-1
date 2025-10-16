# ChainGive Monitoring Setup Guide

This guide provides complete instructions for setting up comprehensive monitoring for the ChainGive backend application using Prometheus, Grafana, and AlertManager.

## 🚀 Quick Start

### 1. Start Monitoring Stack

```bash
cd chaingive-backend

# Start all monitoring services
docker-compose -f docker-compose.monitoring.yml up -d

# Verify services are running
docker-compose -f docker-compose.monitoring.yml ps
```

### 2. Access Monitoring Interfaces

- **Grafana Dashboard**: http://localhost:3001 (admin/admin)
- **Prometheus**: http://localhost:9090
- **AlertManager**: http://localhost:9093

### 3. Start ChainGive Backend

```bash
npm run dev
```

The backend will automatically expose metrics at:
- **Prometheus Metrics**: http://localhost:3000/metrics
- **Health Check**: http://localhost:3000/health

## 📊 Available Endpoints

### Public Endpoints (No Auth Required)
- `GET /health` - Basic health check
- `GET /metrics` - Prometheus metrics (machine-readable)

### Admin Endpoints (Require Authentication)
- `GET /v1/admin/system/health` - Comprehensive system health
- `GET /v1/admin/system/health/database` - Database health metrics
- `GET /v1/admin/system/health/detailed` - Detailed health with external services
- `GET /v1/admin/system/metrics` - Performance metrics
- `GET /v1/admin/system/metrics/prometheus` - Human-readable Prometheus metrics
- `GET /v1/admin/system/logs` - System logs with filtering
- `POST /v1/admin/system/maintenance` - System maintenance operations
- `GET /v1/admin/system/backup` - Backup status and history

## 🔧 Configuration

### Environment Variables

Add these to your `.env` file:

```env
# Monitoring Configuration
PROMETHEUS_ENABLED=true
METRICS_UPDATE_INTERVAL=30000
BACKUP_DIR=/tmp/chaingive-backups

# AlertManager SMTP (for email notifications)
ALERT_SMTP_HOST=smtp.gmail.com
ALERT_SMTP_PORT=587
ALERT_SMTP_USER=your-email@gmail.com
ALERT_SMTP_PASS=your-app-password
ALERT_RECIPIENT_EMAIL=admin@chaingive.com
```

### Prometheus Configuration

The `monitoring/prometheus.yml` file is pre-configured to scrape:
- ChainGive backend application metrics
- System metrics via Node Exporter
- Container metrics via cAdvisor
- PostgreSQL database metrics
- Redis cache metrics

### AlertManager Configuration

Alerts are configured in `monitoring/alert_rules.yml` for:
- System health (CPU, memory, disk)
- Database connectivity and performance
- Application errors and response times
- External service availability
- Business metrics monitoring

## 📈 Grafana Dashboards

### Pre-configured Dashboard

A comprehensive dashboard is available at `monitoring/grafana/dashboards/chaingive-overview.json` featuring:

- **System Health**: CPU, memory, disk usage
- **Application Metrics**: Active users, WebSocket connections
- **Database Monitoring**: Connection pools, query performance
- **HTTP Performance**: Request rates, response times, error rates
- **External Services**: Health status of Redis, email, SMS, payment gateways
- **Business KPIs**: Donations, matches, escrow transactions

### Accessing Grafana

1. Open http://localhost:3001
2. Login with `admin` / `admin`
3. The ChainGive dashboard will be automatically loaded

## 🚨 Alerting

### Alert Types

- **Critical**: System down, database unavailable, high error rates
- **Warning**: High resource usage, slow response times, external service issues
- **Info**: Low activity indicators, maintenance notifications

### Notification Channels

Alerts can be sent via:
- **Email**: SMTP configuration in `alertmanager.yml`
- **Slack**: Webhook integration (configure your webhook URL)
- **PagerDuty/OpsGenie**: Enterprise alerting integrations

## 🔍 Monitoring Metrics

### System Metrics
- CPU usage percentage
- Memory usage (RSS, heap used/total)
- Disk usage percentage
- System uptime

### Application Metrics
- Active users (24h rolling window)
- WebSocket connections
- HTTP request count and duration
- Error rates by endpoint
- Pending background jobs

### Database Metrics
- Active connections by state
- Connection pool utilization
- Query performance histograms
- Slow query counts

### Business Metrics
- Total donations and amounts
- Match creation counts
- Escrow transaction status
- User registration trends

### External Service Health
- Redis connectivity
- Email service (SendGrid/Termii)
- SMS service (Termii)
- Payment gateway availability

## 🛠️ Maintenance

### Updating Alert Rules

Edit `monitoring/alert_rules.yml` and reload Prometheus:

```bash
curl -X POST http://localhost:9090/-/reload
```

### Adding New Metrics

1. Add metrics to `src/services/metrics.service.ts`
2. Update Grafana dashboards
3. Add alert rules if needed
4. Restart the application

### Backup Monitoring Data

```bash
# Backup Grafana data
docker run --rm -v chaingive-backend_grafana_data:/data -v $(pwd)/backups:/backup alpine tar czf /backup/grafana-$(date +%Y%m%d).tar.gz -C /data .

# Backup Prometheus data
docker run --rm -v chaingive-backend_prometheus_data:/data -v $(pwd)/backups:/backup alpine tar czf /backup/prometheus-$(date +%Y%m%d).tar.gz -C /data .
```

## 🐳 Docker Commands

```bash
# Start monitoring stack
docker-compose -f docker-compose.monitoring.yml up -d

# Stop monitoring stack
docker-compose -f docker-compose.monitoring.yml down

# View logs
docker-compose -f docker-compose.monitoring.yml logs -f prometheus
docker-compose -f docker-compose.monitoring.yml logs -f grafana
docker-compose -f docker-compose.monitoring.yml logs -f alertmanager

# Restart specific service
docker-compose -f docker-compose.monitoring.yml restart grafana
```

## 🔒 Security Considerations

- Change default Grafana password
- Configure proper authentication for Prometheus endpoints
- Use HTTPS in production
- Restrict network access to monitoring ports
- Encrypt alert notification credentials

## 📚 Troubleshooting

### Common Issues

1. **Metrics not appearing in Grafana**
   - Check if backend is running and accessible
   - Verify Prometheus targets are healthy
   - Check Grafana datasource configuration

2. **Alerts not firing**
   - Verify AlertManager configuration
   - Check alert rule syntax
   - Ensure notification channels are configured

3. **High resource usage**
   - Adjust scrape intervals in prometheus.yml
   - Reduce metrics retention period
   - Scale monitoring infrastructure

### Logs Location

- **Application logs**: `src/utils/logger.ts` (Winston)
- **Prometheus logs**: `docker-compose logs prometheus`
- **Grafana logs**: `docker-compose logs grafana`
- **AlertManager logs**: `docker-compose logs alertmanager`

## 📞 Support

For issues with the monitoring setup:
1. Check service logs using docker-compose logs
2. Verify configuration files syntax
3. Ensure all required ports are available
4. Check network connectivity between services

The monitoring stack is designed to be production-ready and can be easily scaled for high-availability deployments.