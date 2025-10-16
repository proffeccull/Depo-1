import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { loginSchema, registerSchema } from '../schemas/auth';
import { syncRouter } from './sync.router';

const t = initTRPC.create();

export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure;

export const appRouter = router({
  auth: router({
    login: publicProcedure
      .input(loginSchema)
      .mutation(async ({ input }) => {
        return {
          user: { id: '1', firstName: 'John', lastName: 'Doe' },
          token: 'mock-token'
        };
      }),
    
    register: publicProcedure
      .input(registerSchema)
      .mutation(async ({ input }) => {
        return {
          user: { id: '2', ...input },
          token: 'mock-token'
        };
      }),
    
    me: publicProcedure
      .query(async () => {
        return { id: '1', firstName: 'John', lastName: 'Doe' };
      }),
  }),

  user: router({
    getBalance: publicProcedure
      .query(async () => {
        return { balance: 1000, charityCoins: 50 };
      }),
  }),

  sync: syncRouter,
});

export type AppRouter = typeof appRouter;