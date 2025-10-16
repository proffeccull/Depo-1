import { Router } from 'express';
import {
  adminLogin,
  verifyMFAToken,
  setupTOTP,
  enableTOTP,
  disableTOTP,
  regenerateBackupCodes,
  getMFAStatus,
  getActiveSessions,
  logout,
  logoutAll,
  validateCurrentSession,
} from '../controllers/adminAuth.controller';
import { secureAdminMiddleware, adminSessionMiddleware } from '../middleware/sessionAuth';

const router = Router();

/**
 * @swagger
 * /admin/auth/login:
 *   post:
 *     summary: Admin login with MFA support
 *     tags: [Admin Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phoneNumber
 *               - password
 *             properties:
 *               phoneNumber:
 *                 type: string
 *               password:
 *                 type: string
 *               totpToken:
 *                 type: string
 *               backupCode:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful or MFA required
 */
router.post('/login', adminLogin);

/**
 * @swagger
 * /admin/auth/verify-mfa:
 *   post:
 *     summary: Verify MFA token during login
 *     tags: [Admin Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phoneNumber
 *               - totpToken
 *             properties:
 *               phoneNumber:
 *                 type: string
 *               totpToken:
 *                 type: string
 *               backupCode:
 *                 type: string
 *     responses:
 *       200:
 *         description: MFA verified successfully
 */
router.post('/verify-mfa', verifyMFAToken);

/**
 * @swagger
 * /admin/auth/setup-totp:
 *   post:
 *     summary: Setup TOTP for admin user
 *     tags: [Admin Authentication]
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: TOTP setup initiated
 */
router.post('/setup-totp', adminSessionMiddleware, setupTOTP);

/**
 * @swagger
 * /admin/auth/enable-totp:
 *   post:
 *     summary: Enable TOTP after verification
 *     tags: [Admin Authentication]
 *     security:
 *       - sessionAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - totpToken
 *             properties:
 *               totpToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: TOTP enabled successfully
 */
router.post('/enable-totp', adminSessionMiddleware, enableTOTP);

/**
 * @swagger
 * /admin/auth/disable-totp:
 *   post:
 *     summary: Disable TOTP
 *     tags: [Admin Authentication]
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: TOTP disabled successfully
 */
router.post('/disable-totp', adminSessionMiddleware, disableTOTP);

/**
 * @swagger
 * /admin/auth/regenerate-backup-codes:
 *   post:
 *     summary: Regenerate backup codes
 *     tags: [Admin Authentication]
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: Backup codes regenerated
 */
router.post('/regenerate-backup-codes', adminSessionMiddleware, regenerateBackupCodes);

/**
 * @swagger
 * /admin/auth/mfa-status:
 *   get:
 *     summary: Get MFA status
 *     tags: [Admin Authentication]
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: MFA status retrieved
 */
router.get('/mfa-status', adminSessionMiddleware, getMFAStatus);

/**
 * @swagger
 * /admin/auth/sessions:
 *   get:
 *     summary: Get active sessions
 *     tags: [Admin Authentication]
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: Active sessions retrieved
 */
router.get('/sessions', adminSessionMiddleware, getActiveSessions);

/**
 * @swagger
 * /admin/auth/logout:
 *   post:
 *     summary: Logout from current session
 *     tags: [Admin Authentication]
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
router.post('/logout', adminSessionMiddleware, logout);

/**
 * @swagger
 * /admin/auth/logout-all:
 *   post:
 *     summary: Logout from all sessions
 *     tags: [Admin Authentication]
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: Logged out from all devices
 */
router.post('/logout-all', adminSessionMiddleware, logoutAll);

/**
 * @swagger
 * /admin/auth/validate-session:
 *   get:
 *     summary: Validate current session
 *     tags: [Admin Authentication]
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: Session is valid
 */
router.get('/validate-session', adminSessionMiddleware, validateCurrentSession);

export default router;