export interface EmailMessage {
  id?: string;
  from: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  body: string;
  isHtml?: boolean;
  attachments?: EmailAttachment[];
  messageId?: string;
  threadId?: string;
  inReplyTo?: string;
  references?: string[];
  receivedAt?: Date;
  sentAt?: Date;
}

export interface EmailAttachment {
  filename: string;
  content: Buffer | string;
  contentType: string;
  size?: number;
  cid?: string; // Content-ID for inline attachments
}

export interface EmailConfig {
  type: 'gmail' | 'outlook';
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  refreshToken?: string;
  accessToken?: string;
  tenantId?: string; // For Outlook
  email: string;
  displayName?: string;
}

export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface EmailListOptions {
  maxResults?: number;
  pageToken?: string;
  query?: string;
  labelIds?: string[];
  includeSpamTrash?: boolean;
}

export interface EmailListResult {
  messages: EmailMessage[];
  nextPageToken?: string;
  totalCount?: number;
}

export interface IEmailProvider {
  /**
   * Initialize the provider with configuration
   */
  initialize(config: EmailConfig): Promise<void>;

  /**
   * Test connection to email service
   */
  testConnection(): Promise<boolean>;

  /**
   * Send an email
   */
  sendEmail(message: EmailMessage): Promise<EmailSendResult>;

  /**
   * Receive/fetch emails
   */
  getEmails(options?: EmailListOptions): Promise<EmailListResult>;

  /**
   * Get a specific email by ID
   */
  getEmail(messageId: string): Promise<EmailMessage | null>;

  /**
   * Mark email as read
   */
  markAsRead(messageId: string): Promise<boolean>;

  /**
   * Delete email
   */
  deleteEmail(messageId: string): Promise<boolean>;

  /**
   * Create a reply to an email
   */
  replyToEmail(originalMessageId: string, reply: EmailMessage): Promise<EmailSendResult>;

  /**
   * Get provider type
   */
  getProviderType(): string;

  /**
   * Get user profile information
   */
  getUserProfile(): Promise<{
    email: string;
    name?: string;
    avatar?: string;
  }>;
}
