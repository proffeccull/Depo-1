import { Router } from 'express';
import { auth } from '../middleware/auth';
import {
  generateChallenge,
  registerBiometric,
  authenticateBiometric,
  getBiometricRegistrations,
  removeBiometricRegistration,
  checkBiometricStatus,
  updateBiometricSettings,
} from '../controllers/biometric.controller';

const router = Router();

// Generate biometric challenge (requires auth)
router.post('/challenge', auth, generateChallenge);

// Register biometric credentials (requires auth)
router.post('/register', auth, registerBiometric);

// Authenticate with biometric (no auth required for initial biometric login)
router.post('/authenticate', authenticateBiometric);

// Get biometric registrations (requires auth)
router.get('/registrations', auth, getBiometricRegistrations);

// Check biometric status (requires auth)
router.get('/status', auth, checkBiometricStatus);

// Update biometric settings (requires auth)
router.put('/settings', auth, updateBiometricSettings);

// Remove biometric registration (requires auth)
router.delete('/registrations/:deviceId', auth, removeBiometricRegistration);

export default router;