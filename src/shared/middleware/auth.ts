import { Response, NextFunction } from 'express';
import { PrismaClient, UserRole } from '@prisma/client';
import { JWTService } from '@/shared/utils/jwt';
import { AuthenticatedRequest } from '@/shared/types';
import { UnauthorizedError, ForbiddenError } from '@/shared/utils/AppError';
import { config } from '@/config/config';

const prisma = new PrismaClient();

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      throw new UnauthorizedError('Authorization header is required');
    }

    const token = authHeader.split(' ')[1]; // Bearer <token>
    
    if (!token) {
      throw new UnauthorizedError('Token is required');
    }

    // Check for sample token in development
    if (config.nodeEnv === 'development' && token === config.sampleToken) {
      // Use sample user for development
      req.user = {
        id: 'sample-user-id',
        email: 'sample@example.com',
        firstName: 'Sample',
        lastName: 'User',
        role: UserRole.CS_ADMIN,
        companyId: 'sample-company-id',
        departmentId: 'sample-department-id',
      };
      return next();
    }

    // Verify JWT token
    const decoded = JWTService.verifyAccessToken(token);
    
    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        companyId: true,
        departmentId: true,
      },
    });

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedError('User account is not active');
    }

    req.user = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      companyId: user.companyId,
      departmentId: user.departmentId || undefined,
    };

    next();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return next(error);
    }
    
    // Handle JWT errors
    if (error instanceof Error) {
      if (error.name === 'JsonWebTokenError') {
        return next(new UnauthorizedError('Invalid token'));
      }
      if (error.name === 'TokenExpiredError') {
        return next(new UnauthorizedError('Token expired'));
      }
    }

    next(new UnauthorizedError('Authentication failed'));
  }
};

export const authorize = (...roles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    if (!roles.includes(req.user.role)) {
      return next(new ForbiddenError('Insufficient permissions'));
    }

    next();
  };
};

// Middleware to check if user belongs to the same company
export const checkCompanyAccess = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return next(new UnauthorizedError('Authentication required'));
  }

  // Super admin can access all companies
  if (req.user.role === UserRole.SUPER_ADMIN) {
    return next();
  }

  // Extract company ID from request (params, body, or query)
  const requestCompanyId = req.params.companyId || req.body.companyId || req.query.companyId;

  if (requestCompanyId && requestCompanyId !== req.user.companyId) {
    return next(new ForbiddenError('Access denied to this company'));
  }

  next();
};

// Middleware to check department access
export const checkDepartmentAccess = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return next(new UnauthorizedError('Authentication required'));
  }

  // Super admin and CS admin can access all departments in their company
  if (req.user.role === UserRole.SUPER_ADMIN || req.user.role === UserRole.CS_ADMIN) {
    return next();
  }

  const requestDepartmentId = req.params.departmentId || req.body.departmentId || req.query.departmentId;

  if (requestDepartmentId && requestDepartmentId !== req.user.departmentId) {
    return next(new ForbiddenError('Access denied to this department'));
  }

  next();
};
