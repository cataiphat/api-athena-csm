import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { ValidationError } from '@/shared/utils/AppError';

const createNotificationSchema = Joi.object({
  title: Joi.string().min(1).max(200).required().messages({
    'string.min': 'Title is required',
    'string.max': 'Title must not exceed 200 characters',
    'any.required': 'Title is required',
  }),
  message: Joi.string().min(1).max(1000).required().messages({
    'string.min': 'Message is required',
    'string.max': 'Message must not exceed 1000 characters',
    'any.required': 'Message is required',
  }),
  type: Joi.string().valid('INFO', 'WARNING', 'ERROR', 'SUCCESS', 'SLA_VIOLATION', 'TICKET_ASSIGNED', 'TICKET_UPDATED').required().messages({
    'any.only': 'Type must be one of: INFO, WARNING, ERROR, SUCCESS, SLA_VIOLATION, TICKET_ASSIGNED, TICKET_UPDATED',
    'any.required': 'Type is required',
  }),
  userId: Joi.string().optional(),
  userIds: Joi.array().items(Joi.string()).optional(),
  metadata: Joi.object().optional(),
}).xor('userId', 'userIds').messages({
  'object.xor': 'Either userId or userIds must be provided, but not both',
});

const querySchema = Joi.object({
  page: Joi.number().integer().min(1).optional().default(1),
  limit: Joi.number().integer().min(1).max(100).optional().default(10),
  sortBy: Joi.string().valid('createdAt', 'updatedAt', 'title', 'type').optional().default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').optional().default('desc'),
  type: Joi.string().valid('INFO', 'WARNING', 'ERROR', 'SUCCESS', 'SLA_VIOLATION', 'TICKET_ASSIGNED', 'TICKET_UPDATED').optional(),
  status: Joi.string().valid('read', 'unread').optional(),
});

export const validateCreateNotification = (req: Request, res: Response, next: NextFunction) => {
  const { error } = createNotificationSchema.validate(req.body);
  
  if (error) {
    const errorMessage = error.details.map(detail => detail.message).join(', ');
    return next(new ValidationError(errorMessage));
  }
  
  next();
};

export const validateNotificationQuery = (req: Request, res: Response, next: NextFunction) => {
  const { error, value } = querySchema.validate(req.query);
  
  if (error) {
    const errorMessage = error.details.map(detail => detail.message).join(', ');
    return next(new ValidationError(errorMessage));
  }
  
  req.query = value;
  next();
};
