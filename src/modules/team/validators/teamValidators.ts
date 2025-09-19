import Joi from 'joi';

export const createTeamSchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    'string.min': 'Team name must be at least 2 characters long',
    'string.max': 'Team name cannot exceed 100 characters',
    'any.required': 'Team name is required'
  }),
  description: Joi.string().max(500).optional().allow(''),
  departmentId: Joi.string().required().messages({
    'any.required': 'Department ID is required'
  }),
  leaderId: Joi.string().optional().allow(''),
  memberIds: Joi.array().items(Joi.string()).optional(),
  workingHours: Joi.array().items(
    Joi.object({
      dayOfWeek: Joi.number().integer().min(0).max(6).required().messages({
        'number.min': 'Day of week must be between 0 (Sunday) and 6 (Saturday)',
        'number.max': 'Day of week must be between 0 (Sunday) and 6 (Saturday)',
        'any.required': 'Day of week is required'
      }),
      startTime: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).required().messages({
        'string.pattern.base': 'Start time must be in HH:mm format',
        'any.required': 'Start time is required'
      }),
      endTime: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).required().messages({
        'string.pattern.base': 'End time must be in HH:mm format',
        'any.required': 'End time is required'
      }),
      isActive: Joi.boolean().optional().default(true)
    })
  ).optional()
});

export const updateTeamSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional().messages({
    'string.min': 'Team name must be at least 2 characters long',
    'string.max': 'Team name cannot exceed 100 characters'
  }),
  description: Joi.string().max(500).optional().allow(''),
  leaderId: Joi.string().optional().allow(''),
  memberIds: Joi.array().items(Joi.string()).optional(),
  workingHours: Joi.array().items(
    Joi.object({
      dayOfWeek: Joi.number().integer().min(0).max(6).required(),
      startTime: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
      endTime: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
      isActive: Joi.boolean().optional().default(true)
    })
  ).optional()
});

export const teamQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).optional().default(1),
  limit: Joi.number().integer().min(1).max(100).optional().default(10),
  search: Joi.string().optional().allow(''),
  departmentId: Joi.string().optional(),
  leaderId: Joi.string().optional(),
  hasWorkingHours: Joi.boolean().optional(),
  sortBy: Joi.string().valid('name', 'createdAt', 'updatedAt', 'memberCount').optional().default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').optional().default('desc')
});

export const workingHoursSchema = Joi.object({
  workingHours: Joi.array().items(
    Joi.object({
      dayOfWeek: Joi.number().integer().min(0).max(6).required(),
      startTime: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
      endTime: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
      isActive: Joi.boolean().optional().default(true)
    })
  ).required().min(1).messages({
    'array.min': 'At least one working hour entry is required'
  })
});

export const addMembersSchema = Joi.object({
  memberIds: Joi.array().items(Joi.string()).required().min(1).messages({
    'array.min': 'At least one member ID is required'
  })
});

export const removeMembersSchema = Joi.object({
  memberIds: Joi.array().items(Joi.string()).required().min(1).messages({
    'array.min': 'At least one member ID is required'
  })
});
