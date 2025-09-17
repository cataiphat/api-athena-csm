import { Router } from 'express';
import { NotificationController } from '../controllers/notificationController';
import { authenticate, authorize } from '@/shared/middleware/auth';
import { validateCreateNotification, validateNotificationQuery } from '../validators/notificationValidators';
import { UserRole } from '@prisma/client';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route GET /api/v1/notifications
 * @desc Get user's notifications
 * @access Private (All authenticated users)
 */
router.get('/', validateNotificationQuery, NotificationController.getNotifications);

/**
 * @route GET /api/v1/notifications/unread-count
 * @desc Get unread notification count
 * @access Private (All authenticated users)
 */
router.get('/unread-count', NotificationController.getUnreadCount);

/**
 * @route GET /api/v1/notifications/:id
 * @desc Get notification by ID
 * @access Private (All authenticated users - own notifications only)
 */
router.get('/:id', NotificationController.getNotificationById);

/**
 * @route POST /api/v1/notifications
 * @desc Create new notification
 * @access Private (Super Admin, CS Admin)
 */
router.post(
  '/',
  authorize(UserRole.SUPER_ADMIN, UserRole.CS_ADMIN),
  validateCreateNotification,
  NotificationController.createNotification
);

/**
 * @route PUT /api/v1/notifications/:id/read
 * @desc Mark notification as read
 * @access Private (All authenticated users - own notifications only)
 */
router.put('/:id/read', NotificationController.markAsRead);

/**
 * @route PUT /api/v1/notifications/read-all
 * @desc Mark all notifications as read
 * @access Private (All authenticated users)
 */
router.put('/read-all', NotificationController.markAllAsRead);

/**
 * @route DELETE /api/v1/notifications/:id
 * @desc Delete notification
 * @access Private (All authenticated users - own notifications only)
 */
router.delete('/:id', NotificationController.deleteNotification);

export default router;
