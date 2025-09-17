import { Router } from 'express';
import { DepartmentController } from '../controllers/departmentController';
import { authenticate, authorize } from '@/shared/middleware/auth';
import { validateCreateDepartment, validateUpdateDepartment, validateDepartmentQuery } from '../validators/departmentValidators';
import { UserRole } from '@prisma/client';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route GET /api/v1/departments
 * @desc Get all departments (with role-based filtering)
 * @access Private (All authenticated users)
 */
router.get('/', validateDepartmentQuery, DepartmentController.getDepartments);

/**
 * @route GET /api/v1/departments/:id
 * @desc Get department by ID
 * @access Private (All authenticated users with access control)
 */
router.get('/:id', DepartmentController.getDepartmentById);

/**
 * @route POST /api/v1/departments
 * @desc Create new department
 * @access Private (Super Admin, CS Admin)
 */
router.post(
  '/',
  authorize(UserRole.SUPER_ADMIN, UserRole.CS_ADMIN),
  validateCreateDepartment,
  DepartmentController.createDepartment
);

/**
 * @route PUT /api/v1/departments/:id
 * @desc Update department
 * @access Private (Super Admin, CS Admin)
 */
router.put(
  '/:id',
  authorize(UserRole.SUPER_ADMIN, UserRole.CS_ADMIN),
  validateUpdateDepartment,
  DepartmentController.updateDepartment
);

/**
 * @route DELETE /api/v1/departments/:id
 * @desc Delete department
 * @access Private (Super Admin, CS Admin)
 */
router.delete(
  '/:id',
  authorize(UserRole.SUPER_ADMIN, UserRole.CS_ADMIN),
  DepartmentController.deleteDepartment
);

export default router;
