import { Router } from 'express';
import { CompanyController } from '../controllers/companyController';
import { authenticate, authorize } from '@/shared/middleware/auth';
import { validateCreateCompany, validateUpdateCompany, validateCompanyQuery } from '../validators/companyValidators';
import { UserRole } from '@prisma/client';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route GET /api/v1/companies
 * @desc Get all companies (Super Admin only)
 * @access Private (Super Admin)
 */
router.get(
  '/',
  authorize(UserRole.SUPER_ADMIN),
  validateCompanyQuery,
  CompanyController.getCompanies
);

/**
 * @route GET /api/v1/companies/:id
 * @desc Get company by ID
 * @access Private (Super Admin or company members)
 */
router.get('/:id', CompanyController.getCompanyById);

/**
 * @route GET /api/v1/companies/:id/stats
 * @desc Get company statistics
 * @access Private (Super Admin or company members)
 */
router.get('/:id/stats', CompanyController.getCompanyStats);

/**
 * @route POST /api/v1/companies
 * @desc Create new company
 * @access Private (Super Admin only)
 */
router.post(
  '/',
  authorize(UserRole.SUPER_ADMIN),
  validateCreateCompany,
  CompanyController.createCompany
);

/**
 * @route PUT /api/v1/companies/:id
 * @desc Update company
 * @access Private (Super Admin or CS Admin of the company)
 */
router.put('/:id', validateUpdateCompany, CompanyController.updateCompany);

/**
 * @route DELETE /api/v1/companies/:id
 * @desc Delete company
 * @access Private (Super Admin only)
 */
router.delete(
  '/:id',
  authorize(UserRole.SUPER_ADMIN),
  CompanyController.deleteCompany
);

export default router;
