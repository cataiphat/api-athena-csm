import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { ValidationError } from '@/shared/utils/AppError';

const createDepartmentSchema = Joi.object({
  name: Joi.string().min(1).max(100).required().messages({
    'string.min': 'Department name is required',
    'string.max': 'Department name must not exceed 100 characters',
    'any.required': 'Department name is required',
  }),
  description: Joi.string().max(500).optional().allow(null, '').messages({
    'string.max': 'Description must not exceed 500 characters',
  }),
  companyId: Joi.string().required().messages({
    'any.required': 'Company ID is required',
  }),
  leaderId: Joi.string().optional().allow(null),
});

const updateDepartmentSchema = Joi.object({
  name: Joi.string().min(1).max(100).optional().messages({
    'string.min': 'Department name cannot be empty',
    'string.max': 'Department name must not exceed 100 characters',
  }),
  description: Joi.string().max(500).optional().allow(null, '').messages({
    'string.max': 'Description must not exceed 500 characters',
  }),
  leaderId: Joi.string().optional().allow(null),
});

const querySchema = Joi.object({
  page: Joi.number().integer().min(1).optional().default(1),
  limit: Joi.number().integer().min(1).max(100).optional().default(10),
  sortBy: Joi.string().valid('createdAt', 'updatedAt', 'name').optional().default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').optional().default('desc'),
  search: Joi.string().optional(),
});

export const validateCreateDepartment = (req: Request, res: Response, next: NextFunction) => {
  const { error } = createDepartmentSchema.validate(req.body);
  
  if (error) {
    const errorMessage = error.details.map(detail => detail.message).join(', ');
    return next(new ValidationError(errorMessage));
  }
  
  next();
};

export const validateUpdateDepartment = (req: Request, res: Response, next: NextFunction) => {
  const { error } = updateDepartmentSchema.validate(req.body);
  
  if (error) {
    const errorMessage = error.details.map(detail => detail.message).join(', ');
    return next(new ValidationError(errorMessage));
  }
  
  next();
};

export const validateDepartmentQuery = (req: Request, res: Response, next: NextFunction) => {
  const { error, value } = querySchema.validate(req.query);
  
  if (error) {
    const errorMessage = error.details.map(detail => detail.message).join(', ');
    return next(new ValidationError(errorMessage));
  }
  
  req.query = value;
  next();
};
