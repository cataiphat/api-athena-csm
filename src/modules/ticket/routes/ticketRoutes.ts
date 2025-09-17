import { Router } from 'express';
import { TicketController } from '../controllers/ticketController';
import { authenticate, authorize } from '@/shared/middleware/auth';
import { uploadMultiple } from '@/shared/middleware/upload';
import {
  validateCreateTicket,
  validateUpdateTicket,
  validateAddComment,
  validateTicketQuery
} from '../validators/ticketValidators';
import { UserRole } from '@prisma/client';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route GET /api/v1/tickets
 * @desc Get all tickets (with role-based filtering)
 * @access Private (All authenticated users)
 */
router.get('/', validateTicketQuery, TicketController.getTickets);

/**
 * @route GET /api/v1/tickets/stats
 * @desc Get ticket statistics
 * @access Private (All authenticated users)
 */
router.get('/stats', TicketController.getTicketStats);

/**
 * @route GET /api/v1/tickets/:id
 * @desc Get ticket by ID
 * @access Private (All authenticated users with access control)
 */
router.get('/:id', TicketController.getTicketById);

/**
 * @route POST /api/v1/tickets
 * @desc Create new ticket
 * @access Private (All authenticated users)
 */
router.post(
  '/',
  uploadMultiple('attachments', 10),
  validateCreateTicket,
  TicketController.createTicket
);

/**
 * @route PUT /api/v1/tickets/:id
 * @desc Update ticket
 * @access Private (All authenticated users with access control)
 */
router.put('/:id', validateUpdateTicket, TicketController.updateTicket);

/**
 * @route DELETE /api/v1/tickets/:id
 * @desc Delete ticket (soft delete)
 * @access Private (Super Admin, CS Admin)
 */
router.delete(
  '/:id',
  authorize(UserRole.SUPER_ADMIN, UserRole.CS_ADMIN),
  TicketController.deleteTicket
);

/**
 * @route POST /api/v1/tickets/:id/comments
 * @desc Add comment to ticket
 * @access Private (All authenticated users with access control)
 */
router.post('/:id/comments', validateAddComment, TicketController.addComment);

export default router;
