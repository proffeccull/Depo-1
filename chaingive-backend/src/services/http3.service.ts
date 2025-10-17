import { createSecureServer } from 'http2';
import { Express } from 'express';
import { http3Config } from '../config/http3.config';
import logger from '../utils/logger';
import http3MetricsService from './http3-metrics.service';

class HTTP3Service {
  private server: any;
  private isEnabled = false;

  initialize(app: Express) {
    if (!http3Config.enabled) {
      logger.info('⚡ HTTP/3 disabled (using HTTP/1.1 + HTTP/2)');
      return;
    }

    if (!http3Config.cert || !http3Config.key) {
      logger.warn('⚠️  HTTP/3 enabled but SSL certificates missing - falling back to HTTP/2');
      this.initializeHTTP2(app);
      return;
    }

    try {
      this.initializeHTTP3(app);
    } catch (error) {
      logger.error('Failed to start HTTP/3, falling back to HTTP/2:', error);
      this.initializeHTTP2(app);
    }
  }

  private initializeHTTP3(app: Express) {
    try {
      const http3 = require('http3');
      this.server = http3.createServer({
        cert: http3Config.cert,
        key: http3Config.key,
        alpn: http3Config.alpn,
      }, app);

      this.server.listen(http3Config.port, () => {
        this.isEnabled = true;
        logger.info(`🚀 HTTP/3 (QUIC) server running on port ${http3Config.port}`);
        logger.info('⚡ Protocol: HTTP/3 with 0-RTT support');
        http3MetricsService.recordConnection();
      });
    } catch (error) {
      throw error;
    }
  }

  private initializeHTTP2(app: Express) {
    if (!http3Config.cert || !http3Config.key) return;

    this.server = createSecureServer({
      cert: http3Config.cert,
      key: http3Config.key,
      allowHTTP1: true,
    }, app as any);

    this.server.listen(http3Config.port, () => {
      logger.info(`🔒 HTTP/2 server running on port ${http3Config.port}`);
      logger.info('⚡ Protocol: HTTP/2 with TLS 1.3');
    });
  }

  shutdown() {
    if (this.server) {
      this.server.close();
      logger.info(this.isEnabled ? '🛑 HTTP/3 server closed' : '🛑 HTTP/2 server closed');
    }
  }

  getStatus() {
    return {
      enabled: this.isEnabled,
      protocol: this.isEnabled ? 'HTTP/3' : 'HTTP/2',
      port: http3Config.port,
    };
  }
}

export default new HTTP3Service();
