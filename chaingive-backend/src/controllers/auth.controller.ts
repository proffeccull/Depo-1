import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';
import logger from '../utils/logger';
import { sendOTP, verifyOTP } from '../services/otp.service';
import { sendWelcomeEmail, sendPasswordResetEmail } from '../services/email.service';
import crypto from 'crypto';

/**
 * Register a new user
 */
export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { phoneNumber, email, password, firstName, lastName, locationCity, locationState, referralCode } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { phoneNumber },
          ...(email ? [{ email }] : []),
        ],
      },
    });

    if (existingUser) {
      if (existingUser.phoneNumber === phoneNumber) {
        throw new AppError('Phone number already registered', 409, 'PHONE_EXISTS');
      }
      if (existingUser.email === email) {
        throw new AppError('Email already registered', 409, 'EMAIL_EXISTS');
      }
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Process referral code if provided
    let referrerId: string | undefined;
    if (referralCode) {
      const referrer = await prisma.user.findUnique({
        where: {
          referralCode,
        },
      });
      
      if (referrer) {
        referrerId = referrer.id;
      }
    }

    // Create user and wallet in transaction
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          phoneNumber,
          email,
          passwordHash,
          firstName,
          lastName,
          locationCity,
          locationState,
          referralCode: `${firstName.toLowerCase()}${Date.now().toString().slice(-6)}`,
        },
        select: {
          id: true,
          phoneNumber: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          tier: true,
        },
      });

      // Create wallet for user
      await tx.wallet.create({
        data: {
          userId: newUser.id,
        },
      });

      // Process referral if referrerId exists
      if (referrerId) {
        // Create referral record
        await tx.referral.create({
          data: {
            referrerId,
            referredUserId: newUser.id,
            referralCode: referralCode || '',
            status: 'registered',
          },
        });

        // Award 25 coins to referrer
        await tx.user.update({
          where: { id: referrerId },
          data: {
            charityCoinsBalance: { increment: 25 },
          },
        });
      }

      return newUser;
    });

    // Send OTP for phone verification
    await sendOTP(phoneNumber);

    // Send welcome email if email provided
    if (email) {
      await sendWelcomeEmail(email, firstName);
    }

    logger.info(`User registered: ${user.id}`);

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please verify your phone number.',
      data: {
        user,
        requiresOTP: true,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login user
 */
export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { phoneNumber, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { phoneNumber },
      include: {
        wallet: true,
      },
    });

    if (!user) {
      throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    // Check if account is active
    if (!user.isActive) {
      throw new AppError('Account is inactive', 403, 'ACCOUNT_INACTIVE');
    }

    if (user.isBanned) {
      throw new AppError('Account is banned', 403, 'ACCOUNT_BANNED', {
        reason: user.banReason,
      });
    }

    // Check if phone is verified
    const phoneVerified = await prisma.kYCRecord.findFirst({
      where: {
        userId: user.id,
        verificationType: 'phone',
        status: 'approved',
      },
    });

    if (!phoneVerified) {
      // Send OTP
      await sendOTP(phoneNumber);
      return res.status(200).json({
        success: true,
        message: 'Please verify your phone number',
        data: {
          requiresOTP: true,
          phoneNumber,
        },
      });
    }

    // Generate tokens
    const accessToken = generateAccessToken({
      id: user.id,
      phoneNumber: user.phoneNumber,
      email: user.email || undefined,
      role: user.role,
      tier: user.tier,
    });

    const refreshToken = generateRefreshToken({ id: user.id });

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    logger.info(`User logged in: ${user.id}`);

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          phoneNumber: user.phoneNumber,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          tier: user.tier,
          trustScore: user.trustScore,
          charityCoinsBalance: user.charityCoinsBalance,
          wallet: user.wallet,
        },
        token: accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify OTP
 */
export const verifyOtp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { phoneNumber, otp } = req.body;

    // Verify OTP
    const isValid = await verifyOTP(phoneNumber, otp);

    if (!isValid) {
      throw new AppError('Invalid or expired OTP', 400, 'INVALID_OTP');
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { phoneNumber },
      include: { wallet: true },
    });

    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    // Create or update KYC record
    await prisma.kYCRecord.upsert({
      where: {
        userId_verificationType: {
          userId: user.id,
          verificationType: 'phone',
        },
      },
      create: {
        userId: user.id,
        verificationType: 'phone',
        status: 'approved',
        verifiedAt: new Date(),
      },
      update: {
        status: 'approved',
        verifiedAt: new Date(),
      },
    });

    // Generate tokens
    const accessToken = generateAccessToken({
      id: user.id,
      phoneNumber: user.phoneNumber,
      email: user.email || undefined,
      role: user.role,
      tier: user.tier,
    });

    const refreshToken = generateRefreshToken({ id: user.id });

    logger.info(`OTP verified for user: ${user.id}`);

    res.status(200).json({
      success: true,
      message: 'Phone number verified successfully',
      data: {
        user: {
          id: user.id,
          phoneNumber: user.phoneNumber,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          tier: user.tier,
          trustScore: user.trustScore,
          charityCoinsBalance: user.charityCoinsBalance,
          wallet: user.wallet,
        },
        token: accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Resend OTP
 */
export const resendOtp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { phoneNumber } = req.body;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { phoneNumber },
    });

    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    // Send OTP
    await sendOTP(phoneNumber);

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Refresh access token
 */
export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;

    const secret = process.env.JWT_REFRESH_SECRET;
    if (!secret) {
      throw new AppError('JWT refresh secret not configured', 500, 'CONFIG_ERROR');
    }

    const decoded = jwt.verify(refreshToken, secret) as { id: string };

    // Find user
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user || !user.isActive) {
      throw new AppError('Invalid refresh token', 401, 'INVALID_REFRESH_TOKEN');
    }

    // Generate new access token
    const accessToken = generateAccessToken({
      id: user.id,
      phoneNumber: user.phoneNumber,
      email: user.email || undefined,
      role: user.role,
      tier: user.tier,
    });

    res.status(200).json({
      success: true,
      data: {
        token: accessToken,
      },
    });
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError('Invalid refresh token', 401, 'INVALID_REFRESH_TOKEN'));
    } else {
      next(error);
    }
  }
};

/**
 * Forgot password - Token-based
 */
export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if user exists to prevent email enumeration
      return res.status(200).json({
        success: true,
        message: 'If an account with this email exists, a password reset link has been sent.',
      });
    }

    // Generate a random token
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Hash the token before storing it in the database
    const passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Set token expiration (e.g., 10 minutes)
    const passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);

    // Update user record with the hashed token and expiration
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken,
        passwordResetExpires,
      },
    });

    // Send the email (with the unhashed token)
    try {
      await sendPasswordResetEmail(user.email!, user.firstName, resetToken);
      res.status(200).json({
        success: true,
        message: 'If an account with this email exists, a password reset link has been sent.',
      });
    } catch (emailError) {
      logger.error('Failed to send password reset email:', emailError);
      // Not throwing an error to the user to avoid revealing email existence
      res.status(200).json({
        success: true,
        message: 'If an account with this email exists, a password reset link has been sent.',
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Reset password - Token-based
 */
export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, newPassword } = req.body;

    // Hash the incoming token to match the one in the database
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Find the user by the hashed token and check if it's not expired
    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: hashedToken,
        passwordResetExpires: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      throw new AppError('Password reset token is invalid or has expired.', 400, 'INVALID_TOKEN');
    }

    // Hash the new password
    const passwordHash = await bcrypt.hash(newPassword, 12);

    // Update the user's password and clear the reset token fields
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });

    logger.info(`Password has been reset for user: ${user.id}`);

    res.status(200).json({
      success: true,
      message: 'Password has been reset successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// Helper functions
function generateAccessToken(payload: any): string {
  const secret = process.env.JWT_SECRET as string;
  const expiresIn = (process.env.JWT_EXPIRES_IN || '1h') as any;

  if (!secret) {
    throw new AppError('JWT secret not configured', 500, 'CONFIG_ERROR');
  }

  return jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions);
}

function generateRefreshToken(payload: any): string {
  const secret = process.env.JWT_REFRESH_SECRET as string;
  const expiresIn = (process.env.JWT_REFRESH_EXPIRES_IN || '30d') as any;

  if (!secret) {
    throw new AppError('JWT refresh secret not configured', 500, 'CONFIG_ERROR');
  }

  return jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions);
}
