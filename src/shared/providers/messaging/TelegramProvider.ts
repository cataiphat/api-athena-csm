import TelegramBot from 'node-telegram-bot-api';
import crypto from 'crypto';
import { 
  IMessagingProvider, 
  MessagingMessage, 
  MessagingConfig, 
  MessagingSendResult, 
  MessagingListOptions, 
  MessagingListResult,
  WebhookEvent,
  MessagingContact
} from '../interfaces/IMessagingProvider';
import { logger } from '@/shared/utils/logger';

export class TelegramProvider implements IMessagingProvider {
  private bot!: TelegramBot;
  private config!: MessagingConfig;

  async initialize(config: MessagingConfig): Promise<void> {
    this.config = config;
    
    if (!config.botToken) {
      throw new Error('Bot token is required for Telegram provider');
    }

    this.bot = new TelegramBot(config.botToken, { polling: false });
    
    logger.info('Telegram provider initialized', { botToken: config.botToken.substring(0, 10) + '...' });
  }

  async testConnection(): Promise<boolean> {
    try {
      const me = await this.bot.getMe();
      return !!me.id;
    } catch (error) {
      logger.error('Telegram connection test failed', { error: (error as Error).message });
      return false;
    }
  }

  async sendMessage(message: MessagingMessage): Promise<MessagingSendResult> {
    try {
      let result: any;

      switch (message.messageType) {
        case 'text':
          result = await this.bot.sendMessage(message.recipientId!, message.content);
          break;
        
        case 'image':
          if (message.attachments && message.attachments.length > 0) {
            result = await this.bot.sendPhoto(
              message.recipientId!, 
              message.attachments?.[0]?.url || '',
              { caption: message.content }
            );
          }
          break;
        
        case 'file':
          if (message.attachments && message.attachments.length > 0) {
            result = await this.bot.sendDocument(
              message.recipientId!, 
              message.attachments?.[0]?.url || '',
              { caption: message.content }
            );
          }
          break;
        
        case 'audio':
          if (message.attachments && message.attachments.length > 0) {
            result = await this.bot.sendAudio(
              message.recipientId!, 
              message.attachments?.[0]?.url || '',
              { caption: message.content }
            );
          }
          break;
        
        case 'video':
          if (message.attachments && message.attachments.length > 0) {
            result = await this.bot.sendVideo(
              message.recipientId!, 
              message.attachments?.[0]?.url || '',
              { caption: message.content }
            );
          }
          break;
        
        case 'location':
          if (message.metadata?.latitude && message.metadata?.longitude) {
            result = await this.bot.sendLocation(
              message.recipientId!,
              message.metadata.latitude,
              message.metadata.longitude
            );
          }
          break;
        
        default:
          result = await this.bot.sendMessage(message.recipientId!, message.content);
      }

      return {
        success: true,
        messageId: result.message_id.toString(),
        externalId: result.message_id.toString(),
        timestamp: new Date(result.date * 1000),
      };
    } catch (error) {
      logger.error('Failed to send Telegram message', { error: (error as Error).message });
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }

  async getMessages(options: MessagingListOptions = {}): Promise<MessagingListResult> {
    // Telegram doesn't provide a direct API to fetch historical messages
    // This would typically be handled through webhooks and stored in database
    logger.warn('Telegram getMessages not implemented - use webhooks for real-time messages');
    return {
      messages: [],
      hasMore: false,
    };
  }

  async getMessage(messageId: string): Promise<MessagingMessage | null> {
    // Telegram doesn't provide direct message retrieval by ID
    logger.warn('Telegram getMessage not implemented');
    return null;
  }

  async markAsRead(messageId: string): Promise<boolean> {
    // Telegram doesn't have a mark as read API
    // Messages are automatically marked as read when received
    return true;
  }

  async getContact(contactId: string): Promise<MessagingContact | null> {
    try {
      const chatMember = await this.bot.getChatMember(contactId, parseInt(contactId));
      const user = chatMember.user;
      
      return {
        id: user.id.toString(),
        name: `${user.first_name} ${user.last_name || ''}`.trim(),
        metadata: {
          username: user.username,
          languageCode: user.language_code,
        },
      };
    } catch (error) {
      logger.error('Failed to get Telegram contact', { contactId, error: (error as Error).message });
      return null;
    }
  }

  async setupWebhook(webhookUrl: string, verifyToken?: string): Promise<boolean> {
    try {
      const result = await this.bot.setWebHook(webhookUrl, {
        secret_token: this.config.webhookSecret,
      });
      
      logger.info('Telegram webhook setup', { webhookUrl, success: result });
      return result;
    } catch (error) {
      logger.error('Failed to setup Telegram webhook', { webhookUrl, error: (error as Error).message });
      return false;
    }
  }

  verifyWebhook(signature: string, body: string): boolean {
    if (!this.config.webhookSecret) {
      return true; // No secret configured, skip verification
    }

    const expectedSignature = crypto
      .createHmac('sha256', this.config.webhookSecret)
      .update(body)
      .digest('hex');

    return signature === expectedSignature;
  }

  async processWebhookEvent(body: any, signature?: string): Promise<WebhookEvent[]> {
    const events: WebhookEvent[] = [];

    if (body.message) {
      const message = this.parseTelegramMessage(body.message);
      events.push({
        type: 'message',
        timestamp: new Date(body.message.date * 1000),
        senderId: body.message.from.id.toString(),
        message,
      });
    }

    if (body.callback_query) {
      events.push({
        type: 'postback',
        timestamp: new Date(),
        senderId: body.callback_query.from.id.toString(),
        postback: {
          payload: body.callback_query.data,
          title: body.callback_query.message?.text,
        },
      });
    }

    return events;
  }

  getProviderType(): string {
    return 'telegram';
  }

  getCapabilities() {
    return {
      supportsFiles: true,
      supportsImages: true,
      supportsAudio: true,
      supportsVideo: true,
      supportsLocation: true,
      supportsStickers: true,
      supportsRichMessages: true,
      maxFileSize: 50 * 1024 * 1024, // 50MB
      supportedFileTypes: ['*/*'], // Telegram supports most file types
    };
  }

  private parseTelegramMessage(telegramMessage: any): MessagingMessage {
    let messageType = 'text';
    let content = telegramMessage.text || telegramMessage.caption || '';
    const attachments: any[] = [];

    if (telegramMessage.photo) {
      messageType = 'image';
      const photo = telegramMessage.photo[telegramMessage.photo.length - 1]; // Get highest resolution
      attachments.push({
        type: 'image',
        url: `https://api.telegram.org/file/bot${this.config.botToken}/${photo.file_path}`,
        size: photo.file_size,
      });
    } else if (telegramMessage.document) {
      messageType = 'file';
      attachments.push({
        type: 'file',
        url: `https://api.telegram.org/file/bot${this.config.botToken}/${telegramMessage.document.file_path}`,
        filename: telegramMessage.document.file_name,
        size: telegramMessage.document.file_size,
        mimeType: telegramMessage.document.mime_type,
      });
    } else if (telegramMessage.audio) {
      messageType = 'audio';
      attachments.push({
        type: 'audio',
        url: `https://api.telegram.org/file/bot${this.config.botToken}/${telegramMessage.audio.file_path}`,
        size: telegramMessage.audio.file_size,
        mimeType: telegramMessage.audio.mime_type,
      });
    } else if (telegramMessage.video) {
      messageType = 'video';
      attachments.push({
        type: 'video',
        url: `https://api.telegram.org/file/bot${this.config.botToken}/${telegramMessage.video.file_path}`,
        size: telegramMessage.video.file_size,
        mimeType: telegramMessage.video.mime_type,
      });
    } else if (telegramMessage.location) {
      messageType = 'location';
      content = `Location: ${telegramMessage.location.latitude}, ${telegramMessage.location.longitude}`;
    } else if (telegramMessage.sticker) {
      messageType = 'sticker';
      content = telegramMessage.sticker.emoji || 'Sticker';
      attachments.push({
        type: 'image',
        url: `https://api.telegram.org/file/bot${this.config.botToken}/${telegramMessage.sticker.file_path}`,
        size: telegramMessage.sticker.file_size,
      });
    }

    return {
      externalId: telegramMessage.message_id.toString(),
      content,
      messageType: messageType as any,
      direction: 'inbound',
      senderId: telegramMessage.from.id.toString(),
      channelId: telegramMessage.chat.id.toString(),
      timestamp: new Date(telegramMessage.date * 1000),
      attachments,
      metadata: {
        chatType: telegramMessage.chat.type,
        chatTitle: telegramMessage.chat.title,
        username: telegramMessage.from.username,
        firstName: telegramMessage.from.first_name,
        lastName: telegramMessage.from.last_name,
        location: telegramMessage.location,
      },
    };
  }
}
