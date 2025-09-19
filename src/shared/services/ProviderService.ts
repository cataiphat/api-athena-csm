import { PrismaClient } from '@prisma/client';
import { ProviderFactory } from '../providers/ProviderFactory';
import { IEmailProvider, EmailMessage, EmailConfig } from '../providers/interfaces/IEmailProvider';
import { IMessagingProvider, MessagingMessage, MessagingConfig } from '../providers/interfaces/IMessagingProvider';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export class ProviderService {
  /**
   * Send email through configured provider
   */
  static async sendEmail(channelId: string, message: EmailMessage): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const channel = await prisma.channel.findUnique({
        where: { id: channelId },
        include: { company: true },
      });

      if (!channel) {
        return { success: false, error: 'Channel not found' };
      }

      if (channel.type !== 'EMAIL') {
        return { success: false, error: 'Channel is not an email channel' };
      }

      const config = channel.config as any;
      const emailConfig: EmailConfig = {
        type: config.provider,
        email: config.email,
        clientId: config.clientId,
        clientSecret: config.clientSecret,
        redirectUri: config.redirectUri,
        refreshToken: config.refreshToken,
        accessToken: config.accessToken,
        tenantId: config.tenantId,
        displayName: config.displayName,
      };

      const provider = await ProviderFactory.createEmailProvider(emailConfig);
      const result = await provider.sendEmail(message);

      // Log the email activity
      if (result.success) {
        await this.logEmailActivity(channelId, 'sent', message, result.messageId);
      }

      return result;
    } catch (error : any) {
      logger.error('Failed to send email', { channelId, error: (error as Error).message });
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * Receive emails from configured provider
   */
  static async receiveEmails(channelId: string, options?: any): Promise<EmailMessage[]> {
    try {
      const channel = await prisma.channel.findUnique({
        where: { id: channelId },
      });

      if (!channel || channel.type !== 'EMAIL') {
        return [];
      }

      const config = channel.config as any;
      const emailConfig: EmailConfig = {
        type: config.provider,
        email: config.email,
        clientId: config.clientId,
        clientSecret: config.clientSecret,
        redirectUri: config.redirectUri,
        refreshToken: config.refreshToken,
        accessToken: config.accessToken,
        tenantId: config.tenantId,
        displayName: config.displayName,
      };

      const provider = await ProviderFactory.createEmailProvider(emailConfig);
      const result = await provider.getEmails(options);

      // Log received emails
      for (const email of result.messages) {
        await this.logEmailActivity(channelId, 'received', email, email.id);
      }

      return result.messages;
    } catch (error: any) {
      logger.error('Failed to receive emails', { channelId, error: (error as Error).message });
      return [];
    }
  }

  /**
   * Send message through configured messaging provider
   */
  static async sendMessage(channelId: string, message: MessagingMessage): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const channel = await prisma.channel.findUnique({
        where: { id: channelId },
        include: { company: true },
      });

      if (!channel) {
        return { success: false, error: 'Channel not found' };
      }

      if (!['FACEBOOK', 'TELEGRAM', 'ZALO'].includes(channel.type)) {
        return { success: false, error: 'Channel is not a messaging channel' };
      }

      const config = channel.config as any;
      const messagingConfig: MessagingConfig = {
        type: config.provider,
        appId: config.appId,
        appSecret: config.appSecret,
        accessToken: config.accessToken,
        botToken: config.botToken,
        pageId: config.pageId,
        webhookUrl: config.webhookUrl,
        webhookSecret: config.webhookSecret,
      };

      const provider = await ProviderFactory.createMessagingProvider(messagingConfig);
      const result = await provider.sendMessage(message);

      // Log the message activity
      if (result.success) {
        await this.logMessageActivity(channelId, 'sent', message, result.messageId);
      }

      return result;
    } catch (error: any) {
      logger.error('Failed to send message', { channelId, error: (error as Error).message });
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * Process incoming webhook from messaging providers
   */
  static async processWebhook(channelId: string, body: any, signature?: string): Promise<{ success: boolean; events?: any[]; error?: string }> {
    try {
      const channel = await prisma.channel.findUnique({
        where: { id: channelId },
      });

      if (!channel) {
        return { success: false, error: 'Channel not found' };
      }

      const config = channel.config as any;
      const messagingConfig: MessagingConfig = {
        type: config.provider,
        appId: config.appId,
        appSecret: config.appSecret,
        accessToken: config.accessToken,
        botToken: config.botToken,
        pageId: config.pageId,
        webhookUrl: config.webhookUrl,
        webhookSecret: config.webhookSecret,
      };

      const provider = await ProviderFactory.createMessagingProvider(messagingConfig);
      
      // Verify webhook signature if provided
      if (signature && !provider.verifyWebhook(signature, JSON.stringify(body))) {
        return { success: false, error: 'Invalid webhook signature' };
      }

      const events = await provider.processWebhookEvent(body, signature);

      // Process each event
      for (const event of events) {
        if (event.type === 'message' && event.message) {
          await this.logMessageActivity(channelId, 'received', event.message, event.message.externalId);
          
          // Create ticket if needed
          await this.createTicketFromMessage(channelId, event.message, event.senderId);
        }
      }

      return { success: true, events };
    } catch (error: any) {
      logger.error('Failed to process webhook', { channelId, error: (error as Error).message });
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * Test provider connection
   */
  static async testConnection(channelId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const channel = await prisma.channel.findUnique({
        where: { id: channelId },
      });

      if (!channel) {
        return { success: false, error: 'Channel not found' };
      }

      const config = channel.config as any;

      if (channel.type === 'EMAIL') {
        const emailConfig: EmailConfig = {
          type: config.provider,
          email: config.email,
          clientId: config.clientId,
          clientSecret: config.clientSecret,
          redirectUri: config.redirectUri,
          refreshToken: config.refreshToken,
          accessToken: config.accessToken,
          tenantId: config.tenantId,
          displayName: config.displayName,
        };

        return await ProviderFactory.testProviderConnection('email', emailConfig);
      } else {
        const messagingConfig: MessagingConfig = {
          type: config.provider,
          appId: config.appId,
          appSecret: config.appSecret,
          accessToken: config.accessToken,
          botToken: config.botToken,
          pageId: config.pageId,
          webhookUrl: config.webhookUrl,
          webhookSecret: config.webhookSecret,
        };

        return await ProviderFactory.testProviderConnection('messaging', messagingConfig);
      }
    } catch (error: any) {
      logger.error('Failed to test connection', { channelId, error: (error as Error).message });
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * Log email activity
   */
  private static async logEmailActivity(channelId: string, direction: 'sent' | 'received', email: EmailMessage, messageId?: string): Promise<void> {
    try {
      await prisma.channelMessage.create({
        data: {
          externalId: messageId || email.id,
          content: `${email.subject}\n\n${email.body}`,
          messageType: 'email',
          direction,
          channelId,
          metadata: {
            from: email.from,
            to: email.to,
            cc: email.cc,
            subject: email.subject,
            attachments: email.attachments?.length || 0,
          },
        },
      });
    } catch (error: any) {
      logger.error('Failed to log email activity', { channelId, direction, error: (error as Error).message });
    }
  }

  /**
   * Log message activity
   */
  private static async logMessageActivity(channelId: string, direction: 'sent' | 'received', message: MessagingMessage, messageId?: string): Promise<void> {
    try {
      await prisma.channelMessage.create({
        data: {
          externalId: messageId || message.externalId,
          content: message.content,
          messageType: message.messageType,
          direction,
          channelId,
          metadata: {
            senderId: message.senderId,
            recipientId: message.recipientId,
            attachments: message.attachments?.length || 0,
            ...message.metadata,
          },
        },
      });
    } catch (error: any) {
      logger.error('Failed to log message activity', { channelId, direction, error: (error as Error).message });
    }
  }

  /**
   * Create ticket from incoming message
   */
  private static async createTicketFromMessage(channelId: string, message: MessagingMessage, senderId: string): Promise<void> {
    try {
      // Find or create customer
      let customer = await prisma.customer.findFirst({
        where: {
          OR: [
            { externalId: senderId },
            { phone: senderId },
            { email: senderId },
          ],
        },
      });

      if (!customer) {
        const channel = await prisma.channel.findUnique({
          where: { id: channelId },
          include: { company: true },
        });

        customer = await prisma.customer.create({
          data: {
            cif: `CIF${Date.now()}`,
            externalId: senderId,
            firstName: `Customer`,
            lastName: senderId,
            companyId: channel!.companyId,
          },
        });
      }

      // Check if there's an open ticket for this customer
      let ticket = await prisma.ticket.findFirst({
        where: {
          customerId: customer.id,
          status: {
            in: ['WAIT', 'PROCESS'],
          },
        },
      });

      if (!ticket) {
        // Create new ticket
        ticket = await prisma.ticket.create({
          data: {
            ticketNumber: `MSG${Date.now().toString().slice(-6)}`,
            title: `Message from ${customer.firstName} ${customer.lastName}`,
            description: message.content,
            type: 'INQUIRY',
            priority: 'MEDIUM',
            status: 'WAIT',
            source: 'CHANNEL',
            customerId: customer.id,
            companyId: customer.companyId,
            channelId,
            creatorId: customer.id, // Temporary - should be system user
            departmentId: '', // Will be assigned later
          },
        });
      }

      // Add message as comment
      await prisma.ticketComment.create({
        data: {
          content: message.content,
          isInternal: false,
          ticketId: ticket.id,
          authorId: customer.id, // Using customer ID as author
        },
      });

    } catch (error) {
      logger.error('Failed to create ticket from message', { channelId, senderId, error: (error as Error).message });
    }
  }
}
