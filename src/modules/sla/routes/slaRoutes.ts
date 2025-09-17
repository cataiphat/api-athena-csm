import { Router } from 'express';
import { SLAController } from '../controllers/slaController';
import { authenticate, authorize } from '@/shared/middleware/auth';
import { validateCreateSLA, validateUpdateSLA, validateSLAQuery } from '../validators/slaValidators';
import { UserRole } from '@prisma/client';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route GET /api/v1/slas
 * @desc Get all SLAs (with role-based filtering)
 * @access Private (All authenticated users)
 */
router.get('/', validateSLAQuery, SLAController.getSLAs);

/**
 * @route GET /api/v1/slas/:id
 * @desc Get SLA by ID
 * @access Private (All authenticated users with access control)
 */
router.get('/:id', SLAController.getSLAById);

/**
 * @route POST /api/v1/slas
 * @desc Create new SLA
 * @access Private (Super Admin, CS Admin)
 */
router.post(
  '/',
  authorize(UserRole.SUPER_ADMIN, UserRole.CS_ADMIN),
  validateCreateSLA,
  SLAController.createSLA
);

/**
 * @route PUT /api/v1/slas/:id
 * @desc Update SLA
 * @access Private (Super Admin, CS Admin)
 */
router.put(
  '/:id',
  authorize(UserRole.SUPER_ADMIN, UserRole.CS_ADMIN),
  validateUpdateSLA,
  SLAController.updateSLA
);

/**
 * @route DELETE /api/v1/slas/:id
 * @desc Delete SLA
 * @access Private (Super Admin, CS Admin)
 */
router.delete(
  '/:id',
  authorize(UserRole.SUPER_ADMIN, UserRole.CS_ADMIN),
  SLAController.deleteSLA
);

export default router;
