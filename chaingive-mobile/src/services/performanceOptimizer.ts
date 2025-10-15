import AsyncStorage from '@react-native-async-storage/async-storage';
import { websocketService } from './websocketService';
import { gamificationApi } from './gamificationApi';

// Cache configuration
const CACHE_CONFIG = {
  userLevels: { ttl: 5 * 60 * 1000 }, // 5 minutes
  nftGallery: { ttl: 10 * 60 * 1000 }, // 10 minutes
  trustReviews: { ttl: 2 * 60 * 1000 }, // 2 minutes
  weeklyTargets: { ttl: 15 * 60 * 1000 }, // 15 minutes
  charityCategories: { ttl: 30 * 60 * 1000 }, // 30 minutes
  crewData: { ttl: 5 * 60 * 1000 }, // 5 minutes
};

// Debounce configuration
const DEBOUNCE_CONFIG = {
  websocketUpdates: 500, // 500ms for WebSocket updates
  searchQueries: 300, // 300ms for search
  scrollEvents: 100, // 100ms for scroll
  resizeEvents: 250, // 250ms for resize
};

// Performance monitoring
class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map();
  private startTimes: Map<string, number> = new Map();

  start(operation: string): void {
    this.startTimes.set(operation, performance.now());
  }

  end(operation: string): void {
    const startTime = this.startTimes.get(operation);
    if (startTime) {
      const duration = performance.now() - startTime;
      if (!this.metrics.has(operation)) {
        this.metrics.set(operation, []);
      }
      this.metrics.get(operation)!.push(duration);
      this.startTimes.delete(operation);

      // Log slow operations
      if (duration > 100) {
        console.warn(`⚠️ Slow operation: ${operation} took ${duration.toFixed(2)}ms`);
      }
    }
  }

  getAverage(operation: string): number {
    const times = this.metrics.get(operation);
    if (!times || times.length === 0) return 0;
    return times.reduce((sum, time) => sum + time, 0) / times.length;
  }

  getMetrics(): Record<string, { average: number; count: number; max: number }> {
    const result: Record<string, { average: number; count: number; max: number }> = {};
    for (const [operation, times] of this.metrics.entries()) {
      result[operation] = {
        average: this.getAverage(operation),
        count: times.length,
        max: Math.max(...times),
      };
    }
    return result;
  }

  reset(): void {
    this.metrics.clear();
    this.startTimes.clear();
  }
}

// Cache manager
class CacheManager {
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();

  async get<T>(key: string): Promise<T | null> {
    try {
      // Check memory cache first
      const cached = this.cache.get(key);
      if (cached && Date.now() - cached.timestamp < cached.ttl) {
        return cached.data;
      }

      // Check AsyncStorage
      const stored = await AsyncStorage.getItem(`cache_${key}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Date.now() - parsed.timestamp < parsed.ttl) {
          // Update memory cache
          this.cache.set(key, parsed);
          return parsed.data;
        } else {
          // Remove expired cache
          await AsyncStorage.removeItem(`cache_${key}`);
        }
      }

      return null;
    } catch (error) {
      console.error('❌ Cache read error:', error);
      return null;
    }
  }

  async set(key: string, data: any, ttl: number): Promise<void> {
    try {
      const cacheEntry = { data, timestamp: Date.now(), ttl };

      // Update memory cache
      this.cache.set(key, cacheEntry);

      // Update AsyncStorage
      await AsyncStorage.setItem(`cache_${key}`, JSON.stringify(cacheEntry));
    } catch (error) {
      console.error('❌ Cache write error:', error);
    }
  }

  async invalidate(pattern: string): Promise<void> {
    try {
      // Clear memory cache
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }

      // Clear AsyncStorage
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith('cache_') && key.includes(pattern));
      await AsyncStorage.multiRemove(cacheKeys);
    } catch (error) {
      console.error('❌ Cache invalidation error:', error);
    }
  }

  async clear(): Promise<void> {
    try {
      this.cache.clear();
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith('cache_'));
      await AsyncStorage.multiRemove(cacheKeys);
    } catch (error) {
      console.error('❌ Cache clear error:', error);
    }
  }

  getStats(): { memoryEntries: number; storageKeys: number } {
    return {
      memoryEntries: this.cache.size,
      storageKeys: 0, // Would need to count AsyncStorage keys
    };
  }
}

// Debounce utility
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Throttle utility
function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Optimized API service with caching and retry logic
class OptimizedGamificationApi {
  private cacheManager = new CacheManager();
  private performanceMonitor = new PerformanceMonitor();
  private retryQueue: Map<string, { resolve: Function; reject: Function; attempts: number }> = new Map();

  // Cached API calls
  async getUserLevel(userId: string, useCache = true) {
    const cacheKey = `userLevel_${userId}`;
    const monitorKey = 'getUserLevel';

    this.performanceMonitor.start(monitorKey);

    try {
      if (useCache) {
        const cached = await this.cacheManager.get(cacheKey);
        if (cached) {
          this.performanceMonitor.end(monitorKey);
          return cached;
        }
      }

      const response = await this.withRetry(
        () => gamificationApi.userLevels.getUserLevel(userId),
        cacheKey
      );

      if (response.data.success) {
        await this.cacheManager.set(cacheKey, response.data.data, CACHE_CONFIG.userLevels.ttl);
      }

      this.performanceMonitor.end(monitorKey);
      return response.data.data;
    } catch (error) {
      this.performanceMonitor.end(monitorKey);
      throw error;
    }
  }

  async getUserNFTs(userId: string, useCache = true) {
    const cacheKey = `userNFTs_${userId}`;
    const monitorKey = 'getUserNFTs';

    this.performanceMonitor.start(monitorKey);

    try {
      if (useCache) {
        const cached = await this.cacheManager.get(cacheKey);
        if (cached) {
          this.performanceMonitor.end(monitorKey);
          return cached;
        }
      }

      const response = await this.withRetry(
        () => gamificationApi.charitableNft.getUserNFTs(userId),
        cacheKey
      );

      if (response.data.success) {
        await this.cacheManager.set(cacheKey, response.data.data, CACHE_CONFIG.nftGallery.ttl);
      }

      this.performanceMonitor.end(monitorKey);
      return response.data.data;
    } catch (error) {
      this.performanceMonitor.end(monitorKey);
      throw error;
    }
  }

  async getTrustReviews(filters: any = {}, useCache = true) {
    const cacheKey = `trustReviews_${JSON.stringify(filters)}`;
    const monitorKey = 'getTrustReviews';

    this.performanceMonitor.start(monitorKey);

    try {
      if (useCache) {
        const cached = await this.cacheManager.get(cacheKey);
        if (cached) {
          this.performanceMonitor.end(monitorKey);
          return cached;
        }
      }

      const response = await this.withRetry(
        () => gamificationApi.trust.getReviews(filters),
        cacheKey
      );

      if (response.data.success) {
        await this.cacheManager.set(cacheKey, response.data, CACHE_CONFIG.trustReviews.ttl);
      }

      this.performanceMonitor.end(monitorKey);
      return response.data;
    } catch (error) {
      this.performanceMonitor.end(monitorKey);
      throw error;
    }
  }

  async getWeeklyTarget(userId: string, useCache = true) {
    const cacheKey = `weeklyTarget_${userId}`;
    const monitorKey = 'getWeeklyTarget';

    this.performanceMonitor.start(monitorKey);

    try {
      if (useCache) {
        const cached = await this.cacheManager.get(cacheKey);
        if (cached) {
          this.performanceMonitor.end(monitorKey);
          return cached;
        }
      }

      const response = await this.withRetry(
        () => gamificationApi.weeklyTargets.getCurrentTarget(userId),
        cacheKey
      );

      if (response.data.success) {
        await this.cacheManager.set(cacheKey, response.data.data, CACHE_CONFIG.weeklyTargets.ttl);
      }

      this.performanceMonitor.end(monitorKey);
      return response.data.data;
    } catch (error) {
      this.performanceMonitor.end(monitorKey);
      throw error;
    }
  }

  // Retry mechanism with exponential backoff
  private async withRetry<T>(
    operation: () => Promise<T>,
    operationKey: string,
    maxRetries = 3
  ): Promise<T> {
    let attempts = 0;

    while (attempts < maxRetries) {
      try {
        return await operation();
      } catch (error: any) {
        attempts++;

        if (attempts >= maxRetries || !this.isRetryableError(error)) {
          throw error;
        }

        // Exponential backoff
        const delay = Math.min(1000 * Math.pow(2, attempts - 1), 10000);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw new Error('Max retries exceeded');
  }

  private isRetryableError(error: any): boolean {
    // Retry on network errors, timeouts, and 5xx server errors
    return (
      !error.response ||
      error.code === 'NETWORK_ERROR' ||
      error.code === 'TIMEOUT' ||
      (error.response.status >= 500 && error.response.status < 600)
    );
  }

  // Cache management
  async invalidateUserCache(userId: string): Promise<void> {
    await this.cacheManager.invalidate(`_${userId}`);
  }

  async clearAllCache(): Promise<void> {
    await this.cacheManager.clear();
  }

  getPerformanceMetrics() {
    return this.performanceMonitor.getMetrics();
  }

  getCacheStats() {
    return this.cacheManager.getStats();
  }
}

// Optimized WebSocket service
class OptimizedWebSocketService {
  private debounceTimers: Map<string, NodeJS.Timeout> = new Map();
  private eventBuffer: Array<{ type: string; payload: any; timestamp: number }> = [];
  private batchTimer: NodeJS.Timeout | null = null;
  private isProcessingBatch = false;

  // Debounced event emission
  emitDebounced = debounce((type: string, payload: any) => {
    websocketService.send(type as any, payload);
  }, DEBOUNCE_CONFIG.websocketUpdates);

  // Batch event processing
  private addToBatch(type: string, payload: any): void {
    this.eventBuffer.push({ type, payload, timestamp: Date.now() });

    if (!this.batchTimer && !this.isProcessingBatch) {
      this.batchTimer = setTimeout(() => this.processBatch(), 100);
    }
  }

  private async processBatch(): Promise<void> {
    if (this.isProcessingBatch || this.eventBuffer.length === 0) return;

    this.isProcessingBatch = true;

    try {
      // Group events by type
      const groupedEvents = this.eventBuffer.reduce((groups, event) => {
        if (!groups[event.type]) {
          groups[event.type] = [];
        }
        groups[event.type].push(event.payload);
        return groups;
      }, {} as Record<string, any[]>);

      // Process each group
      for (const [type, payloads] of Object.entries(groupedEvents)) {
        if (payloads.length === 1) {
          // Single event
          websocketService.send(type as any, payloads[0]);
        } else {
          // Batched event
          websocketService.send(`${type}_batch` as any, { events: payloads });
        }
      }
    } finally {
      this.eventBuffer = [];
      this.batchTimer = null;
      this.isProcessingBatch = false;
    }
  }

  // Optimized event listeners with throttling
  setupOptimizedListeners(): void {
    // Throttle frequent events
    const throttledXPUpdate = throttle((payload: any) => {
      this.addToBatch('xp_update', payload);
    }, 200);

    const throttledProgressUpdate = throttle((payload: any) => {
      this.addToBatch('progress_update', payload);
    }, 500);

    // Set up listeners
    websocketService.on('xp_awarded', throttledXPUpdate);
    websocketService.on('target_progress_updated', throttledProgressUpdate);
    websocketService.on('crew_member_joined', (payload) => {
      this.addToBatch('crew_update', payload);
    });
  }

  cleanup(): void {
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }

    this.debounceTimers.forEach(timer => clearTimeout(timer));
    this.debounceTimers.clear();
  }
}

// Optimized notification service
class OptimizedNotificationService {
  private notificationQueue: Array<{ data: any; priority: number; timestamp: number }> = [];
  private isProcessingQueue = false;
  private backgroundTaskId: string | null = null;

  // Queue notifications for background processing
  async queueNotification(
    type: string,
    title: string,
    body: string,
    data?: any,
    priority: 'low' | 'normal' | 'high' = 'normal'
  ): Promise<void> {
    const priorityValue = priority === 'high' ? 3 : priority === 'normal' ? 2 : 1;

    this.notificationQueue.push({
      data: { type, title, body, data },
      priority: priorityValue,
      timestamp: Date.now(),
    });

    // Sort by priority (higher first)
    this.notificationQueue.sort((a, b) => b.priority - a.priority);

    if (!this.isProcessingQueue) {
      this.processNotificationQueue();
    }
  }

  private async processNotificationQueue(): Promise<void> {
    if (this.isProcessingQueue || this.notificationQueue.length === 0) return;

    this.isProcessingQueue = true;

    try {
      while (this.notificationQueue.length > 0) {
        const notification = this.notificationQueue.shift()!;
        const age = Date.now() - notification.timestamp;

        // Skip old notifications (> 5 minutes)
        if (age > 5 * 60 * 1000) continue;

        // Rate limiting: max 1 notification per second
        if (this.notificationQueue.length > 0) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

        await this.sendNotification(notification.data);
      }
    } finally {
      this.isProcessingQueue = false;
    }
  }

  private async sendNotification(data: any): Promise<void> {
    try {
      // Import notificationService dynamically to avoid circular imports
      const { notificationService } = await import('./notificationService');
      await notificationService.sendCustomNotification(
        data.type,
        data.title,
        data.body,
        data.data
      );
    } catch (error) {
      console.error('❌ Failed to send queued notification:', error);
    }
  }

  // Background processing for notifications
  startBackgroundProcessing(): void {
    // In a real app, this would use a background task library
    // For now, we'll use setInterval
    this.backgroundTaskId = setInterval(() => {
      if (this.notificationQueue.length > 0 && !this.isProcessingQueue) {
        this.processNotificationQueue();
      }
    }, 5000) as any; // Check every 5 seconds
  }

  stopBackgroundProcessing(): void {
    if (this.backgroundTaskId) {
      clearInterval(this.backgroundTaskId as any);
      this.backgroundTaskId = null;
    }
  }

  getQueueStats(): { queued: number; processing: boolean } {
    return {
      queued: this.notificationQueue.length,
      processing: this.isProcessingQueue,
    };
  }
}

// Virtualized list component for large datasets
import React, { useMemo } from 'react';
import { FlatList, View, Text, StyleSheet } from 'react-native';

interface VirtualizedListProps<T> {
  data: T[];
  renderItem: ({ item, index }: { item: T; index: number }) => React.ReactElement;
  itemHeight: number;
  containerHeight: number;
  keyExtractor?: (item: T, index: number) => string;
}

export function VirtualizedList<T>({
  data,
  renderItem,
  itemHeight,
  containerHeight,
  keyExtractor = (_, index) => index.toString(),
}: VirtualizedListProps<T>) {
  const visibleItems = useMemo(() => {
    const startIndex = 0; // Would be calculated based on scroll position
    const endIndex = Math.min(startIndex + Math.ceil(containerHeight / itemHeight) + 2, data.length);
    return data.slice(startIndex, endIndex);
  }, [data, containerHeight, itemHeight]);

  return (
    <View style={{ height: containerHeight }}>
      <FlatList
        data={visibleItems}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={5}
        initialNumToRender={8}
        getItemLayout={(data, index) => ({
          length: itemHeight,
          offset: itemHeight * index,
          index,
        })}
      />
    </View>
  );
}

// Main performance optimizer
class PerformanceOptimizer {
  public api = new OptimizedGamificationApi();
  public websocket = new OptimizedWebSocketService();
  public notifications = new OptimizedNotificationService();

  constructor() {
    this.websocket.setupOptimizedListeners();
    this.notifications.startBackgroundProcessing();
  }

  // Memory optimization
  optimizeMemory(): void {
    // Clear old cache entries
    this.api.clearAllCache();

    // Force garbage collection (if available)
    if (global.gc) {
      global.gc();
    }
  }

  // Performance monitoring
  getMetrics() {
    return {
      api: this.api.getPerformanceMetrics(),
      cache: this.api.getCacheStats(),
      notifications: this.notifications.getQueueStats(),
    };
  }

  // Cleanup
  cleanup(): void {
    this.websocket.cleanup();
    this.notifications.stopBackgroundProcessing();
  }
}

// Singleton instance
export const performanceOptimizer = new PerformanceOptimizer();

// React hook for performance monitoring
import { useEffect, useRef } from 'react';

export const usePerformanceMonitor = (componentName: string) => {
  const renderCount = useRef(0);
  const lastRenderTime = useRef(performance.now());

  useEffect(() => {
    renderCount.current += 1;
    const now = performance.now();
    const renderTime = now - lastRenderTime.current;
    lastRenderTime.current = now;

    // Log performance issues
    if (renderTime > 16.67) { // More than one frame at 60fps
      console.warn(`⚠️ Slow render in ${componentName}: ${renderTime.toFixed(2)}ms`);
    }

    if (renderCount.current > 10) {
      console.warn(`⚠️ High render count in ${componentName}: ${renderCount.current} renders`);
    }
  });

  return {
    renderCount: renderCount.current,
    averageRenderTime: 0, // Would need more complex tracking
  };
};

// Lazy loading hook
export const useLazyData = <T>(
  fetcher: () => Promise<T>,
  dependencies: any[] = []
) => {
  const [data, setData] = React.useState<T | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await fetcher();
        if (isMounted) {
          setData(result);
        }
      } catch (err) {
        if (isMounted) {
          setError(err as Error);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, dependencies);

  return { data, loading, error, refetch: () => loadData() };
};