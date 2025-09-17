import { Response, NextFunction } from 'express';
import { PrismaClient, UserRole } from '@prisma/client';
import { AuthenticatedRequest, PaginationQuery, FilterQuery } from '@/shared/types';
import { NotFoundError, ValidationError, ForbiddenError } from '@/shared/utils/AppError';
import { logger } from '@/shared/utils/logger';

const prisma = new PrismaClient();

export class DepartmentController {
  static async getDepartments(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ForbiddenError('Authentication required');
      }

      const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query as PaginationQuery;
      const { search } = req.query as FilterQuery;

      const skip = (page - 1) * limit;
      
      let whereClause: any = {};

      // Role-based access control
      if (req.user.role === UserRole.SUPER_ADMIN) {
        // Super admin can see all departments
      } else {
        // Others can only see departments in their company
        whereClause.companyId = req.user.companyId;
      }

      if (search) {
        whereClause.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ];
      }

      const [departments, total] = await Promise.all([
        prisma.department.findMany({
          where: whereClause,
          skip,
          take: limit,
          orderBy: { [sortBy]: sortOrder },
          include: {
            company: {
              select: { id: true, name: true },
            },
            leader: {
              select: { id: true, firstName: true, lastName: true, email: true },
            },
            _count: {
              select: { users: true, tickets: true },
            },
          },
        }),
        prisma.department.count({ where: whereClause }),
      ]);

      const totalPages = Math.ceil(total / limit);

      res.status(200).json({
        success: true,
        message: 'Departments retrieved successfully',
        data: departments,
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

  static async getDepartmentById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ForbiddenError('Authentication required');
      }

      const { id } = req.params;

      const department = await prisma.department.findUnique({
        where: { id },
        include: {
          company: {
            select: { id: true, name: true },
          },
          leader: {
            select: { id: true, firstName: true, lastName: true, email: true, phone: true },
          },
          users: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true,
              status: true,
            },
            orderBy: { firstName: 'asc' },
          },
          _count: {
            select: { tickets: true },
          },
        },
      });

      if (!department) {
        throw new NotFoundError('Department not found');
      }

      // Access control
      if (req.user.role !== UserRole.SUPER_ADMIN && req.user.companyId !== department.companyId) {
        throw new ForbiddenError('Access denied to this department');
      }

      res.status(200).json({
        success: true,
        message: 'Department retrieved successfully',
        data: department,
      });
    } catch (error) {
      next(error);
    }
  }

  static async createDepartment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ForbiddenError('Authentication required');
      }

      // Only Super Admin and CS Admin can create departments
      if (req.user.role !== UserRole.SUPER_ADMIN && req.user.role !== UserRole.CS_ADMIN) {
        throw new ForbiddenError('Insufficient permissions');
      }

      const { name, description, companyId, leaderId } = req.body;

      // Validate company access
      if (req.user.role === UserRole.CS_ADMIN && companyId !== req.user.companyId) {
        throw new ForbiddenError('Cannot create department for different company');
      }

      // Check if department name already exists in the company
      const existingDepartment = await prisma.department.findFirst({
        where: { name, companyId },
      });

      if (existingDepartment) {
        throw new ValidationError('Department name already exists in this company');
      }

      // Validate leader if provided
      if (leaderId) {
        const leader = await prisma.user.findUnique({
          where: { id: leaderId },
        });

        if (!leader) {
          throw new ValidationError('Leader not found');
        }

        if (leader.companyId !== companyId) {
          throw new ValidationError('Leader must belong to the same company');
        }

        if (leader.role !== UserRole.CS_ADMIN && leader.role !== UserRole.CS_AGENT) {
          throw new ValidationError('Leader must be CS Admin or CS Agent');
        }
      }

      const newDepartment = await prisma.department.create({
        data: {
          name,
          description,
          companyId,
          leaderId,
        },
        include: {
          company: {
            select: { id: true, name: true },
          },
          leader: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
          _count: {
            select: { users: true, tickets: true },
          },
        },
      });

      logger.info('Department created successfully', {
        departmentId: newDepartment.id,
        departmentName: newDepartment.name,
        companyId,
        createdBy: req.user.id,
      });

      res.status(201).json({
        success: true,
        message: 'Department created successfully',
        data: newDepartment,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateDepartment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ForbiddenError('Authentication required');
      }

      const { id } = req.params;
      const { name, description, leaderId } = req.body;

      const existingDepartment = await prisma.department.findUnique({
        where: { id },
      });

      if (!existingDepartment) {
        throw new NotFoundError('Department not found');
      }

      // Access control
      if (req.user.role !== UserRole.SUPER_ADMIN && req.user.companyId !== existingDepartment.companyId) {
        throw new ForbiddenError('Access denied to this department');
      }

      // Only Super Admin and CS Admin can update departments
      if (req.user.role !== UserRole.SUPER_ADMIN && req.user.role !== UserRole.CS_ADMIN) {
        throw new ForbiddenError('Insufficient permissions');
      }

      // Check if new name conflicts with existing department
      if (name && name !== existingDepartment.name) {
        const nameConflict = await prisma.department.findFirst({
          where: { 
            name, 
            companyId: existingDepartment.companyId,
            id: { not: id },
          },
        });

        if (nameConflict) {
          throw new ValidationError('Department name already exists in this company');
        }
      }

      // Validate leader if provided
      if (leaderId) {
        const leader = await prisma.user.findUnique({
          where: { id: leaderId },
        });

        if (!leader) {
          throw new ValidationError('Leader not found');
        }

        if (leader.companyId !== existingDepartment.companyId) {
          throw new ValidationError('Leader must belong to the same company');
        }

        if (leader.role !== UserRole.CS_ADMIN && leader.role !== UserRole.CS_AGENT) {
          throw new ValidationError('Leader must be CS Admin or CS Agent');
        }
      }

      const updatedDepartment = await prisma.department.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(description !== undefined && { description }),
          ...(leaderId !== undefined && { leaderId }),
        },
        include: {
          company: {
            select: { id: true, name: true },
          },
          leader: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
          _count: {
            select: { users: true, tickets: true },
          },
        },
      });

      logger.info('Department updated successfully', {
        departmentId: updatedDepartment.id,
        updatedBy: req.user.id,
      });

      res.status(200).json({
        success: true,
        message: 'Department updated successfully',
        data: updatedDepartment,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteDepartment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ForbiddenError('Authentication required');
      }

      // Only Super Admin and CS Admin can delete departments
      if (req.user.role !== UserRole.SUPER_ADMIN && req.user.role !== UserRole.CS_ADMIN) {
        throw new ForbiddenError('Insufficient permissions');
      }

      const { id } = req.params;

      const existingDepartment = await prisma.department.findUnique({
        where: { id },
        include: {
          _count: {
            select: { users: true, tickets: true },
          },
        },
      });

      if (!existingDepartment) {
        throw new NotFoundError('Department not found');
      }

      // Access control
      if (req.user.role === UserRole.CS_ADMIN && req.user.companyId !== existingDepartment.companyId) {
        throw new ForbiddenError('Cannot delete department from different company');
      }

      // Check if department has users or tickets
      if (existingDepartment._count.users > 0) {
        throw new ValidationError('Cannot delete department with existing users');
      }

      if (existingDepartment._count.tickets > 0) {
        throw new ValidationError('Cannot delete department with existing tickets');
      }

      await prisma.department.delete({
        where: { id },
      });

      logger.info('Department deleted successfully', {
        departmentId: id,
        deletedBy: req.user.id,
      });

      res.status(200).json({
        success: true,
        message: 'Department deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}
