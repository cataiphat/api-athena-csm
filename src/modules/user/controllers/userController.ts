import { Response, NextFunction } from 'express';
import { PrismaClient, UserRole, UserStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { AuthenticatedRequest, PaginationQuery, FilterQuery } from '@/shared/types';
import { NotFoundError, ValidationError, ForbiddenError } from '@/shared/utils/AppError';
import { logger } from '@/shared/utils/logger';

const prisma = new PrismaClient();

export class UserController {
  static async getUsers(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ForbiddenError('Authentication required');
      }

      const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query as PaginationQuery;
      const { search, status, role, departmentId } = req.query as FilterQuery;

      const skip = (page - 1) * limit;
      
      // Build where clause based on user role and filters
      let whereClause: any = {};

      // Role-based access control
      if (req.user.role === UserRole.SUPER_ADMIN) {
        // Super admin can see all users
      } else if (req.user.role === UserRole.CS_ADMIN) {
        // CS Admin can only see users in their company
        whereClause.companyId = req.user.companyId;
      } else {
        // Other roles can only see users in their department
        whereClause.companyId = req.user.companyId;
        if (req.user.departmentId) {
          whereClause.departmentId = req.user.departmentId;
        }
      }

      // Apply filters
      if (search) {
        whereClause.OR = [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ];
      }

      if (status) {
        whereClause.status = status;
      }

      if (role) {
        whereClause.role = role;
      }

      if (departmentId) {
        whereClause.departmentId = departmentId;
      }

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where: whereClause,
          skip,
          take: limit,
          orderBy: { [sortBy]: sortOrder },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            avatar: true,
            role: true,
            status: true,
            companyId: true,
            departmentId: true,
            lastLoginAt: true,
            createdAt: true,
            updatedAt: true,
            company: {
              select: { id: true, name: true },
            },
            department: {
              select: { id: true, name: true },
            },
          },
        }),
        prisma.user.count({ where: whereClause }),
      ]);

      const totalPages = Math.ceil(total / limit);

      res.status(200).json({
        success: true,
        message: 'Users retrieved successfully',
        data: users,
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

  static async getUserById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ForbiddenError('Authentication required');
      }

      const { id } = req.params;

      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          avatar: true,
          role: true,
          status: true,
          companyId: true,
          departmentId: true,
          settings: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
          company: {
            select: { id: true, name: true },
          },
          department: {
            select: { id: true, name: true },
          },
          assignedTickets: {
            select: { id: true, title: true, status: true },
            take: 5,
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      if (!user) {
        throw new NotFoundError('User not found');
      }

      // Check access permissions
      if (req.user.role !== UserRole.SUPER_ADMIN) {
        if (req.user.companyId !== user.companyId) {
          throw new ForbiddenError('Access denied');
        }
        
        if (req.user.role === UserRole.CS_AGENT && req.user.departmentId !== user.departmentId) {
          throw new ForbiddenError('Access denied');
        }
      }

      res.status(200).json({
        success: true,
        message: 'User retrieved successfully',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  static async createUser(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ForbiddenError('Authentication required');
      }

      // Only Super Admin and CS Admin can create users
      if (req.user.role !== UserRole.SUPER_ADMIN && req.user.role !== UserRole.CS_ADMIN) {
        throw new ForbiddenError('Insufficient permissions');
      }

      const {
        email,
        password,
        firstName,
        lastName,
        phone,
        role,
        companyId,
        departmentId,
        settings,
      } = req.body;

      // Validate company access
      if (req.user.role === UserRole.CS_ADMIN && companyId !== req.user.companyId) {
        throw new ForbiddenError('Cannot create user for different company');
      }

      // Check if email already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw new ValidationError('Email already exists');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName,
          lastName,
          phone,
          role,
          status: UserStatus.ACTIVE,
          companyId,
          departmentId,
          settings,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          status: true,
          companyId: true,
          departmentId: true,
          createdAt: true,
          company: {
            select: { id: true, name: true },
          },
          department: {
            select: { id: true, name: true },
          },
        },
      });

      logger.info('User created successfully', {
        userId: newUser.id,
        email: newUser.email,
        createdBy: req.user.id,
      });

      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: newUser,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateUser(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ForbiddenError('Authentication required');
      }

      const { id } = req.params;
      const {
        firstName,
        lastName,
        phone,
        avatar,
        role,
        status,
        departmentId,
        settings,
        password,
      } = req.body;

      // Check if user exists and access permissions
      const existingUser = await prisma.user.findUnique({
        where: { id },
      });

      if (!existingUser) {
        throw new NotFoundError('User not found');
      }

      // Permission checks
      const canUpdate = 
        req.user.role === UserRole.SUPER_ADMIN ||
        (req.user.role === UserRole.CS_ADMIN && existingUser.companyId === req.user.companyId) ||
        (req.user.id === id); // Users can update themselves

      if (!canUpdate) {
        throw new ForbiddenError('Insufficient permissions');
      }

      // Prepare update data
      const updateData: any = {
        firstName,
        lastName,
        phone,
        avatar,
        settings,
      };

      // Only admins can update role, status, and departmentId
      if (req.user.role === UserRole.SUPER_ADMIN || req.user.role === UserRole.CS_ADMIN) {
        if (role !== undefined) updateData.role = role;
        if (status !== undefined) updateData.status = status;
        if (departmentId !== undefined) updateData.departmentId = departmentId;
      }

      // Hash new password if provided
      if (password) {
        updateData.password = await bcrypt.hash(password, 10);
      }

      const updatedUser = await prisma.user.update({
        where: { id },
        data: updateData,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          avatar: true,
          role: true,
          status: true,
          companyId: true,
          departmentId: true,
          settings: true,
          updatedAt: true,
          company: {
            select: { id: true, name: true },
          },
          department: {
            select: { id: true, name: true },
          },
        },
      });

      logger.info('User updated successfully', {
        userId: updatedUser.id,
        updatedBy: req.user.id,
      });

      res.status(200).json({
        success: true,
        message: 'User updated successfully',
        data: updatedUser,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteUser(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ForbiddenError('Authentication required');
      }

      // Only Super Admin and CS Admin can delete users
      if (req.user.role !== UserRole.SUPER_ADMIN && req.user.role !== UserRole.CS_ADMIN) {
        throw new ForbiddenError('Insufficient permissions');
      }

      const { id } = req.params;

      const existingUser = await prisma.user.findUnique({
        where: { id },
      });

      if (!existingUser) {
        throw new NotFoundError('User not found');
      }

      // CS Admin can only delete users in their company
      if (req.user.role === UserRole.CS_ADMIN && existingUser.companyId !== req.user.companyId) {
        throw new ForbiddenError('Cannot delete user from different company');
      }

      // Cannot delete yourself
      if (existingUser.id === req.user.id) {
        throw new ValidationError('Cannot delete your own account');
      }

      // Soft delete by setting status to INACTIVE
      await prisma.user.update({
        where: { id },
        data: { status: UserStatus.INACTIVE },
      });

      logger.info('User deleted successfully', {
        userId: id,
        deletedBy: req.user.id,
      });

      res.status(200).json({
        success: true,
        message: 'User deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}
