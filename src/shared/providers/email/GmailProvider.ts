import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { 
  IEmailProvider, 
  EmailMessage, 
  EmailConfig, 
  EmailSendResult, 
  EmailListOptions, 
  EmailListResult 
} from '../interfaces/IEmailProvider';
import { logger } from '@/shared/utils/logger';

export class GmailProvider implements IEmailProvider {
  private oauth2Client!: OAuth2Client;
  private gmail!: any;
  private config!: EmailConfig;

  async initialize(config: EmailConfig): Promise<void> {
    this.config = config;
    
    this.oauth2Client = new OAuth2Client(
      config.clientId,
      config.clientSecret,
      config.redirectUri
    );

    if (config.refreshToken) {
      this.oauth2Client.setCredentials({
        refresh_token: config.refreshToken,
        access_token: config.accessToken,
      });
    }

    this.gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
    
    logger.info('Gmail provider initialized', { email: config.email });
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await this.gmail.users.getProfile({ userId: 'me' });
      return response.status === 200;
    } catch (error) {
      logger.error('Gmail connection test failed', { error: (error as Error).message });
      return false;
    }
  }

  async sendEmail(message: EmailMessage): Promise<EmailSendResult> {
    try {
      const emailContent = this.buildEmailContent(message);
      
      const response = await this.gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: Buffer.from(emailContent).toString('base64url'),
        },
      });

      return {
        success: true,
        messageId: response.data.id,
      };
    } catch (error) {
      logger.error('Failed to send email via Gmail', { error: (error as Error).message });
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }

  async getEmails(options: EmailListOptions = {}): Promise<EmailListResult> {
    try {
      const {
        maxResults = 10,
        pageToken,
        query = '',
        labelIds = ['INBOX'],
        includeSpamTrash = false,
      } = options;

      const response = await this.gmail.users.messages.list({
        userId: 'me',
        maxResults,
        pageToken,
        q: query,
        labelIds,
        includeSpamTrash,
      });

      const messages: EmailMessage[] = [];
      
      if (response.data.messages) {
        for (const msg of response.data.messages) {
          const fullMessage = await this.getEmail(msg.id);
          if (fullMessage) {
            messages.push(fullMessage);
          }
        }
      }

      return {
        messages,
        nextPageToken: response.data.nextPageToken,
        totalCount: response.data.resultSizeEstimate,
      };
    } catch (error) {
      logger.error('Failed to get emails from Gmail', { error: (error as Error).message });
      return {
        messages: [],
        totalCount: 0,
      };
    }
  }

  async getEmail(messageId: string): Promise<EmailMessage | null> {
    try {
      const response = await this.gmail.users.messages.get({
        userId: 'me',
        id: messageId,
        format: 'full',
      });

      return this.parseGmailMessage(response.data);
    } catch (error) {
      logger.error('Failed to get email from Gmail', { messageId, error: (error as Error).message });
      return null;
    }
  }

  async markAsRead(messageId: string): Promise<boolean> {
    try {
      await this.gmail.users.messages.modify({
        userId: 'me',
        id: messageId,
        requestBody: {
          removeLabelIds: ['UNREAD'],
        },
      });
      return true;
    } catch (error) {
      logger.error('Failed to mark email as read', { messageId, error: (error as Error).message });
      return false;
    }
  }

  async deleteEmail(messageId: string): Promise<boolean> {
    try {
      await this.gmail.users.messages.delete({
        userId: 'me',
        id: messageId,
      });
      return true;
    } catch (error) {
      logger.error('Failed to delete email', { messageId, error: (error as Error).message });
      return false;
    }
  }

  async replyToEmail(originalMessageId: string, reply: EmailMessage): Promise<EmailSendResult> {
    try {
      const originalMessage = await this.getEmail(originalMessageId);
      if (!originalMessage) {
        return { success: false, error: 'Original message not found' };
      }

      // Set reply headers
      reply.inReplyTo = originalMessage.messageId;
      reply.references = originalMessage.references || [];
      if (originalMessage.messageId) {
        reply.references.push(originalMessage.messageId);
      }
      reply.subject = reply.subject.startsWith('Re:') ? reply.subject : `Re: ${originalMessage.subject}`;

      return this.sendEmail(reply);
    } catch (error) {
      logger.error('Failed to reply to email', { originalMessageId, error: (error as Error).message });
      return { success: false, error: (error as Error).message };
    }
  }

  getProviderType(): string {
    return 'gmail';
  }

  async getUserProfile(): Promise<{ email: string; name?: string; avatar?: string }> {
    try {
      const response = await this.gmail.users.getProfile({ userId: 'me' });
      return {
        email: response.data.emailAddress,
        name: this.config.displayName,
      };
    } catch (error) {
      logger.error('Failed to get Gmail user profile', { error: (error as Error).message });
      return { email: this.config.email };
    }
  }

  private buildEmailContent(message: EmailMessage): string {
    const boundary = `boundary_${Date.now()}`;
    let content = '';

    // Headers
    content += `From: ${message.from}\r\n`;
    content += `To: ${message.to.join(', ')}\r\n`;
    if (message.cc && message.cc.length > 0) {
      content += `Cc: ${message.cc.join(', ')}\r\n`;
    }
    if (message.bcc && message.bcc.length > 0) {
      content += `Bcc: ${message.bcc.join(', ')}\r\n`;
    }
    content += `Subject: ${message.subject}\r\n`;
    
    if (message.inReplyTo) {
      content += `In-Reply-To: ${message.inReplyTo}\r\n`;
    }
    if (message.references && message.references.length > 0) {
      content += `References: ${message.references.join(' ')}\r\n`;
    }

    content += `MIME-Version: 1.0\r\n`;
    content += `Content-Type: multipart/mixed; boundary="${boundary}"\r\n\r\n`;

    // Body
    content += `--${boundary}\r\n`;
    content += `Content-Type: ${message.isHtml ? 'text/html' : 'text/plain'}; charset=UTF-8\r\n\r\n`;
    content += `${message.body}\r\n\r\n`;

    // Attachments
    if (message.attachments && message.attachments.length > 0) {
      for (const attachment of message.attachments) {
        content += `--${boundary}\r\n`;
        content += `Content-Type: ${attachment.contentType}\r\n`;
        content += `Content-Disposition: attachment; filename="${attachment.filename}"\r\n`;
        content += `Content-Transfer-Encoding: base64\r\n\r\n`;
        
        const base64Content = Buffer.isBuffer(attachment.content) 
          ? attachment.content.toString('base64')
          : Buffer.from(attachment.content).toString('base64');
        
        content += `${base64Content}\r\n\r\n`;
      }
    }

    content += `--${boundary}--\r\n`;
    return content;
  }

  private parseGmailMessage(gmailMessage: any): EmailMessage {
    const headers = gmailMessage.payload.headers;
    const getHeader = (name: string) => headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase())?.value || '';

    const message: EmailMessage = {
      id: gmailMessage.id,
      messageId: getHeader('Message-ID'),
      threadId: gmailMessage.threadId,
      from: getHeader('From'),
      to: getHeader('To').split(',').map((email: string) => email.trim()),
      cc: getHeader('Cc') ? getHeader('Cc').split(',').map((email: string) => email.trim()) : [],
      subject: getHeader('Subject'),
      body: this.extractBody(gmailMessage.payload),
      inReplyTo: getHeader('In-Reply-To'),
      references: getHeader('References') ? getHeader('References').split(' ') : [],
      receivedAt: new Date(parseInt(gmailMessage.internalDate)),
      attachments: this.extractAttachments(gmailMessage.payload),
    };

    return message;
  }

  private extractBody(payload: any): string {
    if (payload.body && payload.body.data) {
      return Buffer.from(payload.body.data, 'base64url').toString();
    }

    if (payload.parts) {
      for (const part of payload.parts) {
        if (part.mimeType === 'text/plain' || part.mimeType === 'text/html') {
          if (part.body && part.body.data) {
            return Buffer.from(part.body.data, 'base64url').toString();
          }
        }
      }
    }

    return '';
  }

  private extractAttachments(payload: any): any[] {
    const attachments: any[] = [];

    if (payload.parts) {
      for (const part of payload.parts) {
        if (part.filename && part.body && part.body.attachmentId) {
          attachments.push({
            filename: part.filename,
            contentType: part.mimeType,
            size: part.body.size,
            attachmentId: part.body.attachmentId,
          });
        }
      }
    }

    return attachments;
  }
}
