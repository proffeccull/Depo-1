import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '../../../chaingive-backend/src/trpc/router';

export const trpc = createTRPCReact<AppRouter>();