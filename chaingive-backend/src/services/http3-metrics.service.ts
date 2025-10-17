import { Counter, Histogram } from 'prom-client';

const http3Connections = new Counter({
  name: 'http3_connections_total',
  help: 'Total HTTP/3 connections',
});

const http3Latency = new Histogram({
  name: 'http3_request_duration_seconds',
  help: 'HTTP/3 request latency',
  buckets: [0.01, 0.05, 0.1, 0.5, 1],
});

class HTTP3MetricsService {
  recordConnection() {
    http3Connections.inc();
  }

  recordLatency(duration: number) {
    http3Latency.observe(duration);
  }
}

export default new HTTP3MetricsService();
