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

      // Role-based access control - in single-tenant, all authenticated users can see all departments

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
            head: {
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
          head: {
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

      // In single-tenant architecture, all authenticated users have access

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

      const { name, description, headId } = req.body;

      // Check if department name already exists
      const existingDepartment = await prisma.department.findFirst({
        where: { name },
      });

      if (existingDepartment) {
        throw new ValidationError('Department name already exists');
      }

      // Validate head if provided
      if (headId) {
        const head = await prisma.user.findUnique({
          where: { id: headId },
          include: {
            role: {
              select: { type: true },
            },
          },
        });

        if (!head) {
          throw new ValidationError('Department head not found');
        }

        if (head.role.type !== UserRole.CS_ADMIN && head.role.type !== UserRole.DEPARTMENT_HEAD) {
          throw new ValidationError('Department head must be CS Admin or Department Head');
        }
      }

      const newDepartment = await prisma.department.create({
        data: {
          name,
          description,
          headId,
        },
        include: {
          head: {
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

      // Single-tenant: simplified access control
      if (req.user.role !== UserRole.SUPER_ADMIN && req.user.role !== UserRole.CS_ADMIN) {
        throw new ForbiddenError('Insufficient permissions');
      }

      // Check if new name conflicts with existing department
      if (name && name !== existingDepartment.name) {
        const nameConflict = await prisma.department.findFirst({
          where: {
            name,
            id: { not: id },
          },
        });

        if (nameConflict) {
          throw new ValidationError('Department name already exists');
        }
      }

      // Validate leader if provided
      if (leaderId) {
        const leader = await prisma.user.findUnique({
          where: { id: leaderId },
          include: {
            role: {
              select: { type: true },
            },
          },
        });

        if (!leader) {
          throw new ValidationError('Leader not found');
        }

        // Single-tenant: check role type from relationship
        if (leader.role.type !== UserRole.CS_ADMIN && leader.role.type !== UserRole.DEPARTMENT_HEAD) {
          throw new ValidationError('Leader must be CS Admin or Department Head');
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
          head: {
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

      // Single-tenant: all admins can delete departments

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
