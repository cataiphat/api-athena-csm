import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { authenticate } from '@/shared/middleware/auth';
import { validateLogin, validateRefreshToken } from '../validators/authValidators';

const router = Router();

/**
 * @route POST /api/v1/auth/login
 * @desc Login user
 * @access Public
 */
router.post('/login', validateLogin, AuthController.login);

/**
 * @route POST /api/v1/auth/refresh
 * @desc Refresh access token
 * @access Public
 */
router.post('/refresh', validateRefreshToken, AuthController.refreshToken);

/**
 * @route GET /api/v1/auth/profile
 * @desc Get current user profile
 * @access Private
 */
router.get('/profile', authenticate, AuthController.getProfile);

/**
 * @route POST /api/v1/auth/logout
 * @desc Logout user
 * @access Private
 */
router.post('/logout', authenticate, AuthController.logout);

/**
 * @route GET /api/v1/auth/check-token
 * @desc Check if token is valid
 * @access Private
 */
router.get('/check-token', authenticate, AuthController.checkToken);

export default router;
