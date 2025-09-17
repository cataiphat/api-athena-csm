import Joi from 'joi';

export const providerValidators = {
  sendEmail: {
    body: Joi.object({
      to: Joi.alternatives().try(
        Joi.string().email().required(),
        Joi.array().items(Joi.string().email()).min(1).required()
      ).required(),
      cc: Joi.alternatives().try(
        Joi.string().email(),
        Joi.array().items(Joi.string().email())
      ).optional(),
      bcc: Joi.alternatives().try(
        Joi.string().email(),
        Joi.array().items(Joi.string().email())
      ).optional(),
      subject: Joi.string().min(1).max(255).required(),
      body: Joi.string().min(1).required(),
      isHtml: Joi.boolean().default(false),
      attachments: Joi.array().items(
        Joi.object({
          filename: Joi.string().required(),
          content: Joi.string().required(), // Base64 encoded
          contentType: Joi.string().required(),
          size: Joi.number().positive().optional(),
        })
      ).optional(),
    }),
    params: Joi.object({
      channelId: Joi.string().required(),
    }),
  },

  sendMessage: {
    body: Joi.object({
      recipientId: Joi.string().required(),
      content: Joi.string().min(1).required(),
      messageType: Joi.string().valid(
        'text', 'image', 'file', 'audio', 'video', 'location', 'sticker'
      ).default('text'),
      attachments: Joi.array().items(
        Joi.object({
          type: Joi.string().valid('image', 'file', 'audio', 'video').required(),
          url: Joi.string().uri().required(),
          filename: Joi.string().optional(),
          size: Joi.number().positive().optional(),
          mimeType: Joi.string().optional(),
          thumbnail: Joi.string().uri().optional(),
        })
      ).optional(),
      metadata: Joi.object().optional(),
    }),
    params: Joi.object({
      channelId: Joi.string().required(),
    }),
  },

  channelConfig: {
    email: {
      gmail: Joi.object({
        provider: Joi.string().valid('gmail').required(),
        email: Joi.string().email().required(),
        clientId: Joi.string().required(),
        clientSecret: Joi.string().required(),
        redirectUri: Joi.string().uri().required(),
        refreshToken: Joi.string().required(),
        accessToken: Joi.string().optional(),
        displayName: Joi.string().optional(),
      }),
      
      outlook: Joi.object({
        provider: Joi.string().valid('outlook').required(),
        email: Joi.string().email().required(),
        clientId: Joi.string().required(),
        clientSecret: Joi.string().required(),
        tenantId: Joi.string().required(),
        redirectUri: Joi.string().uri().required(),
        accessToken: Joi.string().required(),
        displayName: Joi.string().optional(),
      }),
    },

    messaging: {
      facebook: Joi.object({
        provider: Joi.string().valid('facebook').required(),
        appId: Joi.string().required(),
        appSecret: Joi.string().required(),
        accessToken: Joi.string().required(),
        verifyToken: Joi.string().required(),
        webhookUrl: Joi.string().uri().required(),
      }),

      facebook_fanpage: Joi.object({
        provider: Joi.string().valid('facebook_fanpage').required(),
        appId: Joi.string().required(),
        appSecret: Joi.string().required(),
        accessToken: Joi.string().required(),
        pageId: Joi.string().required(),
        verifyToken: Joi.string().required(),
        webhookUrl: Joi.string().uri().required(),
      }),

      telegram: Joi.object({
        provider: Joi.string().valid('telegram').required(),
        botToken: Joi.string().required(),
        webhookUrl: Joi.string().uri().required(),
        webhookSecret: Joi.string().optional(),
      }),

      zalo: Joi.object({
        provider: Joi.string().valid('zalo').required(),
        appId: Joi.string().required(),
        appSecret: Joi.string().required(),
        accessToken: Joi.string().required(),
        webhookUrl: Joi.string().uri().required(),
      }),
    },
  },

  validateChannelConfig: (channelType: string, provider: string) => {
    if (channelType === 'EMAIL') {
      switch (provider) {
        case 'gmail':
          return providerValidators.channelConfig.email.gmail;
        case 'outlook':
          return providerValidators.channelConfig.email.outlook;
        default:
          throw new Error(`Unsupported email provider: ${provider}`);
      }
    } else {
      switch (provider) {
        case 'facebook':
          return providerValidators.channelConfig.messaging.facebook;
        case 'facebook_fanpage':
          return providerValidators.channelConfig.messaging.facebook_fanpage;
        case 'telegram':
          return providerValidators.channelConfig.messaging.telegram;
        case 'zalo':
          return providerValidators.channelConfig.messaging.zalo;
        default:
          throw new Error(`Unsupported messaging provider: ${provider}`);
      }
    }
  },
};
