import { createTRPCNext } from '@trpc/next';
import { httpBatchLink } from '@trpc/client';
import type { AppRouter } from '../../../chaingive-backend/src/trpc/router';

export const trpc = createTRPCNext<AppRouter>({
  config() {
    return {
      links: [
        httpBatchLink({
          url: process.env.NEXT_PUBLIC_API_URL + '/trpc' || 'http://localhost:5000/trpc',
        }),
      ],
    };
  },
  ssr: false,
});