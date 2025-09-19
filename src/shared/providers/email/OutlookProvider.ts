import { Client } from '@microsoft/microsoft-graph-client';
import { AuthenticationProvider } from '@microsoft/microsoft-graph-client';
import { 
  IEmailProvider, 
  EmailMessage, 
  EmailConfig, 
  EmailSendResult, 
  EmailListOptions, 
  EmailListResult 
} from '../interfaces/IEmailProvider';
import { logger } from '@/shared/utils/logger';

class CustomAuthProvider implements AuthenticationProvider {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  async getAccessToken(): Promise<string> {
    return this.accessToken;
  }
}

export class OutlookProvider implements IEmailProvider {
  private graphClient!: Client;
  private config!: EmailConfig;

  async initialize(config: EmailConfig): Promise<void> {
    this.config = config;
    
    if (!config.accessToken) {
      throw new Error('Access token is required for Outlook provider');
    }

    const authProvider = new CustomAuthProvider(config.accessToken);
    this.graphClient = Client.initWithMiddleware({ authProvider });
    
    logger.info('Outlook provider initialized', { email: config.email });
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.graphClient.api('/me').get();
      return true;
    } catch (error) {
      logger.error('Outlook connection test failed', { error: (error as Error).message });
      return false;
    }
  }

  async sendEmail(message: EmailMessage): Promise<EmailSendResult> {
    try {
      const outlookMessage = this.convertToOutlookMessage(message);
      
      const response = await this.graphClient
        .api('/me/sendMail')
        .post({
          message: outlookMessage,
          saveToSentItems: true,
        });

      return {
        success: true,
        messageId: response.id,
      };
    } catch (error) {
      logger.error('Failed to send email via Outlook', { error: (error as Error).message });
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
        query = '',
      } = options;

      let apiCall = this.graphClient
        .api('/me/messages')
        .top(maxResults)
        .orderby('receivedDateTime desc');

      if (query) {
        apiCall = apiCall.search(query);
      }

      const response = await apiCall.get();
      
      const messages: EmailMessage[] = response.value.map((msg: any) => 
        this.convertFromOutlookMessage(msg)
      );

      return {
        messages,
        nextPageToken: response['@odata.nextLink'],
        totalCount: response.value.length,
      };
    } catch (error) {
      logger.error('Failed to get emails from Outlook', { error: (error as Error).message });
      return {
        messages: [],
        totalCount: 0,
      };
    }
  }

  async getEmail(messageId: string): Promise<EmailMessage | null> {
    try {
      const response = await this.graphClient
        .api(`/me/messages/${messageId}`)
        .get();

      return this.convertFromOutlookMessage(response);
    } catch (error) {
      logger.error('Failed to get email from Outlook', { messageId, error: (error as Error).message });
      return null;
    }
  }

  async markAsRead(messageId: string): Promise<boolean> {
    try {
      await this.graphClient
        .api(`/me/messages/${messageId}`)
        .patch({
          isRead: true,
        });
      return true;
    } catch (error) {
      logger.error('Failed to mark email as read', { messageId, error: (error as Error).message });
      return false;
    }
  }

  async deleteEmail(messageId: string): Promise<boolean> {
    try {
      await this.graphClient
        .api(`/me/messages/${messageId}`)
        .delete();
      return true;
    } catch (error) {
      logger.error('Failed to delete email', { messageId, error: (error as Error).message });
      return false;
    }
  }

  async replyToEmail(originalMessageId: string, reply: EmailMessage): Promise<EmailSendResult> {
    try {
      const outlookReply = this.convertToOutlookMessage(reply);
      
      const response = await this.graphClient
        .api(`/me/messages/${originalMessageId}/reply`)
        .post({
          message: outlookReply,
        });

      return {
        success: true,
        messageId: response.id,
      };
    } catch (error) {
      logger.error('Failed to reply to email', { originalMessageId, error: (error as Error).message });
      return { success: false, error: (error as Error).message };
    }
  }

  getProviderType(): string {
    return 'outlook';
  }

  async getUserProfile(): Promise<{ email: string; name?: string; avatar?: string }> {
    try {
      const response = await this.graphClient.api('/me').get();
      return {
        email: response.mail || response.userPrincipalName,
        name: response.displayName,
      };
    } catch (error) {
      logger.error('Failed to get Outlook user profile', { error: (error as Error).message });
      return { email: this.config.email };
    }
  }

  private convertToOutlookMessage(message: EmailMessage): any {
    const outlookMessage: any = {
      subject: message.subject,
      body: {
        contentType: message.isHtml ? 'HTML' : 'Text',
        content: message.body,
      },
      toRecipients: message.to.map(email => ({
        emailAddress: { address: email },
      })),
    };

    if (message.cc && message.cc.length > 0) {
      outlookMessage.ccRecipients = message.cc.map(email => ({
        emailAddress: { address: email },
      }));
    }

    if (message.bcc && message.bcc.length > 0) {
      outlookMessage.bccRecipients = message.bcc.map(email => ({
        emailAddress: { address: email },
      }));
    }

    if (message.attachments && message.attachments.length > 0) {
      outlookMessage.attachments = message.attachments.map(att => ({
        '@odata.type': '#microsoft.graph.fileAttachment',
        name: att.filename,
        contentType: att.contentType,
        contentBytes: Buffer.isBuffer(att.content) 
          ? att.content.toString('base64')
          : Buffer.from(att.content).toString('base64'),
      }));
    }

    return outlookMessage;
  }

  private convertFromOutlookMessage(outlookMessage: any): EmailMessage {
    const message: EmailMessage = {
      id: outlookMessage.id,
      messageId: outlookMessage.internetMessageId,
      from: outlookMessage.from?.emailAddress?.address || '',
      to: outlookMessage.toRecipients?.map((r: any) => r.emailAddress.address) || [],
      cc: outlookMessage.ccRecipients?.map((r: any) => r.emailAddress.address) || [],
      subject: outlookMessage.subject || '',
      body: outlookMessage.body?.content || '',
      isHtml: outlookMessage.body?.contentType === 'HTML',
      receivedAt: new Date(outlookMessage.receivedDateTime),
      sentAt: new Date(outlookMessage.sentDateTime),
      attachments: outlookMessage.attachments?.map((att: any) => ({
        filename: att.name,
        contentType: att.contentType,
        size: att.size,
        content: att.contentBytes ? Buffer.from(att.contentBytes, 'base64') : Buffer.alloc(0),
      })) || [],
    };

    return message;
  }
}
