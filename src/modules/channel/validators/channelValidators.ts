import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { ValidationError } from '@/shared/utils/AppError';

const emailConfigSchema = Joi.object({
  host: Joi.string().required(),
  port: Joi.number().integer().min(1).max(65535).required(),
  username: Joi.string().required(),
  password: Joi.string().required(),
  secure: Joi.boolean().optional(),
  tls: Joi.boolean().optional(),
});

const facebookConfigSchema = Joi.object({
  pageAccessToken: Joi.string().required(),
  verifyToken: Joi.string().required(),
  webhookUrl: Joi.string().uri().optional(),
});

const zaloConfigSchema = Joi.object({
  appId: Joi.string().required(),
  appSecret: Joi.string().required(),
  webhookUrl: Joi.string().uri().optional(),
});

const telegramConfigSchema = Joi.object({
  botToken: Joi.string().required(),
  webhookUrl: Joi.string().uri().optional(),
});

const createChannelSchema = Joi.object({
  name: Joi.string().min(1).max(100).required().messages({
    'string.min': 'Channel name is required',
    'string.max': 'Channel name must not exceed 100 characters',
    'any.required': 'Channel name is required',
  }),
  description: Joi.string().max(500).optional().allow(null, '').messages({
    'string.max': 'Description must not exceed 500 characters',
  }),
  type: Joi.string().valid('EMAIL', 'FACEBOOK', 'ZALO', 'TELEGRAM', 'PHONE', 'CHAT').required().messages({
    'any.only': 'Type must be one of: EMAIL, FACEBOOK, ZALO, TELEGRAM, PHONE, CHAT',
    'any.required': 'Channel type is required',
  }),
  isActive: Joi.boolean().optional().default(true),
  config: Joi.when('type', {
    switch: [
      { is: 'EMAIL', then: emailConfigSchema },
      { is: 'FACEBOOK', then: facebookConfigSchema },
      { is: 'ZALO', then: zaloConfigSchema },
      { is: 'TELEGRAM', then: telegramConfigSchema },
    ],
    otherwise: Joi.object().optional(),
  }),
  companyId: Joi.string().optional().allow(null),
});

const updateChannelSchema = Joi.object({
  name: Joi.string().min(1).max(100).optional().messages({
    'string.min': 'Channel name cannot be empty',
    'string.max': 'Channel name must not exceed 100 characters',
  }),
  description: Joi.string().max(500).optional().allow(null, '').messages({
    'string.max': 'Description must not exceed 500 characters',
  }),
  isActive: Joi.boolean().optional(),
  config: Joi.object().optional(),
});

const querySchema = Joi.object({
  page: Joi.number().integer().min(1).optional().default(1),
  limit: Joi.number().integer().min(1).max(100).optional().default(10),
  sortBy: Joi.string().valid('createdAt', 'updatedAt', 'name', 'type').optional().default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').optional().default('desc'),
  search: Joi.string().optional(),
  type: Joi.string().valid('EMAIL', 'FACEBOOK', 'ZALO', 'TELEGRAM', 'PHONE', 'CHAT').optional(),
});

export const validateCreateChannel = (req: Request, res: Response, next: NextFunction) => {
  const { error } = createChannelSchema.validate(req.body);
  
  if (error) {
    const errorMessage = error.details.map(detail => detail.message).join(', ');
    return next(new ValidationError(errorMessage));
  }
  
  next();
};

export const validateUpdateChannel = (req: Request, res: Response, next: NextFunction) => {
  const { error } = updateChannelSchema.validate(req.body);
  
  if (error) {
    const errorMessage = error.details.map(detail => detail.message).join(', ');
    return next(new ValidationError(errorMessage));
  }
  
  next();
};

export const validateChannelQuery = (req: Request, res: Response, next: NextFunction) => {
  const { error, value } = querySchema.validate(req.query);
  
  if (error) {
    const errorMessage = error.details.map(detail => detail.message).join(', ');
    return next(new ValidationError(errorMessage));
  }
  
  req.query = value;
  next();
};
