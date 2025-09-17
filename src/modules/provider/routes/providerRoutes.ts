import { Router } from 'express';
import { ProviderController } from '../controllers/providerController';
import { authenticate } from '@/shared/middleware/auth';
import { validateRequest } from '@/shared/middleware/validation';
import { providerValidators } from '../validators/providerValidators';

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

// Email provider routes
router.post(
  '/channels/:channelId/email/send',
  validateRequest(providerValidators.sendEmail),
  ProviderController.sendEmail
);

router.get(
  '/channels/:channelId/email/receive',
  ProviderController.receiveEmails
);

// Messaging provider routes
router.post(
  '/channels/:channelId/message/send',
  validateRequest(providerValidators.sendMessage),
  ProviderController.sendMessage
);

// Webhook routes (no authentication required for incoming webhooks)
router.post(
  '/channels/:channelId/webhook',
  ProviderController.handleWebhook
);

router.get(
  '/channels/:channelId/webhook/verify',
  ProviderController.verifyWebhook
);

// Provider management routes
router.post(
  '/channels/:channelId/test',
  ProviderController.testConnection
);

router.get(
  '/providers/supported',
  ProviderController.getSupportedProviders
);

router.get(
  '/providers/:providerType/capabilities',
  ProviderController.getProviderCapabilities
);

export default router;
