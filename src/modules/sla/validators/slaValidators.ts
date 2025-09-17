import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { ValidationError } from '@/shared/utils/AppError';

const createSLASchema = Joi.object({
  name: Joi.string().min(1).max(100).required().messages({
    'string.min': 'SLA name is required',
    'string.max': 'SLA name must not exceed 100 characters',
    'any.required': 'SLA name is required',
  }),
  description: Joi.string().max(500).optional().allow(null, '').messages({
    'string.max': 'Description must not exceed 500 characters',
  }),
  firstResponseTimeHours: Joi.number().positive().required().messages({
    'number.positive': 'First response time must be a positive number',
    'any.required': 'First response time is required',
  }),
  resolutionTimeHours: Joi.number().positive().required().messages({
    'number.positive': 'Resolution time must be a positive number',
    'any.required': 'Resolution time is required',
  }),
  businessHoursOnly: Joi.boolean().optional().default(false),
  isActive: Joi.boolean().optional().default(true),
  companyId: Joi.string().optional().allow(null),
});

const updateSLASchema = Joi.object({
  name: Joi.string().min(1).max(100).optional().messages({
    'string.min': 'SLA name cannot be empty',
    'string.max': 'SLA name must not exceed 100 characters',
  }),
  description: Joi.string().max(500).optional().allow(null, '').messages({
    'string.max': 'Description must not exceed 500 characters',
  }),
  firstResponseTimeHours: Joi.number().positive().optional().messages({
    'number.positive': 'First response time must be a positive number',
  }),
  resolutionTimeHours: Joi.number().positive().optional().messages({
    'number.positive': 'Resolution time must be a positive number',
  }),
  businessHoursOnly: Joi.boolean().optional(),
  isActive: Joi.boolean().optional(),
});

const querySchema = Joi.object({
  page: Joi.number().integer().min(1).optional().default(1),
  limit: Joi.number().integer().min(1).max(100).optional().default(10),
  sortBy: Joi.string().valid('createdAt', 'updatedAt', 'name', 'firstResponseTimeHours', 'resolutionTimeHours').optional().default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').optional().default('desc'),
  search: Joi.string().optional(),
});

export const validateCreateSLA = (req: Request, res: Response, next: NextFunction) => {
  const { error } = createSLASchema.validate(req.body);
  
  if (error) {
    const errorMessage = error.details.map(detail => detail.message).join(', ');
    return next(new ValidationError(errorMessage));
  }
  
  next();
};

export const validateUpdateSLA = (req: Request, res: Response, next: NextFunction) => {
  const { error } = updateSLASchema.validate(req.body);
  
  if (error) {
    const errorMessage = error.details.map(detail => detail.message).join(', ');
    return next(new ValidationError(errorMessage));
  }
  
  next();
};

export const validateSLAQuery = (req: Request, res: Response, next: NextFunction) => {
  const { error, value } = querySchema.validate(req.query);
  
  if (error) {
    const errorMessage = error.details.map(detail => detail.message).join(', ');
    return next(new ValidationError(errorMessage));
  }
  
  req.query = value;
  next();
};
