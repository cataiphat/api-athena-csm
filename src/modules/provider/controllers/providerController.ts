import { Response, NextFunction } from 'express';
import { PrismaClient, UserRole } from '@prisma/client';
import { AuthenticatedRequest } from '@/shared/types';
import { NotFoundError, ValidationError, ForbiddenError } from '@/shared/utils/AppError';
import { ProviderService } from '@/shared/services/ProviderService';
import { ProviderFactory } from '@/shared/providers/ProviderFactory';
import { logger } from '@/shared/utils/logger';

const prisma = new PrismaClient();

export class ProviderController {
  /**
   * Send email through provider
   */
  static async sendEmail(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ForbiddenError('Authentication required');
      }

      const { channelId } = req.params;

      if (!channelId) {
        throw new ValidationError('Channel ID is required');
      }
      const { to, cc, bcc, subject, body, isHtml = false, attachments = [] } = req.body;

      // Validate channel access
      const channel = await prisma.channel.findUnique({
        where: { id: channelId },
      });

      if (!channel) {
        throw new NotFoundError('Channel not found');
      }

      // Check permissions
      const hasAccess = 
        req.user.role === UserRole.SUPER_ADMIN ||
        (req.user.role === UserRole.CS_ADMIN && channel.companyId === req.user.companyId) ||
        (channel.companyId === req.user.companyId);

      if (!hasAccess) {
        throw new ForbiddenError('Access denied to this channel');
      }

      const emailMessage = {
        from: req.user.email,
        to: Array.isArray(to) ? to : [to],
        cc: cc ? (Array.isArray(cc) ? cc : [cc]) : [],
        bcc: bcc ? (Array.isArray(bcc) ? bcc : [bcc]) : [],
        subject,
        body,
        isHtml,
        attachments,
      };

      const result = await ProviderService.sendEmail(channelId, emailMessage);

      res.json({
        success: result.success,
        message: result.success ? 'Email sent successfully' : 'Failed to send email',
        data: result.success ? { messageId: result.messageId } : null,
        error: result.error,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Receive emails from provider
   */
  static async receiveEmails(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ForbiddenError('Authentication required');
      }

      const { channelId } = req.params;

      if (!channelId) {
        throw new ValidationError('Channel ID is required');
      }

      const { maxResults = 10, query = '', includeSpamTrash = false } = req.query;

      // Validate channel access
      const channel = await prisma.channel.findUnique({
        where: { id: channelId },
      });

      if (!channel) {
        throw new NotFoundError('Channel not found');
      }

      // Check permissions
      const hasAccess = 
        req.user.role === UserRole.SUPER_ADMIN ||
        (req.user.role === UserRole.CS_ADMIN && channel.companyId === req.user.companyId) ||
        (channel.companyId === req.user.companyId);

      if (!hasAccess) {
        throw new ForbiddenError('Access denied to this channel');
      }

      const emails = await ProviderService.receiveEmails(channelId, {
        maxResults: parseInt(maxResults as string),
        query: query as string,
        includeSpamTrash: includeSpamTrash === 'true',
      });

      res.json({
        success: true,
        message: 'Emails retrieved successfully',
        data: {
          emails,
          count: emails.length,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Send message through messaging provider
   */
  static async sendMessage(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ForbiddenError('Authentication required');
      }

      const { channelId } = req.params;

      if (!channelId) {
        throw new ValidationError('Channel ID is required');
      }

      const { recipientId, content, messageType = 'text', attachments = [] } = req.body;

      // Validate channel access
      const channel = await prisma.channel.findUnique({
        where: { id: channelId },
      });

      if (!channel) {
        throw new NotFoundError('Channel not found');
      }

      // Check permissions
      const hasAccess = 
        req.user.role === UserRole.SUPER_ADMIN ||
        (req.user.role === UserRole.CS_ADMIN && channel.companyId === req.user.companyId) ||
        (channel.companyId === req.user.companyId);

      if (!hasAccess) {
        throw new ForbiddenError('Access denied to this channel');
      }

      const message = {
        content,
        messageType,
        direction: 'outbound' as const,
        recipientId,
        channelId,
        attachments,
        timestamp: new Date(),
      };

      const result = await ProviderService.sendMessage(channelId, message);

      res.json({
        success: result.success,
        message: result.success ? 'Message sent successfully' : 'Failed to send message',
        data: result.success ? { messageId: result.messageId } : null,
        error: result.error,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handle webhook from messaging providers
   */
  static async handleWebhook(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { channelId } = req.params;

      if (!channelId) {
        throw new ValidationError('Channel ID is required');
      }

      const signature = req.headers['x-hub-signature-256'] as string ||
                       req.headers['x-telegram-bot-api-secret-token'] as string ||
                       req.headers['x-zalo-signature'] as string;

      const result = await ProviderService.processWebhook(channelId, req.body, signature);

      if (result.success) {
        res.json({
          success: true,
          message: 'Webhook processed successfully',
          data: {
            eventsProcessed: result.events?.length || 0,
          },
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Failed to process webhook',
          error: result.error,
        });
      }
    } catch (error) {
      next(error);
    }
  }

  /**
   * Verify webhook (for Facebook, etc.)
   */
  static async verifyWebhook(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { channelId } = req.params;

      if (!channelId) {
        return res.status(400).send('Channel ID is required');
      }

      const mode = req.query['hub.mode'];
      const token = req.query['hub.verify_token'];
      const challenge = req.query['hub.challenge'];

      // Get channel configuration
      const channel = await prisma.channel.findUnique({
        where: { id: channelId },
      });

      if (!channel) {
        return res.status(404).send('Channel not found');
      }

      const config = channel.config as any;

      if (mode === 'subscribe' && token === config.verifyToken) {
        logger.info('Webhook verified successfully', { channelId });
        res.status(200).send(challenge);
      } else {
        logger.warn('Webhook verification failed', { channelId, mode, token });
        res.status(403).send('Forbidden');
      }
    } catch (error) {
      next(error);
    }
  }

  /**
   * Test provider connection
   */
  static async testConnection(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ForbiddenError('Authentication required');
      }

      const { channelId } = req.params;

      if (!channelId) {
        throw new ValidationError('Channel ID is required');
      }

      // Validate channel access
      const channel = await prisma.channel.findUnique({
        where: { id: channelId },
      });

      if (!channel) {
        throw new NotFoundError('Channel not found');
      }

      // Check permissions
      const hasAccess = 
        req.user.role === UserRole.SUPER_ADMIN ||
        (req.user.role === UserRole.CS_ADMIN && channel.companyId === req.user.companyId) ||
        (channel.companyId === req.user.companyId);

      if (!hasAccess) {
        throw new ForbiddenError('Access denied to this channel');
      }

      const result = await ProviderService.testConnection(channelId);

      res.json({
        success: result.success,
        message: result.success ? 'Connection test successful' : 'Connection test failed',
        error: result.error,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get supported providers
   */
  static async getSupportedProviders(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const emailProviders = ProviderFactory.getSupportedEmailProviders();
      const messagingProviders = ProviderFactory.getSupportedMessagingProviders();

      res.json({
        success: true,
        message: 'Supported providers retrieved successfully',
        data: {
          email: emailProviders.map(type => ({
            type,
            name: type.charAt(0).toUpperCase() + type.slice(1),
            capabilities: ProviderFactory.getProviderCapabilities(type as any),
          })),
          messaging: messagingProviders.map(type => ({
            type,
            name: type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' '),
            capabilities: ProviderFactory.getProviderCapabilities(type as any),
          })),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get provider capabilities
   */
  static async getProviderCapabilities(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { providerType } = req.params;
      
      const capabilities = ProviderFactory.getProviderCapabilities(providerType as any);

      res.json({
        success: true,
        message: 'Provider capabilities retrieved successfully',
        data: {
          providerType,
          capabilities,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
