import { Response, NextFunction } from 'express';
import { PrismaClient, UserRole } from '@prisma/client';
import { AuthenticatedRequest, PaginationQuery, FilterQuery } from '@/shared/types';
import { NotFoundError, ValidationError, ForbiddenError } from '@/shared/utils/AppError';
import { logger } from '@/shared/utils/logger';

const prisma = new PrismaClient();

export class CompanyController {
  static async getCompanies(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ForbiddenError('Authentication required');
      }

      // Only Super Admin can view all companies
      if (req.user.role !== UserRole.SUPER_ADMIN) {
        throw new ForbiddenError('Only Super Admin can view all companies');
      }

      const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query as PaginationQuery;
      const { search } = req.query as FilterQuery;

      const skip = (page - 1) * limit;
      
      let whereClause: any = {};

      if (search) {
        whereClause.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ];
      }

      const [companies, total] = await Promise.all([
        prisma.company.findMany({
          where: whereClause,
          skip,
          take: limit,
          orderBy: { [sortBy]: sortOrder },
          include: {
            _count: {
              select: {
                users: true,
                departments: true,
                tickets: true,
                channels: true,
              },
            },
          },
        }),
        prisma.company.count({ where: whereClause }),
      ]);

      const totalPages = Math.ceil(total / limit);

      res.status(200).json({
        success: true,
        message: 'Companies retrieved successfully',
        data: companies,
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

  static async getCompanyById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ForbiddenError('Authentication required');
      }

      const { id } = req.params;

      // Access control
      if (req.user.role !== UserRole.SUPER_ADMIN && req.user.companyId !== id) {
        throw new ForbiddenError('Access denied to this company');
      }

      const company = await prisma.company.findUnique({
        where: { id },
        include: {
          departments: {
            include: {
              _count: {
                select: { users: true },
              },
            },
          },
          _count: {
            select: {
              users: true,
              tickets: true,
              channels: true,
              slas: true,
            },
          },
        },
      });

      if (!company) {
        throw new NotFoundError('Company not found');
      }

      res.status(200).json({
        success: true,
        message: 'Company retrieved successfully',
        data: company,
      });
    } catch (error) {
      next(error);
    }
  }

  static async createCompany(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ForbiddenError('Authentication required');
      }

      // Only Super Admin can create companies
      if (req.user.role !== UserRole.SUPER_ADMIN) {
        throw new ForbiddenError('Only Super Admin can create companies');
      }

      const { name, description, settings } = req.body;

      // Check if company name already exists
      const existingCompany = await prisma.company.findFirst({
        where: { name },
      });

      if (existingCompany) {
        throw new ValidationError('Company name already exists');
      }

      const newCompany = await prisma.company.create({
        data: {
          name,
          description,
          settings: settings || {
            timezone: 'Asia/Ho_Chi_Minh',
            businessHours: {
              start: '08:00',
              end: '17:00',
              days: [1, 2, 3, 4, 5], // Monday to Friday
            },
          },
        },
        include: {
          _count: {
            select: {
              users: true,
              departments: true,
              tickets: true,
              channels: true,
            },
          },
        },
      });

      logger.info('Company created successfully', {
        companyId: newCompany.id,
        companyName: newCompany.name,
        createdBy: req.user.id,
      });

      res.status(201).json({
        success: true,
        message: 'Company created successfully',
        data: newCompany,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateCompany(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ForbiddenError('Authentication required');
      }

      const { id } = req.params;
      const { name, description, settings } = req.body;

      // Access control
      if (req.user.role !== UserRole.SUPER_ADMIN && req.user.companyId !== id) {
        throw new ForbiddenError('Access denied to this company');
      }

      // Only Super Admin and CS Admin can update company
      if (req.user.role !== UserRole.SUPER_ADMIN && req.user.role !== UserRole.CS_ADMIN) {
        throw new ForbiddenError('Insufficient permissions');
      }

      const existingCompany = await prisma.company.findUnique({
        where: { id },
      });

      if (!existingCompany) {
        throw new NotFoundError('Company not found');
      }

      // Check if new name conflicts with existing company
      if (name && name !== existingCompany.name) {
        const nameConflict = await prisma.company.findFirst({
          where: { name, id: { not: id } },
        });

        if (nameConflict) {
          throw new ValidationError('Company name already exists');
        }
      }

      const updatedCompany = await prisma.company.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(description !== undefined && { description }),
          ...(settings && { settings }),
        },
        include: {
          _count: {
            select: {
              users: true,
              departments: true,
              tickets: true,
              channels: true,
            },
          },
        },
      });

      logger.info('Company updated successfully', {
        companyId: updatedCompany.id,
        updatedBy: req.user.id,
      });

      res.status(200).json({
        success: true,
        message: 'Company updated successfully',
        data: updatedCompany,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteCompany(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ForbiddenError('Authentication required');
      }

      // Only Super Admin can delete companies
      if (req.user.role !== UserRole.SUPER_ADMIN) {
        throw new ForbiddenError('Only Super Admin can delete companies');
      }

      const { id } = req.params;

      const existingCompany = await prisma.company.findUnique({
        where: { id },
        include: {
          _count: {
            select: { users: true, tickets: true },
          },
        },
      });

      if (!existingCompany) {
        throw new NotFoundError('Company not found');
      }

      // Check if company has active users or tickets
      if (existingCompany._count.users > 0) {
        throw new ValidationError('Cannot delete company with existing users');
      }

      if (existingCompany._count.tickets > 0) {
        throw new ValidationError('Cannot delete company with existing tickets');
      }

      await prisma.company.delete({
        where: { id },
      });

      logger.info('Company deleted successfully', {
        companyId: id,
        deletedBy: req.user.id,
      });

      res.status(200).json({
        success: true,
        message: 'Company deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  static async getCompanyStats(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ForbiddenError('Authentication required');
      }

      const { id } = req.params;

      // Access control
      if (req.user.role !== UserRole.SUPER_ADMIN && req.user.companyId !== id) {
        throw new ForbiddenError('Access denied to this company');
      }

      const company = await prisma.company.findUnique({
        where: { id },
      });

      if (!company) {
        throw new NotFoundError('Company not found');
      }

      // Get comprehensive stats
      const [
        userStats,
        ticketStats,
        channelStats,
        slaStats,
      ] = await Promise.all([
        prisma.user.groupBy({
          by: ['role', 'status'],
          where: { companyId: id },
          _count: true,
        }),
        prisma.ticket.groupBy({
          by: ['status', 'priority'],
          where: { companyId: id },
          _count: true,
        }),
        prisma.channel.groupBy({
          by: ['type', 'status'],
          where: { companyId: id },
          _count: true,
        }),
        prisma.sLA.count({
          where: { companyId: id, status: 'ACTIVE' },
        }),
      ]);

      const stats = {
        users: userStats,
        tickets: ticketStats,
        channels: channelStats,
        activeSLAs: slaStats,
      };

      res.status(200).json({
        success: true,
        message: 'Company statistics retrieved successfully',
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }
}
