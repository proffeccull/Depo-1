import NodeCache from 'node-cache';
import { Request, Response, NextFunction } from 'express';

const cache = new NodeCache({ stdTTL: 300 }); // 5 minutes

export const cacheMiddleware = (duration: number = 300) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = `cache:${req.originalUrl}`;
    const cached = cache.get(key);

    if (cached) {
      return res.json(cached);
    }

    const originalJson = res.json.bind(res);
    res.json = (data: any) => {
      cache.set(key, data, duration);
      return originalJson(data);
    };

    next();
  };
};
