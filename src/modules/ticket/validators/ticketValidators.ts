import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { ValidationError } from '@/shared/utils/AppError';

const createTicketSchema = Joi.object({
  title: Joi.string().min(1).max(200).required().messages({
    'string.min': 'Title is required',
    'string.max': 'Title must not exceed 200 characters',
    'any.required': 'Title is required',
  }),
  description: Joi.string().min(1).max(5000).required().messages({
    'string.min': 'Description is required',
    'string.max': 'Description must not exceed 5000 characters',
    'any.required': 'Description is required',
  }),
  type: Joi.string().valid('QUESTION', 'COMPLAINT', 'REQUEST', 'INCIDENT', 'TASK').required().messages({
    'any.only': 'Type must be one of: QUESTION, COMPLAINT, REQUEST, INCIDENT, TASK',
    'any.required': 'Type is required',
  }),
  priority: Joi.string().valid('LOW', 'MEDIUM', 'HIGH', 'URGENT').optional().default('MEDIUM').messages({
    'any.only': 'Priority must be one of: LOW, MEDIUM, HIGH, URGENT',
  }),
  customerId: Joi.string().required().messages({
    'any.required': 'Customer ID is required',
  }),
  departmentId: Joi.string().required().messages({
    'any.required': 'Department ID is required',
  }),
  channelId: Joi.string().optional().allow(null),
  slaId: Joi.string().optional().allow(null),
  tags: Joi.array().items(Joi.string()).optional(),
  metadata: Joi.object().optional(),
});

const updateTicketSchema = Joi.object({
  title: Joi.string().min(1).max(200).optional().messages({
    'string.min': 'Title cannot be empty',
    'string.max': 'Title must not exceed 200 characters',
  }),
  description: Joi.string().min(1).max(5000).optional().messages({
    'string.min': 'Description cannot be empty',
    'string.max': 'Description must not exceed 5000 characters',
  }),
  type: Joi.string().valid('QUESTION', 'COMPLAINT', 'REQUEST', 'INCIDENT', 'TASK').optional().messages({
    'any.only': 'Type must be one of: QUESTION, COMPLAINT, REQUEST, INCIDENT, TASK',
  }),
  priority: Joi.string().valid('LOW', 'MEDIUM', 'HIGH', 'URGENT').optional().messages({
    'any.only': 'Priority must be one of: LOW, MEDIUM, HIGH, URGENT',
  }),
  status: Joi.string().valid('WAIT', 'PROCESS', 'DONE', 'CLOSED', 'CANCELLED').optional().messages({
    'any.only': 'Status must be one of: WAIT, PROCESS, DONE, CLOSED, CANCELLED',
  }),
  assigneeId: Joi.string().optional().allow(null),
  departmentId: Joi.string().optional(),
  slaId: Joi.string().optional().allow(null),
  tags: Joi.array().items(Joi.string()).optional(),
  metadata: Joi.object().optional(),
});

const addCommentSchema = Joi.object({
  content: Joi.string().min(1).max(2000).required().messages({
    'string.min': 'Comment content is required',
    'string.max': 'Comment content must not exceed 2000 characters',
    'any.required': 'Comment content is required',
  }),
  isInternal: Joi.boolean().optional().default(false),
});

const querySchema = Joi.object({
  page: Joi.number().integer().min(1).optional().default(1),
  limit: Joi.number().integer().min(1).max(100).optional().default(10),
  sortBy: Joi.string().valid('createdAt', 'updatedAt', 'title', 'priority', 'status').optional().default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').optional().default('desc'),
  search: Joi.string().optional(),
  status: Joi.string().valid('WAIT', 'PROCESS', 'DONE', 'CLOSED', 'CANCELLED').optional(),
  type: Joi.string().valid('QUESTION', 'COMPLAINT', 'REQUEST', 'INCIDENT', 'TASK').optional(),
  priority: Joi.string().valid('LOW', 'MEDIUM', 'HIGH', 'URGENT').optional(),
  assigneeId: Joi.string().optional(),
  departmentId: Joi.string().optional(),
  createdFrom: Joi.date().iso().optional(),
  createdTo: Joi.date().iso().optional(),
});

export const validateCreateTicket = (req: Request, res: Response, next: NextFunction) => {
  const { error } = createTicketSchema.validate(req.body);
  
  if (error) {
    const errorMessage = error.details.map(detail => detail.message).join(', ');
    return next(new ValidationError(errorMessage));
  }
  
  next();
};

export const validateUpdateTicket = (req: Request, res: Response, next: NextFunction) => {
  const { error } = updateTicketSchema.validate(req.body);
  
  if (error) {
    const errorMessage = error.details.map(detail => detail.message).join(', ');
    return next(new ValidationError(errorMessage));
  }
  
  next();
};

export const validateAddComment = (req: Request, res: Response, next: NextFunction) => {
  const { error } = addCommentSchema.validate(req.body);
  
  if (error) {
    const errorMessage = error.details.map(detail => detail.message).join(', ');
    return next(new ValidationError(errorMessage));
  }
  
  next();
};

export const validateTicketQuery = (req: Request, res: Response, next: NextFunction) => {
  const { error, value } = querySchema.validate(req.query);
  
  if (error) {
    const errorMessage = error.details.map(detail => detail.message).join(', ');
    return next(new ValidationError(errorMessage));
  }
  
  req.query = value;
  next();
};
