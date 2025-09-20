import { Response, NextFunction } from 'express';
import { PrismaClient, UserRole } from '@prisma/client';
import { AuthenticatedRequest, PaginationQuery, FilterQuery } from '@/shared/types';
import { NotFoundError, ValidationError, ForbiddenError } from '@/shared/utils/AppError';
import { logger } from '@/shared/utils/logger';

const prisma = new PrismaClient();

export class SLAController {
  static async getSLAs(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ForbiddenError('Authentication required');
      }

      const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query as PaginationQuery;
      const { search } = req.query as FilterQuery;

      const skip = (page - 1) * limit;
      
      let whereClause: any = {};

      // Single-tenant: all users can see all SLAs

      // Apply search filter
      if (search) {
        whereClause.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ];
      }

      const [slas, total] = await Promise.all([
        prisma.sLA.findMany({
          where: whereClause,
          skip,
          take: limit,
          orderBy: { [sortBy]: sortOrder },
          include: {
            _count: {
              select: { tickets: true, slaTracking: true },
            },
          },
        }),
        prisma.sLA.count({ where: whereClause }),
      ]);

      const totalPages = Math.ceil(total / limit);

      res.status(200).json({
        success: true,
        message: 'SLAs retrieved successfully',
        data: slas,
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

  static async getSLAById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ForbiddenError('Authentication required');
      }

      const { id } = req.params;

      const sla = await prisma.sLA.findUnique({
        where: { id },
        include: {
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
          slaTracking: {
            include: {
              ticket: {
                select: { 
                  id: true, 
                  ticketNumber: true, 
                  title: true, 
                  status: true,
                },
              },
            },
            take: 10,
            orderBy: { createdAt: 'desc' },
          },
          _count: {
            select: { tickets: true, slaTracking: true },
          },
        },
      });

      if (!sla) {
        throw new NotFoundError('SLA not found');
      }

      // Single-tenant: all authenticated users can access SLAs

      res.status(200).json({
        success: true,
        message: 'SLA retrieved successfully',
        data: sla,
      });
    } catch (error) {
      next(error);
    }
  }

  static async createSLA(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ForbiddenError('Authentication required');
      }

      // Only Super Admin and CS Admin can create SLAs
      if (req.user.role !== UserRole.SUPER_ADMIN && req.user.role !== UserRole.CS_ADMIN) {
        throw new ForbiddenError('Insufficient permissions');
      }

      const {
        name,
        description,
        ticketType,
        priority,
        firstResponseTimeHours,
        resolutionTimeHours,
        businessHoursOnly = false,
        isActive = true,
        companyId,
      } = req.body;

      // Single-tenant: no company validation needed

      const newSLA = await prisma.sLA.create({
        data: {
          name,
          description,
          ticketType,
          priority,
          firstResponseTimeHours,
          resolutionTimeHours,
          businessHoursOnly,
          status: isActive ? 'ACTIVE' : 'INACTIVE',
        },
      });

      logger.info('SLA created successfully', {
        slaId: newSLA.id,
        name: newSLA.name,
        createdBy: req.user.id,
      });

      res.status(201).json({
        success: true,
        message: 'SLA created successfully',
        data: newSLA,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateSLA(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ForbiddenError('Authentication required');
      }

      // Only Super Admin and CS Admin can update SLAs
      if (req.user.role !== UserRole.SUPER_ADMIN && req.user.role !== UserRole.CS_ADMIN) {
        throw new ForbiddenError('Insufficient permissions');
      }

      const { id } = req.params;
      const {
        name,
        description,
        firstResponseTimeHours,
        resolutionTimeHours,
        businessHoursOnly,
        isActive,
      } = req.body;

      // Check if SLA exists and access permissions
      const existingSLA = await prisma.sLA.findUnique({
        where: { id },
      });

      if (!existingSLA) {
        throw new NotFoundError('SLA not found');
      }

      // Single-tenant: all admins can update SLAs

      const updateData: any = {};
      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (firstResponseTimeHours !== undefined) updateData.firstResponseTimeHours = firstResponseTimeHours;
      if (resolutionTimeHours !== undefined) updateData.resolutionTimeHours = resolutionTimeHours;
      if (businessHoursOnly !== undefined) updateData.businessHoursOnly = businessHoursOnly;
      if (isActive !== undefined) updateData.isActive = isActive;

      const updatedSLA = await prisma.sLA.update({
        where: { id },
        data: updateData,

      });

      logger.info('SLA updated successfully', {
        slaId: updatedSLA.id,
        updatedBy: req.user.id,
      });

      res.status(200).json({
        success: true,
        message: 'SLA updated successfully',
        data: updatedSLA,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteSLA(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ForbiddenError('Authentication required');
      }

      // Only Super Admin and CS Admin can delete SLAs
      if (req.user.role !== UserRole.SUPER_ADMIN && req.user.role !== UserRole.CS_ADMIN) {
        throw new ForbiddenError('Insufficient permissions');
      }

      const { id } = req.params;

      const existingSLA = await prisma.sLA.findUnique({
        where: { id },
        include: {
          _count: {
            select: { tickets: true },
          },
        },
      });

      if (!existingSLA) {
        throw new NotFoundError('SLA not found');
      }

      // Single-tenant: all admins can delete SLAs

      // Check if SLA is being used by tickets
      if (existingSLA._count.tickets > 0) {
        throw new ValidationError('Cannot delete SLA that is assigned to tickets');
      }

      await prisma.sLA.delete({
        where: { id },
      });

      logger.info('SLA deleted successfully', {
        slaId: id,
        deletedBy: req.user.id,
      });

      res.status(200).json({
        success: true,
        message: 'SLA deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}
