export interface MessagingMessage {
  id?: string;
  externalId?: string;
  content: string;
  messageType: 'text' | 'image' | 'file' | 'audio' | 'video' | 'location' | 'sticker';
  direction: 'inbound' | 'outbound';
  senderId?: string;
  recipientId?: string;
  channelId: string;
  timestamp?: Date;
  attachments?: MessagingAttachment[];
  metadata?: Record<string, any>;
  replyTo?: string;
  isDelivered?: boolean;
  isRead?: boolean;
}

export interface MessagingAttachment {
  type: 'image' | 'file' | 'audio' | 'video';
  url: string;
  filename?: string;
  size?: number;
  mimeType?: string;
  thumbnail?: string;
}

export interface MessagingContact {
  id: string;
  name?: string;
  avatar?: string;
  phone?: string;
  email?: string;
  metadata?: Record<string, any>;
}

export interface MessagingConfig {
  type: 'facebook' | 'facebook_fanpage' | 'zalo' | 'telegram';
  appId?: string;
  appSecret?: string;
  accessToken: string;
  verifyToken?: string;
  webhookUrl?: string;
  webhookSecret?: string;
  pageId?: string; // For Facebook Fanpage
  botToken?: string; // For Telegram
  tenantId?: string;
}

export interface MessagingSendResult {
  success: boolean;
  messageId?: string;
  externalId?: string;
  error?: string;
  timestamp?: Date;
}

export interface MessagingListOptions {
  limit?: number;
  offset?: number;
  since?: Date;
  until?: Date;
  senderId?: string;
}

export interface MessagingListResult {
  messages: MessagingMessage[];
  hasMore: boolean;
  nextOffset?: number;
}

export interface WebhookEvent {
  type: 'message' | 'delivery' | 'read' | 'postback' | 'referral';
  timestamp: Date;
  senderId: string;
  recipientId?: string;
  message?: MessagingMessage;
  delivery?: {
    messageIds: string[];
    watermark: number;
  };
  read?: {
    watermark: number;
  };
  postback?: {
    payload: string;
    title?: string;
  };
  referral?: {
    ref: string;
    source: string;
    type: string;
  };
}

export interface IMessagingProvider {
  /**
   * Initialize the provider with configuration
   */
  initialize(config: MessagingConfig): Promise<void>;

  /**
   * Test connection to messaging service
   */
  testConnection(): Promise<boolean>;

  /**
   * Send a message
   */
  sendMessage(message: MessagingMessage): Promise<MessagingSendResult>;

  /**
   * Receive/fetch messages
   */
  getMessages(options?: MessagingListOptions): Promise<MessagingListResult>;

  /**
   * Get a specific message by ID
   */
  getMessage(messageId: string): Promise<MessagingMessage | null>;

  /**
   * Mark message as read
   */
  markAsRead(messageId: string): Promise<boolean>;

  /**
   * Get contact information
   */
  getContact(contactId: string): Promise<MessagingContact | null>;

  /**
   * Set up webhook for receiving messages
   */
  setupWebhook(webhookUrl: string, verifyToken?: string): Promise<boolean>;

  /**
   * Verify webhook signature
   */
  verifyWebhook(signature: string, body: string): boolean;

  /**
   * Process webhook event
   */
  processWebhookEvent(body: any, signature?: string): Promise<WebhookEvent[]>;

  /**
   * Get provider type
   */
  getProviderType(): string;

  /**
   * Get provider capabilities
   */
  getCapabilities(): {
    supportsFiles: boolean;
    supportsImages: boolean;
    supportsAudio: boolean;
    supportsVideo: boolean;
    supportsLocation: boolean;
    supportsStickers: boolean;
    supportsRichMessages: boolean;
    maxFileSize: number;
    supportedFileTypes: string[];
  };
}
