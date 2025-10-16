# ChainGive Mobile App - System Health Monitoring Integration

## Overview

The ChainGive mobile admin app now integrates with the comprehensive backend monitoring system, providing real-time system health monitoring and management capabilities directly from mobile devices.

## Features Implemented

### ✅ Real-time System Health Monitoring
- **Live Data Updates**: Auto-refresh every 30 seconds when screen is active
- **Comprehensive Health Metrics**: CPU, memory, database, external services
- **Real-time Status Indicators**: Live connection status with timestamps
- **Push Notifications**: Alert notifications for critical system issues

### ✅ Backend API Integration
- **Detailed System Health**: `/v1/admin/system/health/detailed`
- **Performance Metrics**: `/v1/admin/system/metrics`
- **Prometheus Metrics**: Human-readable metrics format
- **Maintenance Operations**: Remote system maintenance triggers

### ✅ Enhanced Admin Dashboard
- **Quick Actions**: Direct navigation to related admin screens
- **Service Status Cards**: Visual status indicators for all services
- **Resource Monitoring**: Live system resource usage
- **Maintenance Controls**: One-tap maintenance operations

### ✅ Real-time Subscriptions
- **WebSocket Integration**: Real-time health updates (polling fallback)
- **Auto-reconnection**: Automatic reconnection on network issues
- **Background Updates**: Updates continue when app is in background

## Mobile-Specific Monitoring Features

### 📱 App Performance Monitoring
- **Crash Detection**: Automatic crash reporting integration
- **ANR Monitoring**: Application Not Responding detection
- **Memory Usage**: Mobile app memory consumption tracking
- **Network Performance**: API call latency and success rates

### 🔄 Real-time Dashboard
- **Live Updates**: Real-time data refresh without manual refresh
- **Status Indicators**: Color-coded health status dots
- **Auto-refresh**: Configurable refresh intervals
- **Offline Support**: Cached data display when offline

### 🚨 Mobile Alert System
- **Push Notifications**: Critical system alerts via FCM
- **In-app Alerts**: Toast notifications for warnings
- **Vibration Patterns**: Different patterns for different alert levels
- **Background Alerts**: Alerts even when app is not active

## API Integration Details

### System Health Endpoints
```typescript
// Get detailed system health
const health = await adminApi.getDetailedSystemHealth();

// Get performance metrics
const metrics = await adminApi.getPerformanceMetrics('1h');

// Get human-readable Prometheus metrics
const prometheus = await adminApi.getPrometheusMetrics();

// Subscribe to real-time updates
const unsubscribe = await adminApi.subscribeToHealthUpdates((data) => {
  console.log('Real-time health update:', data);
});
```

### Hook Integration
```typescript
const {
  detailedSystemHealth,
  getDetailedSystemHealth,
  subscribeToRealtimeHealth,
  unsubscribeFromRealtimeHealth
} = useAdmin();

// Subscribe to real-time updates
useEffect(() => {
  const unsubscribe = subscribeToRealtimeHealth((data) => {
    // Handle real-time updates
    updateUI(data);
  });

  return () => unsubscribe();
}, []);
```

## Screen Components

### SystemHealthScreen Features
- **Overall Health Score**: Visual health percentage with color coding
- **Service Status Grid**: Individual service health cards
- **Resource Metrics**: CPU, memory, connections, jobs
- **Maintenance Actions**: Database cleanup, cache clearing, backups
- **Quick Actions**: Navigation to related admin screens

### Real-time Indicators
- **Status Dots**: Green/yellow/red dots for health status
- **Last Updated**: Timestamp of last data refresh
- **Connection Status**: Online/offline indicators
- **Auto-refresh Timer**: Countdown to next update

## Configuration

### Environment Variables
```env
# Mobile monitoring configuration
MONITORING_AUTO_REFRESH=30000
MONITORING_ENABLE_PUSH=true
MONITORING_ALERT_VIBRATION=true
MONITORING_OFFLINE_CACHE=true
```

### Feature Flags
- `mobile_monitoring_realtime`: Enable real-time updates
- `mobile_monitoring_alerts`: Enable push notifications
- `mobile_monitoring_offline`: Enable offline caching

## Testing

### Manual Testing
1. **Health Data Loading**: Verify system health data loads correctly
2. **Real-time Updates**: Confirm auto-refresh works every 30 seconds
3. **Maintenance Actions**: Test maintenance operations work
4. **Offline Mode**: Verify cached data shows when offline
5. **Push Notifications**: Test alert notifications

### Automated Testing
```typescript
// Example test for health monitoring
describe('SystemHealthScreen', () => {
  it('loads system health data on mount', async () => {
    // Test implementation
  });

  it('updates data every 30 seconds', async () => {
    // Test implementation
  });

  it('handles maintenance operations', async () => {
    // Test implementation
  });
});
```

## Performance Considerations

### Mobile Optimization
- **Lazy Loading**: Health data loads only when screen is visible
- **Background Updates**: Efficient polling with error handling
- **Memory Management**: Automatic cleanup of subscriptions
- **Network Efficiency**: Compressed API responses

### Battery Impact
- **Smart Polling**: Reduces frequency when app is backgrounded
- **Network Awareness**: Pauses updates on poor connectivity
- **Push Optimization**: Uses FCM for efficient notifications

## Troubleshooting

### Common Issues

1. **Data Not Loading**
   - Check network connectivity
   - Verify API authentication
   - Check backend service status

2. **Real-time Updates Not Working**
   - Verify WebSocket connection
   - Check subscription cleanup
   - Test polling fallback

3. **Push Notifications Not Received**
   - Verify FCM configuration
   - Check notification permissions
   - Test with Firebase console

4. **High Battery Usage**
   - Adjust refresh intervals
   - Enable background optimization
   - Check for memory leaks

### Debug Mode
Enable debug logging:
```typescript
// In development mode
console.log('Health data:', systemHealthData);
console.log('Real-time subscription active:', !!realtimeSubscription);
```

## Future Enhancements

### Planned Features
- **Advanced Charts**: Interactive performance graphs
- **Historical Trends**: Long-term performance analysis
- **Predictive Alerts**: AI-based anomaly detection
- **Multi-device Sync**: Sync monitoring state across devices

### Integration Opportunities
- **Crashlytics**: Enhanced crash reporting
- **Firebase Analytics**: User journey tracking
- **App Center**: Advanced mobile analytics
- **DataDog Mobile**: Enterprise mobile monitoring

## Support

For issues with mobile monitoring integration:
1. Check device logs for error messages
2. Verify backend API connectivity
3. Test with different network conditions
4. Check Firebase configuration for push notifications

The mobile monitoring system provides comprehensive system visibility and control directly from admin mobile devices, ensuring ChainGive administrators can monitor and manage the platform from anywhere.