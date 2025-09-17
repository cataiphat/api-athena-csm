import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { ValidationError } from '@/shared/utils/AppError';

const createCompanySchema = Joi.object({
  name: Joi.string().min(1).max(100).required().messages({
    'string.min': 'Company name is required',
    'string.max': 'Company name must not exceed 100 characters',
    'any.required': 'Company name is required',
  }),
  description: Joi.string().max(500).optional().allow(null, '').messages({
    'string.max': 'Description must not exceed 500 characters',
  }),
  settings: Joi.object({
    timezone: Joi.string().optional(),
    businessHours: Joi.object({
      start: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
      end: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
      days: Joi.array().items(Joi.number().integer().min(0).max(6)).optional(),
    }).optional(),
  }).optional(),
});

const updateCompanySchema = Joi.object({
  name: Joi.string().min(1).max(100).optional().messages({
    'string.min': 'Company name cannot be empty',
    'string.max': 'Company name must not exceed 100 characters',
  }),
  description: Joi.string().max(500).optional().allow(null, '').messages({
    'string.max': 'Description must not exceed 500 characters',
  }),
  settings: Joi.object({
    timezone: Joi.string().optional(),
    businessHours: Joi.object({
      start: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
      end: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
      days: Joi.array().items(Joi.number().integer().min(0).max(6)).optional(),
    }).optional(),
  }).optional(),
});

const querySchema = Joi.object({
  page: Joi.number().integer().min(1).optional().default(1),
  limit: Joi.number().integer().min(1).max(100).optional().default(10),
  sortBy: Joi.string().valid('createdAt', 'updatedAt', 'name').optional().default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').optional().default('desc'),
  search: Joi.string().optional(),
});

export const validateCreateCompany = (req: Request, res: Response, next: NextFunction) => {
  const { error } = createCompanySchema.validate(req.body);
  
  if (error) {
    const errorMessage = error.details.map(detail => detail.message).join(', ');
    return next(new ValidationError(errorMessage));
  }
  
  next();
};

export const validateUpdateCompany = (req: Request, res: Response, next: NextFunction) => {
  const { error } = updateCompanySchema.validate(req.body);
  
  if (error) {
    const errorMessage = error.details.map(detail => detail.message).join(', ');
    return next(new ValidationError(errorMessage));
  }
  
  next();
};

export const validateCompanyQuery = (req: Request, res: Response, next: NextFunction) => {
  const { error, value } = querySchema.validate(req.query);
  
  if (error) {
    const errorMessage = error.details.map(detail => detail.message).join(', ');
    return next(new ValidationError(errorMessage));
  }
  
  req.query = value;
  next();
};
