import axios from 'axios';
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

export class FacebookProvider implements IMessagingProvider {
  private config!: MessagingConfig;
  private apiUrl = 'https://graph.facebook.com/v18.0';

  async initialize(config: MessagingConfig): Promise<void> {
    this.config = config;
    logger.info('Facebook Messenger provider initialized', { 
      appId: config.appId,
      pageId: config.pageId 
    });
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.apiUrl}/me`, {
        params: {
          access_token: this.config.accessToken,
        },
      });
      return response.status === 200;
    } catch (error) {
      logger.error('Facebook connection test failed', { error: (error as Error).message });
      return false;
    }
  }

  async sendMessage(message: MessagingMessage): Promise<MessagingSendResult> {
    try {
      const payload = this.buildMessagePayload(message);
      
      const response = await axios.post(
        `${this.apiUrl}/me/messages`,
        payload,
        {
          params: {
            access_token: this.config.accessToken,
          },
        }
      );

      return {
        success: true,
        messageId: response.data.message_id,
        externalId: response.data.message_id,
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('Failed to send Facebook message', { error: (error as Error).message });
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }

  async getMessages(options: MessagingListOptions = {}): Promise<MessagingListResult> {
    // Facebook doesn't provide a direct API to fetch historical messages
    // This would typically be handled through webhooks and stored in database
    logger.warn('Facebook getMessages not implemented - use webhooks for real-time messages');
    return {
      messages: [],
      hasMore: false,
    };
  }

  async getMessage(messageId: string): Promise<MessagingMessage | null> {
    // Facebook doesn't provide direct message retrieval by ID
    logger.warn('Facebook getMessage not implemented');
    return null;
  }

  async markAsRead(messageId: string): Promise<boolean> {
    try {
      await axios.post(
        `${this.apiUrl}/me/messages`,
        {
          recipient: { id: messageId },
          sender_action: 'mark_seen',
        },
        {
          params: {
            access_token: this.config.accessToken,
          },
        }
      );
      return true;
    } catch (error) {
      logger.error('Failed to mark Facebook message as read', { messageId, error: (error as Error).message });
      return false;
    }
  }

  async getContact(contactId: string): Promise<MessagingContact | null> {
    try {
      const response = await axios.get(`${this.apiUrl}/${contactId}`, {
        params: {
          fields: 'first_name,last_name,profile_pic',
          access_token: this.config.accessToken,
        },
      });

      return {
        id: contactId,
        name: `${response.data.first_name} ${response.data.last_name}`.trim(),
        avatar: response.data.profile_pic,
      };
    } catch (error) {
      logger.error('Failed to get Facebook contact', { contactId, error: (error as Error).message });
      return null;
    }
  }

  async setupWebhook(webhookUrl: string, verifyToken?: string): Promise<boolean> {
    try {
      // This would typically be done through Facebook App settings
      // Here we just validate the webhook URL format
      const url = new URL(webhookUrl);
      logger.info('Facebook webhook setup', { webhookUrl, verifyToken });
      return true;
    } catch (error) {
      logger.error('Invalid webhook URL', { webhookUrl, error: (error as Error).message });
      return false;
    }
  }

  verifyWebhook(signature: string, body: string): boolean {
    if (!this.config.appSecret) {
      return false;
    }

    const expectedSignature = crypto
      .createHmac('sha256', this.config.appSecret)
      .update(body)
      .digest('hex');

    return signature === `sha256=${expectedSignature}`;
  }

  async processWebhookEvent(body: any, signature?: string): Promise<WebhookEvent[]> {
    const events: WebhookEvent[] = [];

    if (body.object === 'page') {
      for (const entry of body.entry) {
        if (entry.messaging) {
          for (const messagingEvent of entry.messaging) {
            const event = this.parseMessagingEvent(messagingEvent);
            if (event) {
              events.push(event);
            }
          }
        }
      }
    }

    return events;
  }

  getProviderType(): string {
    return 'facebook';
  }

  getCapabilities() {
    return {
      supportsFiles: true,
      supportsImages: true,
      supportsAudio: true,
      supportsVideo: true,
      supportsLocation: true,
      supportsStickers: false,
      supportsRichMessages: true,
      maxFileSize: 25 * 1024 * 1024, // 25MB
      supportedFileTypes: ['image/*', 'video/*', 'audio/*', 'application/pdf'],
    };
  }

  private buildMessagePayload(message: MessagingMessage): any {
    const payload: any = {
      recipient: { id: message.recipientId },
    };

    switch (message.messageType) {
      case 'text':
        payload.message = { text: message.content };
        break;
      
      case 'image':
      case 'file':
      case 'audio':
      case 'video':
        if (message.attachments && message.attachments.length > 0) {
          payload.message = {
            attachment: {
              type: message.attachments?.[0]?.type || 'file',
              payload: {
                url: message.attachments?.[0]?.url || '',
                is_reusable: true,
              },
            },
          };
        }
        break;
      
      default:
        payload.message = { text: message.content };
    }

    return payload;
  }

  private parseMessagingEvent(messagingEvent: any): WebhookEvent | null {
    const timestamp = new Date(messagingEvent.timestamp);
    const senderId = messagingEvent.sender.id;
    const recipientId = messagingEvent.recipient.id;

    if (messagingEvent.message) {
      const message: MessagingMessage = {
        externalId: messagingEvent.message.mid,
        content: messagingEvent.message.text || '',
        messageType: this.determineMessageType(messagingEvent.message) as any,
        direction: 'inbound',
        senderId,
        recipientId,
        channelId: this.config.pageId || '',
        timestamp,
        attachments: this.parseAttachments(messagingEvent.message.attachments),
      };

      return {
        type: 'message',
        timestamp,
        senderId,
        recipientId,
        message,
      };
    }

    if (messagingEvent.delivery) {
      return {
        type: 'delivery',
        timestamp,
        senderId,
        recipientId,
        delivery: {
          messageIds: messagingEvent.delivery.mids || [],
          watermark: messagingEvent.delivery.watermark,
        },
      };
    }

    if (messagingEvent.read) {
      return {
        type: 'read',
        timestamp,
        senderId,
        recipientId,
        read: {
          watermark: messagingEvent.read.watermark,
        },
      };
    }

    if (messagingEvent.postback) {
      return {
        type: 'postback',
        timestamp,
        senderId,
        recipientId,
        postback: {
          payload: messagingEvent.postback.payload,
          title: messagingEvent.postback.title,
        },
      };
    }

    return null;
  }

  private determineMessageType(message: any): string {
    if (message.attachments && message.attachments.length > 0) {
      return message.attachments[0].type;
    }
    return 'text';
  }

  private parseAttachments(attachments: any[]): any[] {
    if (!attachments) return [];

    return attachments.map(att => ({
      type: att.type,
      url: att.payload.url,
      mimeType: att.payload.mime_type,
    }));
  }
}
