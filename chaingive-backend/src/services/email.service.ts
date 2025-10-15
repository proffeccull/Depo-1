import nodemailer from 'nodemailer';
import logger from '../utils/logger';

// SMTP configuration
const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587');
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASSWORD = process.env.SMTP_PASSWORD || '';
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@chaingive.ng';
const FROM_NAME = process.env.FROM_NAME || 'ChainGive';

// Create transporter
let transporter: nodemailer.Transporter | null = null;

export function initializeEmailService() {
  if (!SMTP_USER || !SMTP_PASSWORD) {
    logger.warn('SMTP credentials not configured. Email service disabled.');
    return null;
  }

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465, // true for 465, false for other ports
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASSWORD,
    },
  });

  // Verify connection
  transporter.verify((error, _success) => {
    if (error) {
      logger.error('Email service configuration error:', error);
    } else {
      logger.info('✅ Email service ready to send messages');
    }
  });

  return transporter;
}

/**
 * Send email
 */
export async function sendEmail(
  to: string,
  subject: string,
  html: string,
  text?: string
): Promise<boolean> {
  try {
    if (!transporter && !initializeEmailService()) {
      logger.warn('Email service not configured. Email not sent.');
      logger.info(`[DEV MODE] Email to ${to}: ${subject}`);
      return false;
    }

    const info = await transporter!.sendMail({
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to,
      subject,
      text: text || subject,
      html,
    });

    logger.info(`Email sent to ${to}: ${info.messageId}`);
    return true;
  } catch (error) {
    logger.error(`Failed to send email to ${to}:`, error);
    return false;
  }
}

/**
 * Send welcome email
 */
export async function sendWelcomeEmail(email: string, firstName: string): Promise<boolean> {
  const subject = 'Welcome to ChainGive! 🎉';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Welcome to ChainGive!</h1>
        </div>
        <div class="content">
          <h2>Hi ${firstName},</h2>
          <p>Welcome to the ChainGive community! We're thrilled to have you join us on this journey of generosity and giving.</p>
          
          <h3>What's Next?</h3>
          <ul>
            <li>✅ Complete your profile</li>
            <li>✅ Verify your identity (KYC)</li>
            <li>✅ Make your first donation</li>
            <li>✅ Start earning Charity Coins</li>
          </ul>

          <p>ChainGive is more than just giving—it's about creating a chain of generosity that transforms lives across Nigeria.</p>

          <a href="https://app.chaingive.ng" class="button">Open ChainGive App</a>

          <p>Need help? Our support team is here for you 24/7.</p>

          <p>Let's change lives together! 💚</p>

          <p>Best regards,<br><strong>The ChainGive Team</strong></p>
        </div>
        <div class="footer">
          <p>ChainGive - Pay It Forward, Change Lives</p>
          <p>This email was sent to ${email}</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail(email, subject, html);
}

/**
 * Send donation receipt email
 */
export async function sendDonationReceiptEmail(
  email: string,
  firstName: string,
  amount: number,
  recipient: string,
  transactionRef: string,
  date: Date
): Promise<boolean> {
  const subject = `Donation Receipt - ₦${amount.toLocaleString()}`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #10b981; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #fff; padding: 30px; border: 1px solid #e5e7eb; }
        .receipt-box { background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>💚 Donation Receipt</h1>
        </div>
        <div class="content">
          <h2>Thank You, ${firstName}!</h2>
          <p>Your donation has been successfully processed. Here are the details:</p>
          
          <div class="receipt-box">
            <div class="row">
              <strong>Amount:</strong>
              <span>₦${amount.toLocaleString()}</span>
            </div>
            <div class="row">
              <strong>Recipient:</strong>
              <span>${recipient}</span>
            </div>
            <div class="row">
              <strong>Transaction ID:</strong>
              <span>${transactionRef}</span>
            </div>
            <div class="row">
              <strong>Date:</strong>
              <span>${date.toLocaleDateString('en-NG')}</span>
            </div>
            <div class="row">
              <strong>Status:</strong>
              <span style="color: #f59e0b;">Pending Confirmation</span>
            </div>
          </div>

          <h3>What Happens Next?</h3>
          <ol>
            <li>Recipient confirms receipt (24-48 hours)</li>
            <li>Funds held in escrow for 48 hours</li>
            <li>Funds released to recipient</li>
            <li>You earn 50 Charity Coins! 🪙</li>
          </ol>

          <p>Your generosity creates ripples of change. Thank you for being part of the ChainGive community!</p>

          <p>Best regards,<br><strong>The ChainGive Team</strong></p>
        </div>
        <div class="footer">
          <p>ChainGive - Pay It Forward, Change Lives</p>
          <p>Questions? Contact us at support@chaingive.ng</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail(email, subject, html);
}

/**
 * Send receipt confirmation email
 */
export async function sendReceiptConfirmationEmail(
  email: string,
  firstName: string,
  amount: number,
  recipient: string,
  transactionRef: string
): Promise<boolean> {
  const subject = `Donation Received - ₦${amount.toLocaleString()}`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #3b82f6; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #fff; padding: 30px; border: 1px solid #e5e7eb; }
        .highlight-box { background: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
        .button { display: inline-block; padding: 12px 30px; background: #3b82f6; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎁 You Received a Donation!</h1>
        </div>
        <div class="content">
          <h2>Hi ${firstName},</h2>
          <p>Great news! You've received a donation through ChainGive.</p>
          
          <div class="highlight-box">
            <h2 style="margin: 0; color: #1e40af;">₦${amount.toLocaleString()}</h2>
            <p style="margin: 5px 0; color: #1e40af;">from ${recipient}</p>
            <p style="margin: 5px 0; font-size: 12px; color: #64748b;">Ref: ${transactionRef}</p>
          </div>

          <h3>Next Steps:</h3>
          <ol>
            <li><strong>Funds in Escrow:</strong> Your donation is held securely for 48 hours</li>
            <li><strong>Release to Wallet:</strong> After 48 hours, funds move to your wallet</li>
            <li><strong>Pay It Forward:</strong> Complete your cycle by donating to someone else</li>
          </ol>

          <a href="https://app.chaingive.ng/wallet" class="button">View Wallet</a>

          <p>Remember, you're now obligated to pay it forward within 90 days. Keep the chain of giving alive! 🔄</p>

          <p>Best regards,<br><strong>The ChainGive Team</strong></p>
        </div>
        <div class="footer">
          <p>ChainGive - Pay It Forward, Change Lives</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail(email, subject, html);
}

/**
 * Send escrow release notification email
 */
export async function sendEscrowReleaseEmail(
  email: string,
  firstName: string,
  amount: number
): Promise<boolean> {
  const subject = `Funds Released - ₦${amount.toLocaleString()}`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #10b981; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #fff; padding: 30px; border: 1px solid #e5e7eb; }
        .highlight-box { background: #d1fae5; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; border: 2px solid #10b981; }
        .button { display: inline-block; padding: 12px 30px; background: #10b981; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>💰 Funds Released!</h1>
        </div>
        <div class="content">
          <h2>Hi ${firstName},</h2>
          <p>Great news! Your escrow period has ended and funds have been released to your wallet.</p>
          
          <div class="highlight-box">
            <h2 style="margin: 0; color: #059669;">₦${amount.toLocaleString()}</h2>
            <p style="margin: 5px 0; color: #059669;">Available in Your Wallet</p>
          </div>

          <h3>You Can Now:</h3>
          <ul>
            <li>✅ Use funds to pay forward your obligation</li>
            <li>✅ Help someone else in the community</li>
            <li>✅ Keep the chain of giving alive</li>
          </ul>

          <a href="https://app.chaingive.ng/donate" class="button">Donate Now</a>

          <p><strong>Remember:</strong> You have 90 days to complete your cycle. Every act of giving creates a ripple of positive change!</p>

          <p>Best regards,<br><strong>The ChainGive Team</strong></p>
        </div>
        <div class="footer">
          <p>ChainGive - Pay It Forward, Change Lives</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail(email, subject, html);
}

/**
 * Send cycle reminder email
 */
export async function sendCycleReminderEmail(
  email: string,
  firstName: string,
  amount: number,
  daysLeft: number
): Promise<boolean> {
  const subject = `Reminder: Cycle Due in ${daysLeft} Days`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f59e0b; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #fff; padding: 30px; border: 1px solid #e5e7eb; }
        .warning-box { background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b; }
        .button { display: inline-block; padding: 12px 30px; background: #f59e0b; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⏰ Cycle Reminder</h1>
        </div>
        <div class="content">
          <h2>Hi ${firstName},</h2>
          <p>This is a friendly reminder that your donation cycle is due soon.</p>
          
          <div class="warning-box">
            <h3 style="margin-top: 0;">Due in ${daysLeft} days</h3>
            <p style="font-size: 18px; margin: 10px 0;"><strong>Amount: ₦${amount.toLocaleString()}</strong></p>
            <p style="margin: 0; color: #92400e;">Complete your cycle to maintain your trust score</p>
          </div>

          <h3>What You Need to Do:</h3>
          <ol>
            <li>Open the ChainGive app</li>
            <li>Select a recipient from the matching system</li>
            <li>Complete your donation of ₦${amount.toLocaleString()}</li>
          </ol>

          <a href="https://app.chaingive.ng/donate" class="button">Complete Cycle Now</a>

          <p><strong>Why It Matters:</strong> Completing your cycle on time helps maintain your trust score and keeps the chain of giving alive for others.</p>

          <p>Thank you for being a responsible member of the ChainGive community!</p>

          <p>Best regards,<br><strong>The ChainGive Team</strong></p>
        </div>
        <div class="footer">
          <p>ChainGive - Pay It Forward, Change Lives</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail(email, subject, html);
}

/**
 * Send monthly summary email
 */
export async function sendMonthlySummaryEmail(
  email: string,
  firstName: string,
  stats: {
    totalDonated: number;
    totalReceived: number;
    cyclesCompleted: number;
    coinsEarned: number;
    leaderboardRank: number | null;
  }
): Promise<boolean> {
  const subject = 'Your Monthly ChainGive Summary 📊';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #fff; padding: 30px; border: 1px solid #e5e7eb; }
        .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
        .stat-box { background: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center; }
        .stat-value { font-size: 24px; font-weight: bold; color: #667eea; margin: 10px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📊 Your Monthly Summary</h1>
        </div>
        <div class="content">
          <h2>Hi ${firstName},</h2>
          <p>Here's a summary of your amazing impact this month on ChainGive!</p>
          
          <div class="stats-grid">
            <div class="stat-box">
              <div>💚 Total Donated</div>
              <div class="stat-value">₦${stats.totalDonated.toLocaleString()}</div>
            </div>
            <div class="stat-box">
              <div>🎁 Total Received</div>
              <div class="stat-value">₦${stats.totalReceived.toLocaleString()}</div>
            </div>
            <div class="stat-box">
              <div>🔄 Cycles Completed</div>
              <div class="stat-value">${stats.cyclesCompleted}</div>
            </div>
            <div class="stat-box">
              <div>🪙 Coins Earned</div>
              <div class="stat-value">${stats.coinsEarned}</div>
            </div>
          </div>

          ${stats.leaderboardRank ? `
            <div style="background: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
              <h3 style="margin: 0; color: #1e40af;">🏆 Leaderboard Rank</h3>
              <div style="font-size: 36px; font-weight: bold; color: #1e40af; margin: 10px 0;">#${stats.leaderboardRank}</div>
              <p style="margin: 0; color: #1e40af;">Keep it up!</p>
            </div>
          ` : ''}

          <h3>Your Impact:</h3>
          <p>Through your generosity, you've helped ${stats.cyclesCompleted} people this month. Each donation creates a ripple effect, touching countless lives in the community.</p>

          <p>Thank you for being a champion of change! 💪</p>

          <p>Best regards,<br><strong>The ChainGive Team</strong></p>
        </div>
        <div class="footer">
          <p>ChainGive - Pay It Forward, Change Lives</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail(email, subject, html);
}

/**
 * Send KYC approval email
 */
export async function sendKYCApprovalEmail(email: string, firstName: string): Promise<boolean> {
  const subject = 'KYC Verification Approved ✅';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #10b981; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #fff; padding: 30px; border: 1px solid #e5e7eb; }
        .success-box { background: #d1fae5; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; border: 2px solid #10b981; }
        .button { display: inline-block; padding: 12px 30px; background: #10b981; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Verification Complete!</h1>
        </div>
        <div class="content">
          <h2>Congratulations, ${firstName}!</h2>
          
          <div class="success-box">
            <h3 style="margin: 0; color: #059669;">✓ Your Account is Verified</h3>
            <p style="margin: 10px 0; color: #059669;">You can now access all ChainGive features</p>
          </div>

          <h3>You Can Now:</h3>
          <ul>
            <li>✅ Send and receive donations</li>
            <li>✅ Complete donation cycles</li>
            <li>✅ Earn Charity Coins</li>
            <li>✅ Redeem marketplace items</li>
            <li>✅ Climb the leaderboard</li>
          </ul>

          <a href="https://app.chaingive.ng/donate" class="button">Start Giving</a>

          <p>Welcome to the verified ChainGive community. Let's change lives together!</p>

          <p>Best regards,<br><strong>The ChainGive Team</strong></p>
        </div>
        <div class="footer">
          <p>ChainGive - Pay It Forward, Change Lives</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail(email, subject, html);
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(email: string, firstName: string, resetToken: string): Promise<boolean> {
  const subject = 'Reset Your ChainGive Password';
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #3b82f6; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #fff; padding: 30px; border: 1px solid #e5e7eb; }
        .button { display: inline-block; padding: 12px 30px; background: #3b82f6; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔑 Password Reset Request</h1>
        </div>
        <div class="content">
          <h2>Hi ${firstName},</h2>
          <p>We received a request to reset your password. Click the button below to choose a new one. This link will expire in 10 minutes.</p>

          <a href="${resetUrl}" class="button">Reset Your Password</a>

          <p>If you didn't request a password reset, you can safely ignore this email.</p>

          <p>Best regards,<br><strong>The ChainGive Team</strong></p>
        </div>
        <div class="footer">
          <p>ChainGive - Pay It Forward, Change Lives</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail(email, subject, html);
}


// Initialize on module load
if (process.env.NODE_ENV === 'production') {
  initializeEmailService();
}
