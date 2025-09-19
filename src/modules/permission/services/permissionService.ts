import { prisma } from '../../../shared/config/database';
import { UserRole, PermissionType, ResourceType } from '@prisma/client';
import { AppError } from '../../../shared/utils/AppError';

export class PermissionService {
  /**
   * Check if user has permission for a specific action on a resource
   */
  static async hasPermission(
    userId: string,
    resource: ResourceType,
    action: PermissionType,
    companyId: string
  ): Promise<boolean> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          customRole: {
            include: {
              rolePermissions: {
                include: {
                  permission: true
                }
              }
            }
          }
        }
      });

      if (!user || user.companyId !== companyId) {
        return false;
      }

      // Check built-in role permissions first
      if (this.hasBuiltInPermission(user.role, resource, action)) {
        return true;
      }

      // Check custom role permissions
      if (user.customRole) {
        const hasCustomPermission = user.customRole.rolePermissions.some(rp => 
          rp.permission.resource === resource && 
          rp.permission.action === action &&
          rp.permission.isActive
        );
        
        if (hasCustomPermission) {
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error('Permission check error:', error);
      return false;
    }
  }

  /**
   * Check built-in role permissions
   */
  private static hasBuiltInPermission(
    role: UserRole,
    resource: ResourceType,
    action: PermissionType
  ): boolean {
    switch (role) {
      case 'SUPER_ADMIN':
        return true; // Super admin has all permissions

      case 'CS_ADMIN':
        // CS Admin can manage everything in their company
        return [
          'USER', 'DEPARTMENT', 'TEAM', 'TICKET', 'CUSTOMER', 
          'CHANNEL', 'SLA', 'NOTIFICATION', 'REPORT'
        ].includes(resource);

      case 'DEPARTMENT_HEAD':
        // Department head can manage their department
        return [
          'TEAM', 'TICKET', 'CUSTOMER', 'NOTIFICATION'
        ].includes(resource) && 
        ['READ', 'UPDATE', 'ASSIGN'].includes(action);

      case 'TEAM_LEADER':
        // Team leader can manage their team
        return [
          'TICKET', 'CUSTOMER', 'NOTIFICATION'
        ].includes(resource) && 
        ['READ', 'UPDATE', 'ASSIGN'].includes(action);

      case 'CS_AGENT':
        // CS Agent can handle tickets and customers
        return [
          'TICKET', 'CUSTOMER'
        ].includes(resource) && 
        ['READ', 'UPDATE'].includes(action);

      case 'CS_OPERATION':
        // CS Operation can view reports and tickets
        return [
          'TICKET', 'CUSTOMER', 'REPORT'
        ].includes(resource) && 
        action === 'READ';

      default:
        return false;
    }
  }

  /**
   * Get user permissions summary
   */
  static async getUserPermissions(userId: string, companyId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        customRole: {
          include: {
            rolePermissions: {
              include: {
                permission: true
              }
            }
          }
        }
      }
    });

    if (!user || user.companyId !== companyId) {
      throw new AppError('User not found', 404);
    }

    const builtInPermissions = this.getBuiltInPermissions(user.role);
    const customPermissions = user.customRole?.rolePermissions.map(rp => ({
      id: rp.permission.id,
      name: rp.permission.name,
      resource: rp.permission.resource,
      action: rp.permission.action,
      description: rp.permission.description
    })) || [];

    return {
      userId: user.id,
      role: user.role,
      customRole: user.customRole?.name,
      builtInPermissions,
      customPermissions,
      canAccessReports: user.canAccessReports
    };
  }

  /**
   * Get built-in permissions for a role
   */
  private static getBuiltInPermissions(role: UserRole) {
    const permissions = [];
    
    switch (role) {
      case 'SUPER_ADMIN':
        permissions.push({ resource: '*', action: '*', description: 'Full system access' });
        break;
      case 'CS_ADMIN':
        permissions.push({ resource: 'COMPANY', action: 'MANAGE', description: 'Manage company' });
        break;
      case 'DEPARTMENT_HEAD':
        permissions.push({ resource: 'DEPARTMENT', action: 'MANAGE', description: 'Manage department' });
        break;
      case 'TEAM_LEADER':
        permissions.push({ resource: 'TEAM', action: 'MANAGE', description: 'Manage team' });
        break;
      case 'CS_AGENT':
        permissions.push({ resource: 'TICKET', action: 'UPDATE', description: 'Handle tickets' });
        break;
      case 'CS_OPERATION':
        permissions.push({ resource: 'REPORT', action: 'READ', description: 'View reports' });
        break;
    }
    
    return permissions;
  }

  /**
   * Check if user can access resource based on hierarchy
   */
  static async canAccessResource(
    userId: string,
    resourceType: 'department' | 'team' | 'ticket',
    resourceId: string,
    companyId: string
  ): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user || user.companyId !== companyId) {
      return false;
    }

    // Super admin and CS admin can access everything
    if (['SUPER_ADMIN', 'CS_ADMIN'].includes(user.role)) {
      return true;
    }

    switch (resourceType) {
      case 'department':
        // Department head can only access their department
        if (user.role === 'DEPARTMENT_HEAD') {
          return user.departmentId === resourceId;
        }
        break;

      case 'team':
        // Team leader can only access their team
        if (user.role === 'TEAM_LEADER') {
          return user.teamId === resourceId;
        }
        // Department head can access teams in their department
        if (user.role === 'DEPARTMENT_HEAD') {
          const team = await prisma.team.findUnique({
            where: { id: resourceId }
          });
          return team?.departmentId === user.departmentId;
        }
        break;

      case 'ticket':
        // Check ticket access based on assignment or department/team
        const ticket = await prisma.ticket.findUnique({
          where: { id: resourceId },
          include: { team: true }
        });
        
        if (!ticket) return false;
        
        // Assigned user can access
        if (ticket.assigneeId === userId) return true;
        
        // Department head can access tickets in their department
        if (user.role === 'DEPARTMENT_HEAD' && ticket.departmentId === user.departmentId) {
          return true;
        }
        
        // Team leader can access tickets in their team
        if (user.role === 'TEAM_LEADER' && ticket.teamId === user.teamId) {
          return true;
        }
        
        break;
    }

    return false;
  }
}
