import Joi from 'joi';
import { PermissionType, ResourceType } from '@prisma/client';

export const createPermissionSchema = Joi.object({
  name: Joi.string().min(3).max(100).required().messages({
    'string.min': 'Permission name must be at least 3 characters long',
    'string.max': 'Permission name cannot exceed 100 characters',
    'any.required': 'Permission name is required'
  }),
  description: Joi.string().max(500).optional().messages({
    'string.max': 'Description cannot exceed 500 characters'
  }),
  resource: Joi.string().valid(...Object.values(ResourceType)).required().messages({
    'any.only': 'Resource must be a valid resource type',
    'any.required': 'Resource is required'
  }),
  action: Joi.string().valid(...Object.values(PermissionType)).required().messages({
    'any.only': 'Action must be a valid permission type',
    'any.required': 'Action is required'
  }),
  conditions: Joi.object().optional()
});

export const updatePermissionSchema = Joi.object({
  name: Joi.string().min(3).max(100).optional().messages({
    'string.min': 'Permission name must be at least 3 characters long',
    'string.max': 'Permission name cannot exceed 100 characters'
  }),
  description: Joi.string().max(500).optional().allow('').messages({
    'string.max': 'Description cannot exceed 500 characters'
  }),
  conditions: Joi.object().optional(),
  isActive: Joi.boolean().optional()
});

export const createRoleSchema = Joi.object({
  name: Joi.string().min(3).max(100).required().messages({
    'string.min': 'Role name must be at least 3 characters long',
    'string.max': 'Role name cannot exceed 100 characters',
    'any.required': 'Role name is required'
  }),
  description: Joi.string().max(500).optional().messages({
    'string.max': 'Description cannot exceed 500 characters'
  }),
  permissionIds: Joi.array().items(Joi.string()).min(1).required().messages({
    'array.min': 'At least one permission is required',
    'any.required': 'Permission IDs are required'
  })
});

export const updateRoleSchema = Joi.object({
  name: Joi.string().min(3).max(100).optional().messages({
    'string.min': 'Role name must be at least 3 characters long',
    'string.max': 'Role name cannot exceed 100 characters'
  }),
  description: Joi.string().max(500).optional().allow('').messages({
    'string.max': 'Description cannot exceed 500 characters'
  }),
  isActive: Joi.boolean().optional()
});

export const assignRoleSchema = Joi.object({
  userIds: Joi.array().items(Joi.string()).min(1).required().messages({
    'array.min': 'At least one user ID is required',
    'any.required': 'User IDs are required'
  }),
  roleId: Joi.string().required().messages({
    'any.required': 'Role ID is required'
  })
});

export const assignPermissionSchema = Joi.object({
  userIds: Joi.array().items(Joi.string()).min(1).required().messages({
    'array.min': 'At least one user ID is required',
    'any.required': 'User IDs are required'
  }),
  permissionId: Joi.string().required().messages({
    'any.required': 'Permission ID is required'
  }),
  granted: Joi.boolean().required().messages({
    'any.required': 'Granted status is required'
  }),
  conditions: Joi.object().optional()
});

export const permissionQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).optional().default(1),
  limit: Joi.number().integer().min(1).max(100).optional().default(10),
  search: Joi.string().optional().allow(''),
  resource: Joi.string().valid(...Object.values(ResourceType)).optional(),
  action: Joi.string().valid(...Object.values(PermissionType)).optional(),
  isActive: Joi.boolean().optional(),
  sortBy: Joi.string().valid('name', 'resource', 'action', 'createdAt', 'updatedAt').optional().default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').optional().default('desc')
});

export const roleQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).optional().default(1),
  limit: Joi.number().integer().min(1).max(100).optional().default(10),
  search: Joi.string().optional().allow(''),
  isActive: Joi.boolean().optional(),
  sortBy: Joi.string().valid('name', 'createdAt', 'updatedAt').optional().default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').optional().default('desc')
});
