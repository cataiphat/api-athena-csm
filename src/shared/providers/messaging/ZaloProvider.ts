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

export class ZaloProvider implements IMessagingProvider {
  private config: MessagingConfig;
  private apiUrl = 'https://openapi.zalo.me/v2.0/oa';

  async initialize(config: MessagingConfig): Promise<void> {
    this.config = config;
    logger.info('Zalo provider initialized', { appId: config.appId });
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.apiUrl}/getoa`, {
        headers: {
          'access_token': this.config.accessToken,
        },
      });
      return response.status === 200 && response.data.error === 0;
    } catch (error) {
      logger.error('Zalo connection test failed', { error: error.message });
      return false;
    }
  }

  async sendMessage(message: MessagingMessage): Promise<MessagingSendResult> {
    try {
      const payload = this.buildMessagePayload(message);
      
      const response = await axios.post(
        `${this.apiUrl}/message`,
        payload,
        {
          headers: {
            'access_token': this.config.accessToken,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.error === 0) {
        return {
          success: true,
          messageId: response.data.data.message_id,
          externalId: response.data.data.message_id,
          timestamp: new Date(),
        };
      } else {
        return {
          success: false,
          error: response.data.message,
        };
      }
    } catch (error) {
      logger.error('Failed to send Zalo message', { error: error.message });
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async getMessages(options: MessagingListOptions = {}): Promise<MessagingListResult> {
    try {
      const { limit = 10, offset = 0 } = options;
      
      const response = await axios.get(`${this.apiUrl}/conversation`, {
        headers: {
          'access_token': this.config.accessToken,
        },
        params: {
          data: JSON.stringify({
            offset,
            count: limit,
          }),
        },
      });

      if (response.data.error === 0) {
        const messages = response.data.data.map((msg: any) => this.parseZaloMessage(msg));
        
        return {
          messages,
          hasMore: response.data.data.length === limit,
          nextOffset: offset + limit,
        };
      }

      return {
        messages: [],
        hasMore: false,
      };
    } catch (error) {
      logger.error('Failed to get Zalo messages', { error: error.message });
      return {
        messages: [],
        hasMore: false,
      };
    }
  }

  async getMessage(messageId: string): Promise<MessagingMessage | null> {
    // Zalo doesn't provide direct message retrieval by ID
    logger.warn('Zalo getMessage not implemented');
    return null;
  }

  async markAsRead(messageId: string): Promise<boolean> {
    // Zalo doesn't have a specific mark as read API
    // Messages are typically marked as read when responded to
    return true;
  }

  async getContact(contactId: string): Promise<MessagingContact | null> {
    try {
      const response = await axios.get(`${this.apiUrl}/getprofile`, {
        headers: {
          'access_token': this.config.accessToken,
        },
        params: {
          data: JSON.stringify({
            user_id: contactId,
          }),
        },
      });

      if (response.data.error === 0) {
        const profile = response.data.data;
        return {
          id: contactId,
          name: profile.display_name,
          avatar: profile.avatar,
          metadata: {
            userIdByApp: profile.user_id_by_app,
            userGender: profile.user_gender,
            userAlias: profile.user_alias,
          },
        };
      }

      return null;
    } catch (error) {
      logger.error('Failed to get Zalo contact', { contactId, error: error.message });
      return null;
    }
  }

  async setupWebhook(webhookUrl: string, verifyToken?: string): Promise<boolean> {
    try {
      // Zalo webhook setup is typically done through the developer console
      // Here we just validate the webhook URL format
      const url = new URL(webhookUrl);
      logger.info('Zalo webhook setup', { webhookUrl });
      return true;
    } catch (error) {
      logger.error('Invalid webhook URL', { webhookUrl, error: error.message });
      return false;
    }
  }

  verifyWebhook(signature: string, body: string): boolean {
    if (!this.config.appSecret) {
      return false;
    }

    // Zalo uses HMAC-SHA256 for webhook verification
    const expectedSignature = crypto
      .createHmac('sha256', this.config.appSecret)
      .update(body)
      .digest('hex');

    return signature === expectedSignature;
  }

  async processWebhookEvent(body: any, signature?: string): Promise<WebhookEvent[]> {
    const events: WebhookEvent[] = [];

    if (body.event_name === 'user_send_text' || body.event_name === 'user_send_image' || 
        body.event_name === 'user_send_file' || body.event_name === 'user_send_audio') {
      
      const message = this.parseZaloWebhookMessage(body);
      events.push({
        type: 'message',
        timestamp: new Date(body.timestamp),
        senderId: body.sender.id,
        message,
      });
    }

    if (body.event_name === 'user_received_message') {
      events.push({
        type: 'delivery',
        timestamp: new Date(body.timestamp),
        senderId: body.sender.id,
        delivery: {
          messageIds: [body.message.msg_id],
          watermark: body.timestamp,
        },
      });
    }

    if (body.event_name === 'user_seen_message') {
      events.push({
        type: 'read',
        timestamp: new Date(body.timestamp),
        senderId: body.sender.id,
        read: {
          watermark: body.timestamp,
        },
      });
    }

    return events;
  }

  getProviderType(): string {
    return 'zalo';
  }

  getCapabilities() {
    return {
      supportsFiles: true,
      supportsImages: true,
      supportsAudio: true,
      supportsVideo: false, // Zalo OA has limited video support
      supportsLocation: false,
      supportsStickers: true,
      supportsRichMessages: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB
      supportedFileTypes: ['image/*', 'audio/*', 'application/pdf'],
    };
  }

  private buildMessagePayload(message: MessagingMessage): any {
    const payload: any = {
      recipient: {
        user_id: message.recipientId,
      },
    };

    switch (message.messageType) {
      case 'text':
        payload.message = {
          text: message.content,
        };
        break;
      
      case 'image':
        if (message.attachments && message.attachments.length > 0) {
          payload.message = {
            attachment: {
              type: 'template',
              payload: {
                template_type: 'media',
                elements: [{
                  media_type: 'image',
                  url: message.attachments[0].url,
                }],
              },
            },
          };
        }
        break;
      
      case 'file':
        if (message.attachments && message.attachments.length > 0) {
          payload.message = {
            attachment: {
              type: 'file',
              payload: {
                url: message.attachments[0].url,
              },
            },
          };
        }
        break;
      
      default:
        payload.message = {
          text: message.content,
        };
    }

    return payload;
  }

  private parseZaloMessage(zaloMessage: any): MessagingMessage {
    return {
      externalId: zaloMessage.message_id,
      content: zaloMessage.message || zaloMessage.text || '',
      messageType: this.determineMessageType(zaloMessage),
      direction: zaloMessage.src === 1 ? 'outbound' : 'inbound', // src: 1 = from OA, 0 = from user
      senderId: zaloMessage.from_id,
      recipientId: zaloMessage.to_id,
      channelId: this.config.appId || '',
      timestamp: new Date(zaloMessage.time),
      attachments: this.parseZaloAttachments(zaloMessage),
    };
  }

  private parseZaloWebhookMessage(webhookData: any): MessagingMessage {
    let messageType = 'text';
    let content = '';
    const attachments: any[] = [];

    switch (webhookData.event_name) {
      case 'user_send_text':
        content = webhookData.message.text;
        break;
      
      case 'user_send_image':
        messageType = 'image';
        attachments.push({
          type: 'image',
          url: webhookData.message.url,
          thumbnail: webhookData.message.thumb,
        });
        break;
      
      case 'user_send_file':
        messageType = 'file';
        attachments.push({
          type: 'file',
          url: webhookData.message.url,
          filename: webhookData.message.name,
          size: webhookData.message.size,
        });
        break;
      
      case 'user_send_audio':
        messageType = 'audio';
        attachments.push({
          type: 'audio',
          url: webhookData.message.url,
        });
        break;
    }

    return {
      externalId: webhookData.message.msg_id,
      content,
      messageType: messageType as any,
      direction: 'inbound',
      senderId: webhookData.sender.id,
      channelId: this.config.appId || '',
      timestamp: new Date(webhookData.timestamp),
      attachments,
      metadata: {
        eventName: webhookData.event_name,
        appId: webhookData.app_id,
      },
    };
  }

  private determineMessageType(message: any): string {
    if (message.attachments && message.attachments.length > 0) {
      return message.attachments[0].type;
    }
    if (message.type) {
      return message.type;
    }
    return 'text';
  }

  private parseZaloAttachments(message: any): any[] {
    if (!message.attachments) return [];

    return message.attachments.map((att: any) => ({
      type: att.type,
      url: att.payload?.url || att.url,
      filename: att.payload?.name,
      size: att.payload?.size,
    }));
  }
}
