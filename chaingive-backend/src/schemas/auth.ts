import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email().optional(),
  phoneNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/).optional(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
}).refine(data => data.email || data.phoneNumber, {
  message: 'Either email or phone number is required',
});

export const registerSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email(),
  phoneNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const otpSchema = z.object({
  phoneNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/),
  otp: z.string().length(6, 'OTP must be 6 digits'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type OTPInput = z.infer<typeof otpSchema>;