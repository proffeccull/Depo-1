import { readFileSync } from 'fs';
import { join } from 'path';

export const http3Config = {
  enabled: process.env.HTTP3_ENABLED === 'true',
  port: Number(process.env.HTTP3_PORT) || 3443,
  cert: process.env.SSL_CERT_PATH ? readFileSync(process.env.SSL_CERT_PATH) : undefined,
  key: process.env.SSL_KEY_PATH ? readFileSync(process.env.SSL_KEY_PATH) : undefined,
  alpn: ['h3', 'h2', 'http/1.1'],
};
