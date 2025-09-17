import { Router } from 'express';
import { ChannelController } from '../controllers/channelController';
import { authenticate, authorize } from '@/shared/middleware/auth';
import { validateCreateChannel, validateUpdateChannel, validateChannelQuery } from '../validators/channelValidators';
import { UserRole } from '@prisma/client';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route GET /api/v1/channels
 * @desc Get all channels (with role-based filtering)
 * @access Private (All authenticated users)
 */
router.get('/', validateChannelQuery, ChannelController.getChannels);

/**
 * @route GET /api/v1/channels/:id
 * @desc Get channel by ID
 * @access Private (All authenticated users with access control)
 */
router.get('/:id', ChannelController.getChannelById);

/**
 * @route POST /api/v1/channels
 * @desc Create new channel
 * @access Private (Super Admin, CS Admin)
 */
router.post(
  '/',
  authorize(UserRole.SUPER_ADMIN, UserRole.CS_ADMIN),
  validateCreateChannel,
  ChannelController.createChannel
);

/**
 * @route PUT /api/v1/channels/:id
 * @desc Update channel
 * @access Private (Super Admin, CS Admin)
 */
router.put(
  '/:id',
  authorize(UserRole.SUPER_ADMIN, UserRole.CS_ADMIN),
  validateUpdateChannel,
  ChannelController.updateChannel
);

/**
 * @route DELETE /api/v1/channels/:id
 * @desc Delete channel
 * @access Private (Super Admin, CS Admin)
 */
router.delete(
  '/:id',
  authorize(UserRole.SUPER_ADMIN, UserRole.CS_ADMIN),
  ChannelController.deleteChannel
);

/**
 * @route POST /api/v1/channels/:id/test
 * @desc Test channel connection
 * @access Private (All authenticated users with access control)
 */
router.post('/:id/test', ChannelController.testChannelConnection);

export default router;
