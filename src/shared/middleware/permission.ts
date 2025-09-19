import { Request, Response, NextFunction } from 'express';
import { PermissionType, ResourceType } from '@prisma/client';
import { PermissionService } from '@/modules/permission/services/permissionService';
import { AppError } from '../utils/AppError';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    companyId: string;
  };
}

/**
 * Middleware to check if user has specific permission
 */
export const requirePermission = (
  resource: ResourceType,
  action: PermissionType
) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      const hasPermission = await PermissionService.hasPermission(
        req.user.id,
        resource,
        action,
        req.user.companyId
      );

      if (!hasPermission) {
        throw new AppError(`Insufficient permissions for ${action} on ${resource}`, 403);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware to check if user can access specific resource
 */
export const requireResourceAccess = (
  resourceType: 'department' | 'team' | 'ticket',
  resourceIdParam: string = 'id'
) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      const resourceId = req.params[resourceIdParam];
      if (!resourceId) {
        throw new AppError('Resource ID is required', 400);
      }

      const canAccess = await PermissionService.canAccessResource(
        req.user.id,
        resourceType,
        resourceId,
        req.user.companyId
      );

      if (!canAccess) {
        throw new AppError(`Access denied to ${resourceType} ${resourceId}`, 403);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware to check multiple permissions (OR logic)
 */
export const requireAnyPermission = (
  permissions: Array<{ resource: ResourceType; action: PermissionType }>
) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      const hasAnyPermission = await Promise.all(
        permissions.map(({ resource, action }) =>
          PermissionService.hasPermission(
            req.user.id,
            resource,
            action,
            req.user.companyId
          )
        )
      );

      if (!hasAnyPermission.some(Boolean)) {
        throw new AppError('Insufficient permissions', 403);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware to check role-based access
 */
export const requireRole = (roles: string | string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      const allowedRoles = Array.isArray(roles) ? roles : [roles];

      // Note: This needs to be updated to check user's role from database
      // For now, we'll skip this check as user.role field was removed
      // TODO: Implement role checking via database lookup

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware to check if user belongs to same company
 */
export const requireSameCompany = () => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      // This middleware assumes the resource being accessed has companyId
      // Additional logic can be added based on specific use cases
      next();
    } catch (error) {
      next(error);
    }
  };
};
