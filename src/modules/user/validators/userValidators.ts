import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { UserRole, UserStatus } from '@prisma/client';
import { ValidationError } from '@/shared/utils/AppError';

const createUserSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters long',
    'any.required': 'Password is required',
  }),
  firstName: Joi.string().min(1).max(50).required().messages({
    'string.min': 'First name is required',
    'string.max': 'First name must not exceed 50 characters',
    'any.required': 'First name is required',
  }),
  lastName: Joi.string().min(1).max(50).required().messages({
    'string.min': 'Last name is required',
    'string.max': 'Last name must not exceed 50 characters',
    'any.required': 'Last name is required',
  }),
  phone: Joi.string().pattern(/^[0-9+\-\s()]+$/).optional().messages({
    'string.pattern.base': 'Please provide a valid phone number',
  }),
  role: Joi.string().valid(...Object.values(UserRole)).required().messages({
    'any.only': 'Role must be one of: SUPER_ADMIN, CS_ADMIN, CS_AGENT, CS_OPERATION',
    'any.required': 'Role is required',
  }),
  companyId: Joi.string().required().messages({
    'any.required': 'Company ID is required',
  }),
  departmentId: Joi.string().optional().allow(null),
  settings: Joi.object().optional(),
});

const updateUserSchema = Joi.object({
  firstName: Joi.string().min(1).max(50).optional().messages({
    'string.min': 'First name cannot be empty',
    'string.max': 'First name must not exceed 50 characters',
  }),
  lastName: Joi.string().min(1).max(50).optional().messages({
    'string.min': 'Last name cannot be empty',
    'string.max': 'Last name must not exceed 50 characters',
  }),
  phone: Joi.string().pattern(/^[0-9+\-\s()]+$/).optional().allow(null, '').messages({
    'string.pattern.base': 'Please provide a valid phone number',
  }),
  avatar: Joi.string().uri().optional().allow(null, '').messages({
    'string.uri': 'Avatar must be a valid URL',
  }),
  role: Joi.string().valid(...Object.values(UserRole)).optional().messages({
    'any.only': 'Role must be one of: SUPER_ADMIN, CS_ADMIN, CS_AGENT, CS_OPERATION',
  }),
  status: Joi.string().valid(...Object.values(UserStatus)).optional().messages({
    'any.only': 'Status must be one of: ACTIVE, INACTIVE, SUSPENDED',
  }),
  departmentId: Joi.string().optional().allow(null),
  settings: Joi.object().optional(),
  password: Joi.string().min(6).optional().messages({
    'string.min': 'Password must be at least 6 characters long',
  }),
});

const querySchema = Joi.object({
  page: Joi.number().integer().min(1).optional().default(1),
  limit: Joi.number().integer().min(1).max(100).optional().default(10),
  sortBy: Joi.string().valid('createdAt', 'updatedAt', 'firstName', 'lastName', 'email').optional().default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').optional().default('desc'),
  search: Joi.string().optional(),
  status: Joi.string().valid(...Object.values(UserStatus)).optional(),
  role: Joi.string().valid(...Object.values(UserRole)).optional(),
  departmentId: Joi.string().optional(),
});

export const validateCreateUser = (req: Request, res: Response, next: NextFunction) => {
  const { error } = createUserSchema.validate(req.body);
  
  if (error) {
    const errorMessage = error.details.map(detail => detail.message).join(', ');
    return next(new ValidationError(errorMessage));
  }
  
  next();
};

export const validateUpdateUser = (req: Request, res: Response, next: NextFunction) => {
  const { error } = updateUserSchema.validate(req.body);
  
  if (error) {
    const errorMessage = error.details.map(detail => detail.message).join(', ');
    return next(new ValidationError(errorMessage));
  }
  
  next();
};

export const validateUserQuery = (req: Request, res: Response, next: NextFunction) => {
  const { error, value } = querySchema.validate(req.query);
  
  if (error) {
    const errorMessage = error.details.map(detail => detail.message).join(', ');
    return next(new ValidationError(errorMessage));
  }
  
  // Replace query with validated values
  req.query = value;
  next();
};
