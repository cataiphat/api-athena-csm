import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { authenticate, authorize } from '@/shared/middleware/auth';
import { validateCreateUser, validateUpdateUser, validateUserQuery } from '../validators/userValidators';
import { UserRole } from '@prisma/client';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route GET /api/v1/users
 * @desc Get all users (with pagination and filters)
 * @access Private (All authenticated users with role-based filtering)
 */
router.get('/', validateUserQuery, UserController.getUsers);

/**
 * @route GET /api/v1/users/:id
 * @desc Get user by ID
 * @access Private (All authenticated users with role-based filtering)
 */
router.get('/:id', UserController.getUserById);

/**
 * @route POST /api/v1/users
 * @desc Create new user
 * @access Private (Super Admin, CS Admin)
 */
router.post(
  '/',
  authorize(UserRole.SUPER_ADMIN, UserRole.CS_ADMIN),
  validateCreateUser,
  UserController.createUser
);

/**
 * @route PUT /api/v1/users/:id
 * @desc Update user
 * @access Private (Super Admin, CS Admin, or own profile)
 */
router.put('/:id', validateUpdateUser, UserController.updateUser);

/**
 * @route DELETE /api/v1/users/:id
 * @desc Delete user (soft delete)
 * @access Private (Super Admin, CS Admin)
 */
router.delete(
  '/:id',
  authorize(UserRole.SUPER_ADMIN, UserRole.CS_ADMIN),
  UserController.deleteUser
);

export default router;
