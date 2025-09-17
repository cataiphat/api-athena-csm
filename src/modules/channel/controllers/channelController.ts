import { Response, NextFunction } from 'express';
import { PrismaClient, UserRole, ChannelType } from '@prisma/client';
import { AuthenticatedRequest, PaginationQuery, FilterQuery } from '@/shared/types';
import { NotFoundError, ValidationError, ForbiddenError } from '@/shared/utils/AppError';
import { logger } from '@/shared/utils/logger';
import { providerValidators } from '@/modules/provider/validators/providerValidators';
import { ProviderFactory } from '@/shared/providers/ProviderFactory';

const prisma = new PrismaClient();

export class ChannelController {
  static async getChannels(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ForbiddenError('Authentication required');
      }

      const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query as PaginationQuery;
      const { search, type } = req.query as FilterQuery;

      const skip = (page - 1) * limit;
      
      let whereClause: any = {};

      // Role-based access control
      if (req.user.role === UserRole.SUPER_ADMIN) {
        // Super admin can see all channels
      } else {
        // Other roles can only see channels in their company
        whereClause.companyId = req.user.companyId;
      }

      // Apply filters
      if (search) {
        whereClause.OR = [
          { name: { contains: search, mode: 'insensitive' } },
        ];
      }

      if (type) {
        whereClause.type = type;
      }

      const [channels, total] = await Promise.all([
        prisma.channel.findMany({
          where: whereClause,
          skip,
          take: limit,
          orderBy: { [sortBy]: sortOrder },
          include: {
            company: {
              select: { id: true, name: true },
            },
            _count: {
              select: { tickets: true, messages: true },
            },
          },
        }),
        prisma.channel.count({ where: whereClause }),
      ]);

      const totalPages = Math.ceil(total / limit);

      res.status(200).json({
        success: true,
        message: 'Channels retrieved successfully',
        data: channels,
        meta: {
          page,
          limit,
          total,
          totalPages,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async getChannelById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ForbiddenError('Authentication required');
      }

      const { id } = req.params;

      const channel = await prisma.channel.findUnique({
        where: { id },
        include: {
          company: {
            select: { id: true, name: true },
          },
          tickets: {
            select: { 
              id: true, 
              ticketNumber: true, 
              title: true, 
              status: true, 
              priority: true,
              createdAt: true,
            },
            take: 10,
            orderBy: { createdAt: 'desc' },
          },
          messages: {
            select: {
              id: true,
              content: true,
              direction: true,
              createdAt: true,
            },
            take: 10,
            orderBy: { createdAt: 'desc' },
          },
          _count: {
            select: { tickets: true, messages: true },
          },
        },
      });

      if (!channel) {
        throw new NotFoundError('Channel not found');
      }

      // Check access permissions
      if (req.user.role !== UserRole.SUPER_ADMIN && channel.companyId !== req.user.companyId) {
        throw new ForbiddenError('Access denied to this channel');
      }

      res.status(200).json({
        success: true,
        message: 'Channel retrieved successfully',
        data: channel,
      });
    } catch (error) {
      next(error);
    }
  }

  static async createChannel(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ForbiddenError('Authentication required');
      }

      // Only Super Admin and CS Admin can create channels
      if (req.user.role !== UserRole.SUPER_ADMIN && req.user.role !== UserRole.CS_ADMIN) {
        throw new ForbiddenError('Insufficient permissions');
      }

      const {
        name,
        type,
        config,
        companyId,
      } = req.body;

      // Validate company access
      let targetCompanyId = companyId;
      if (req.user.role === UserRole.CS_ADMIN) {
        targetCompanyId = req.user.companyId; // CS Admin can only create channels for their company
      }

      if (targetCompanyId) {
        const company = await prisma.company.findUnique({
          where: { id: targetCompanyId },
        });

        if (!company) {
          throw new ValidationError('Company not found');
        }
      }

      // Validate channel configuration based on type
      const validatedConfig = await validateChannelConfig(type, config);

      const newChannel = await prisma.channel.create({
        data: {
          name,
          type,
          config: validatedConfig,
          companyId: targetCompanyId,
        },
        include: {
          company: {
            select: { id: true, name: true },
          },
        },
      });

      logger.info('Channel created successfully', {
        channelId: newChannel.id,
        name: newChannel.name,
        type: newChannel.type,
        createdBy: req.user.id,
      });

      res.status(201).json({
        success: true,
        message: 'Channel created successfully',
        data: newChannel,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateChannel(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ForbiddenError('Authentication required');
      }

      // Only Super Admin and CS Admin can update channels
      if (req.user.role !== UserRole.SUPER_ADMIN && req.user.role !== UserRole.CS_ADMIN) {
        throw new ForbiddenError('Insufficient permissions');
      }

      const { id } = req.params;
      const {
        name,
        config,
      } = req.body;

      // Check if channel exists and access permissions
      const existingChannel = await prisma.channel.findUnique({
        where: { id },
      });

      if (!existingChannel) {
        throw new NotFoundError('Channel not found');
      }

      // CS Admin can only update channels in their company
      if (req.user.role === UserRole.CS_ADMIN && existingChannel.companyId !== req.user.companyId) {
        throw new ForbiddenError('Cannot update channel from different company');
      }

      const updateData: any = {};
      if (name !== undefined) updateData.name = name;
      
      if (config !== undefined) {
        // Validate channel configuration based on type
        const validatedConfig = await validateChannelConfig(existingChannel.type, config);
        updateData.config = validatedConfig;
      }

      const updatedChannel = await prisma.channel.update({
        where: { id },
        data: updateData,
        include: {
          company: {
            select: { id: true, name: true },
          },
        },
      });

      logger.info('Channel updated successfully', {
        channelId: updatedChannel.id,
        updatedBy: req.user.id,
      });

      res.status(200).json({
        success: true,
        message: 'Channel updated successfully',
        data: updatedChannel,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteChannel(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ForbiddenError('Authentication required');
      }

      // Only Super Admin and CS Admin can delete channels
      if (req.user.role !== UserRole.SUPER_ADMIN && req.user.role !== UserRole.CS_ADMIN) {
        throw new ForbiddenError('Insufficient permissions');
      }

      const { id } = req.params;

      const existingChannel = await prisma.channel.findUnique({
        where: { id },
        include: {
          _count: {
            select: { tickets: true, messages: true },
          },
        },
      });

      if (!existingChannel) {
        throw new NotFoundError('Channel not found');
      }

      // CS Admin can only delete channels in their company
      if (req.user.role === UserRole.CS_ADMIN && existingChannel.companyId !== req.user.companyId) {
        throw new ForbiddenError('Cannot delete channel from different company');
      }

      // Check if channel is being used
      if (existingChannel._count.tickets > 0 || existingChannel._count.messages > 0) {
        throw new ValidationError('Cannot delete channel that has tickets or messages');
      }

      await prisma.channel.delete({
        where: { id },
      });

      logger.info('Channel deleted successfully', {
        channelId: id,
        deletedBy: req.user.id,
      });

      res.status(200).json({
        success: true,
        message: 'Channel deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  static async testChannelConnection(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ForbiddenError('Authentication required');
      }

      const { id } = req.params;

      const channel = await prisma.channel.findUnique({
        where: { id },
      });

      if (!channel) {
        throw new NotFoundError('Channel not found');
      }

      // Check access permissions
      if (req.user.role !== UserRole.SUPER_ADMIN && channel.companyId !== req.user.companyId) {
        throw new ForbiddenError('Access denied to this channel');
      }

      // Test connection based on channel type
      const testResult = await testChannelConnectionByType(channel.type, channel.config);

      res.status(200).json({
        success: true,
        message: 'Channel connection test completed',
        data: testResult,
      });
    } catch (error) {
      next(error);
    }
  }
}

// Helper function to validate channel configuration
async function validateChannelConfig(type: ChannelType, config: any): Promise<any> {
  if (!config || typeof config !== 'object') {
    throw new ValidationError('Invalid channel configuration');
  }

  if (!config.provider) {
    throw new ValidationError('Provider is required in channel configuration');
  }

  try {
    // Use provider validators for validation
    const validator = providerValidators.validateChannelConfig(type, config.provider);
    const { error, value } = validator.validate(config);

    if (error) {
      throw new ValidationError(`Configuration validation failed: ${error.details?.[0]?.message || 'Unknown validation error'}`);
    }

    // Test provider connection if possible
    if (type === ChannelType.EMAIL) {
      const emailValidation = ProviderFactory.validateEmailConfig(value);
      if (!emailValidation.valid) {
        throw new ValidationError(`Email configuration invalid: ${emailValidation.errors.join(', ')}`);
      }
    } else {
      const messagingValidation = ProviderFactory.validateMessagingConfig(value);
      if (!messagingValidation.valid) {
        throw new ValidationError(`Messaging configuration invalid: ${messagingValidation.errors.join(', ')}`);
      }
    }

    return value;
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }
    throw new ValidationError(`Configuration validation failed: ${(error as Error).message}`);
  }
}

// Helper function to test channel connection
async function testChannelConnectionByType(type: ChannelType, config: any): Promise<any> {
  try {
    if (type === ChannelType.EMAIL) {
      const result = await ProviderFactory.testProviderConnection('email', config);
      return {
        status: result.success ? 'success' : 'failed',
        message: result.success ? 'Email connection test passed' : result.error
      };
    } else {
      const result = await ProviderFactory.testProviderConnection('messaging', config);
      return {
        status: result.success ? 'success' : 'failed',
        message: result.success ? 'Messaging connection test passed' : result.error
      };
    }
  } catch (error) {
    return {
      status: 'failed',
      message: `Connection test failed: ${(error as Error).message}`
    };
  }
}
