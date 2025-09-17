import { IEmailProvider, EmailConfig } from './interfaces/IEmailProvider';
import { IMessagingProvider, MessagingConfig } from './interfaces/IMessagingProvider';
import { GmailProvider } from './email/GmailProvider';
import { OutlookProvider } from './email/OutlookProvider';
import { FacebookProvider } from './messaging/FacebookProvider';
import { TelegramProvider } from './messaging/TelegramProvider';
import { ZaloProvider } from './messaging/ZaloProvider';
import { logger } from '@/shared/utils/logger';

export type ProviderType = 'gmail' | 'outlook' | 'facebook' | 'facebook_fanpage' | 'telegram' | 'zalo';

export class ProviderFactory {
  private static emailProviders = new Map<string, IEmailProvider>();
  private static messagingProviders = new Map<string, IMessagingProvider>();

  /**
   * Create and initialize an email provider
   */
  static async createEmailProvider(config: EmailConfig): Promise<IEmailProvider> {
    const cacheKey = `${config.type}_${config.email}`;
    
    // Return cached provider if exists
    if (this.emailProviders.has(cacheKey)) {
      return this.emailProviders.get(cacheKey)!;
    }

    let provider: IEmailProvider;

    switch (config.type) {
      case 'gmail':
        provider = new GmailProvider();
        break;
      
      case 'outlook':
        provider = new OutlookProvider();
        break;
      
      default:
        throw new Error(`Unsupported email provider type: ${config.type}`);
    }

    await provider.initialize(config);
    this.emailProviders.set(cacheKey, provider);
    
    logger.info('Email provider created and cached', { type: config.type, email: config.email });
    return provider;
  }

  /**
   * Create and initialize a messaging provider
   */
  static async createMessagingProvider(config: MessagingConfig): Promise<IMessagingProvider> {
    const cacheKey = `${config.type}_${config.appId || config.botToken}`;
    
    // Return cached provider if exists
    if (this.messagingProviders.has(cacheKey)) {
      return this.messagingProviders.get(cacheKey)!;
    }

    let provider: IMessagingProvider;

    switch (config.type) {
      case 'facebook':
      case 'facebook_fanpage':
        provider = new FacebookProvider();
        break;
      
      case 'telegram':
        provider = new TelegramProvider();
        break;
      
      case 'zalo':
        provider = new ZaloProvider();
        break;
      
      default:
        throw new Error(`Unsupported messaging provider type: ${config.type}`);
    }

    await provider.initialize(config);
    this.messagingProviders.set(cacheKey, provider);
    
    logger.info('Messaging provider created and cached', { type: config.type });
    return provider;
  }

  /**
   * Get all supported email provider types
   */
  static getSupportedEmailProviders(): string[] {
    return ['gmail', 'outlook'];
  }

  /**
   * Get all supported messaging provider types
   */
  static getSupportedMessagingProviders(): string[] {
    return ['facebook', 'facebook_fanpage', 'telegram', 'zalo'];
  }

  /**
   * Validate email provider configuration
   */
  static validateEmailConfig(config: EmailConfig): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!config.type) {
      errors.push('Provider type is required');
    }

    if (!config.email) {
      errors.push('Email address is required');
    }

    if (!config.clientId) {
      errors.push('Client ID is required');
    }

    if (!config.clientSecret) {
      errors.push('Client secret is required');
    }

    if (!config.redirectUri) {
      errors.push('Redirect URI is required');
    }

    switch (config.type) {
      case 'gmail':
        if (!config.refreshToken) {
          errors.push('Refresh token is required for Gmail');
        }
        break;
      
      case 'outlook':
        if (!config.tenantId) {
          errors.push('Tenant ID is required for Outlook');
        }
        if (!config.accessToken) {
          errors.push('Access token is required for Outlook');
        }
        break;
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate messaging provider configuration
   */
  static validateMessagingConfig(config: MessagingConfig): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!config.type) {
      errors.push('Provider type is required');
    }

    if (!config.accessToken && !config.botToken) {
      errors.push('Access token or bot token is required');
    }

    switch (config.type) {
      case 'facebook':
      case 'facebook_fanpage':
        if (!config.appId) {
          errors.push('App ID is required for Facebook');
        }
        if (!config.appSecret) {
          errors.push('App secret is required for Facebook');
        }
        if (!config.accessToken) {
          errors.push('Access token is required for Facebook');
        }
        if (config.type === 'facebook_fanpage' && !config.pageId) {
          errors.push('Page ID is required for Facebook Fanpage');
        }
        break;
      
      case 'telegram':
        if (!config.botToken) {
          errors.push('Bot token is required for Telegram');
        }
        break;
      
      case 'zalo':
        if (!config.appId) {
          errors.push('App ID is required for Zalo');
        }
        if (!config.appSecret) {
          errors.push('App secret is required for Zalo');
        }
        if (!config.accessToken) {
          errors.push('Access token is required for Zalo');
        }
        break;
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Test connection for a provider configuration
   */
  static async testProviderConnection(
    type: 'email' | 'messaging',
    config: EmailConfig | MessagingConfig
  ): Promise<{ success: boolean; error?: string }> {
    try {
      if (type === 'email') {
        const provider = await this.createEmailProvider(config as EmailConfig);
        const success = await provider.testConnection();
        return { success };
      } else {
        const provider = await this.createMessagingProvider(config as MessagingConfig);
        const success = await provider.testConnection();
        return { success };
      }
    } catch (error) {
      logger.error('Provider connection test failed', { type, error: (error as Error).message });
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * Clear cached providers
   */
  static clearCache(): void {
    this.emailProviders.clear();
    this.messagingProviders.clear();
    logger.info('Provider cache cleared');
  }

  /**
   * Get provider capabilities
   */
  static getProviderCapabilities(providerType: ProviderType): any {
    switch (providerType) {
      case 'gmail':
      case 'outlook':
        return {
          supportsAttachments: true,
          supportsHtml: true,
          supportsThreading: true,
          maxAttachmentSize: 25 * 1024 * 1024, // 25MB
        };
      
      case 'facebook':
      case 'facebook_fanpage':
        return {
          supportsFiles: true,
          supportsImages: true,
          supportsAudio: true,
          supportsVideo: true,
          supportsLocation: true,
          supportsRichMessages: true,
          maxFileSize: 25 * 1024 * 1024, // 25MB
        };
      
      case 'telegram':
        return {
          supportsFiles: true,
          supportsImages: true,
          supportsAudio: true,
          supportsVideo: true,
          supportsLocation: true,
          supportsStickers: true,
          supportsRichMessages: true,
          maxFileSize: 50 * 1024 * 1024, // 50MB
        };
      
      case 'zalo':
        return {
          supportsFiles: true,
          supportsImages: true,
          supportsAudio: true,
          supportsVideo: false,
          supportsLocation: false,
          supportsStickers: true,
          supportsRichMessages: true,
          maxFileSize: 10 * 1024 * 1024, // 10MB
        };
      
      default:
        return {};
    }
  }
}
