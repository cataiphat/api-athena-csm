import { PrismaClient, UserRole, UserStatus } from '@prisma/client';
import { AppError } from '../../../shared/utils/AppError';
import { logger } from '../../../shared/utils/logger';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export interface CreateUserRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
  departmentId?: string;
  teamId?: string;
  canAccessReports?: boolean;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  role?: UserRole;
  status?: UserStatus;
  departmentId?: string;
  teamId?: string;
  canAccessReports?: boolean;
}

export interface UserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
  companyId: string;
  departmentId?: string;
  teamId?: string;
  canAccessReports: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  company?: {
    id: string;
    name: string;
  };
  department?: {
    id: string;
    name: string;
  };
  team?: {
    id: string;
    name: string;
  };
}

export class UserService {
  static async createUser(data: CreateUserRequest, companyId: string, creatorId: string): Promise<UserResponse> {
    try {
      // Check if email already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email }
      });

      if (existingUser) {
        throw new AppError('Email already exists', 400);
      }

      // Verify department exists if provided
      if (data.departmentId) {
        const department = await prisma.department.findFirst({
          where: { id: data.departmentId, companyId }
        });

        if (!department) {
          throw new AppError('Department not found', 404);
        }
      }

      // Verify team exists if provided
      if (data.teamId) {
        const team = await prisma.team.findFirst({
          where: { id: data.teamId, companyId }
        });

        if (!team) {
          throw new AppError('Team not found', 404);
        }
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(data.password, 12);

      // Create user
      const user = await prisma.user.create({
        data: {
          email: data.email,
          password: hashedPassword,
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          role: data.role,
          companyId,
          departmentId: data.departmentId,
          teamId: data.teamId,
          canAccessReports: data.canAccessReports || false
        },
        include: {
          company: { select: { id: true, name: true } },
          department: { select: { id: true, name: true } },
          team: { select: { id: true, name: true } }
        }
      });

      logger.info('User created successfully', { userId: user.id, companyId, creatorId });
      return this.formatUserResponse(user);
    } catch (error: any) {
      logger.error('Failed to create user', { error: (error as Error).message, companyId, creatorId });
      throw error instanceof AppError ? error : new AppError('Failed to create user', 500);
    }
  }

  static async getUsers(
    companyId: string, 
    userId: string, 
    userRole: UserRole,
    query: any
  ): Promise<{ users: UserResponse[]; total: number; page: number; limit: number; totalPages: number }> {
    try {
      const { page = 1, limit = 10, search, role, status, departmentId, teamId, canAccessReports } = query;
      const skip = (page - 1) * limit;

      // Build where clause based on user role
      let whereClause: any = { companyId };

      // Role-based filtering
      if (userRole === 'DEPARTMENT_HEAD') {
        const userDepartment = await prisma.user.findUnique({
          where: { id: userId },
          select: { departmentId: true }
        });
        if (userDepartment?.departmentId) {
          whereClause.departmentId = userDepartment.departmentId;
        }
      } else if (userRole === 'TEAM_LEADER') {
        const userTeam = await prisma.user.findUnique({
          where: { id: userId },
          select: { teamId: true }
        });
        if (userTeam?.teamId) {
          whereClause.teamId = userTeam.teamId;
        }
      }

      // Additional filters
      if (search) {
        whereClause.OR = [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } }
        ];
      }
      if (role) whereClause.role = role;
      if (status) whereClause.status = status;
      if (departmentId) whereClause.departmentId = departmentId;
      if (teamId) whereClause.teamId = teamId;
      if (canAccessReports !== undefined) whereClause.canAccessReports = canAccessReports;

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where: whereClause,
          include: {
            company: { select: { id: true, name: true } },
            department: { select: { id: true, name: true } },
            team: { select: { id: true, name: true } }
          },
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' }
        }),
        prisma.user.count({ where: whereClause })
      ]);

      return {
        users: users.map(user => this.formatUserResponse(user)),
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error: any) {
      logger.error('Failed to get users', { error: (error as Error).message, companyId, userId });
      throw new AppError('Failed to retrieve users', 500);
    }
  }

  static async getUserById(targetUserId: string, companyId: string, userId: string, userRole: UserRole): Promise<UserResponse> {
    try {
      let whereClause: any = { id: targetUserId, companyId };

      // Role-based access control
      if (userRole === 'DEPARTMENT_HEAD') {
        const userDepartment = await prisma.user.findUnique({
          where: { id: userId },
          select: { departmentId: true }
        });
        if (userDepartment?.departmentId) {
          whereClause.departmentId = userDepartment.departmentId;
        }
      } else if (userRole === 'TEAM_LEADER') {
        const userTeam = await prisma.user.findUnique({
          where: { id: userId },
          select: { teamId: true }
        });
        if (userTeam?.teamId) {
          whereClause.teamId = userTeam.teamId;
        }
      }

      const user = await prisma.user.findFirst({
        where: whereClause,
        include: {
          company: { select: { id: true, name: true } },
          department: { select: { id: true, name: true } },
          team: { select: { id: true, name: true } }
        }
      });

      if (!user) {
        throw new AppError('User not found or access denied', 404);
      }

      return this.formatUserResponse(user);
    } catch (error: any) {
      logger.error('Failed to get user', { targetUserId, error: (error as Error).message, companyId, userId });
      throw error instanceof AppError ? error : new AppError('Failed to retrieve user', 500);
    }
  }

  static async updateUser(
    targetUserId: string, 
    data: UpdateUserRequest, 
    companyId: string, 
    userId: string,
    userRole: UserRole
  ): Promise<UserResponse> {
    try {
      // Check if user exists and current user has permission
      await this.getUserById(targetUserId, companyId, userId, userRole);

      // Verify department exists if provided
      if (data.departmentId) {
        const department = await prisma.department.findFirst({
          where: { id: data.departmentId, companyId }
        });

        if (!department) {
          throw new AppError('Department not found', 404);
        }
      }

      // Verify team exists if provided
      if (data.teamId) {
        const team = await prisma.team.findFirst({
          where: { id: data.teamId, companyId }
        });

        if (!team) {
          throw new AppError('Team not found', 404);
        }
      }

      // Update user
      const updatedUser = await prisma.user.update({
        where: { id: targetUserId },
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          role: data.role,
          status: data.status,
          departmentId: data.departmentId,
          teamId: data.teamId,
          canAccessReports: data.canAccessReports
        },
        include: {
          company: { select: { id: true, name: true } },
          department: { select: { id: true, name: true } },
          team: { select: { id: true, name: true } }
        }
      });

      logger.info('User updated successfully', { targetUserId, companyId, userId });
      return this.formatUserResponse(updatedUser);
    } catch (error: any) {
      logger.error('Failed to update user', { targetUserId, error: (error as Error).message, companyId, userId });
      throw error instanceof AppError ? error : new AppError('Failed to update user', 500);
    }
  }

  static async updateReportAccess(
    targetUserId: string, 
    canAccessReports: boolean, 
    companyId: string, 
    userId: string
  ): Promise<UserResponse> {
    try {
      // Only CS_ADMIN can update report access
      const currentUser = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!currentUser || currentUser.role !== 'CS_ADMIN') {
        throw new AppError('Only CS Admin can update report access permissions', 403);
      }

      // Check if target user exists and belongs to same company
      const targetUser = await prisma.user.findFirst({
        where: { id: targetUserId, companyId }
      });

      if (!targetUser) {
        throw new AppError('User not found', 404);
      }

      // Update report access
      const updatedUser = await prisma.user.update({
        where: { id: targetUserId },
        data: { canAccessReports },
        include: {
          company: { select: { id: true, name: true } },
          department: { select: { id: true, name: true } },
          team: { select: { id: true, name: true } }
        }
      });

      logger.info('User report access updated', { targetUserId, canAccessReports, companyId, userId });
      return this.formatUserResponse(updatedUser);
    } catch (error: any) {
      logger.error('Failed to update user report access', { targetUserId, error: (error as Error).message, companyId, userId });
      throw error instanceof AppError ? error : new AppError('Failed to update report access', 500);
    }
  }

  private static formatUserResponse(user: any): UserResponse {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      role: user.role,
      status: user.status,
      companyId: user.companyId,
      departmentId: user.departmentId,
      teamId: user.teamId,
      canAccessReports: user.canAccessReports,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      company: user.company,
      department: user.department,
      team: user.team
    };
  }
}
