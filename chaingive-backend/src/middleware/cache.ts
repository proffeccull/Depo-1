import { Request, Response, NextFunction } from 'express';
import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 300 }); // 5 minutes default

export const cacheMiddleware = (duration: number = 300) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = req.originalUrl;
    const cached = cache.get(key);

    if (cached) {
      return res.json(cached);
    }

    const originalSend = res.json;
    res.json = function(data: any) {
      cache.set(key, data, duration);
      return originalSend.call(this, data);
    };

    next();
  };
};