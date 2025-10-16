interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

class PerformanceService {
  private metrics: PerformanceMetric[] = [];
  private startTimes = new Map<string, number>();

  startTimer(name: string) {
    this.startTimes.set(name, Date.now());
  }

  endTimer(name: string, metadata?: Record<string, any>) {
    const startTime = this.startTimes.get(name);
    if (!startTime) return;

    const duration = Date.now() - startTime;
    this.recordMetric(name, duration, metadata);
    this.startTimes.delete(name);
  }

  recordMetric(name: string, value: number, metadata?: Record<string, any>) {
    this.metrics.push({
      name,
      value,
      timestamp: Date.now(),
      metadata,
    });

    // Keep only last 100 metrics
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-100);
    }
  }

  getMetrics() {
    return this.metrics;
  }

  getAverageTime(name: string) {
    const filtered = this.metrics.filter(m => m.name === name);
    if (filtered.length === 0) return 0;
    
    const sum = filtered.reduce((acc, m) => acc + m.value, 0);
    return sum / filtered.length;
  }
}

export const performanceService = new PerformanceService();