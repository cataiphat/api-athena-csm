import { PermissionType, ResourceType } from '@prisma/client';

export interface CreatePermissionRequest {
  name: string;
  description?: string;
  resource: ResourceType;
  action: PermissionType;
  conditions?: any;
}

export interface UpdatePermissionRequest {
  name?: string;
  description?: string;
  conditions?: any;
  isActive?: boolean;
}

export interface CreateRoleRequest {
  name: string;
  description?: string;
  permissionIds: string[];
}

export interface UpdateRoleRequest {
  name?: string;
  description?: string;
  isActive?: boolean;
}

export interface AssignRoleRequest {
  userIds: string[];
  roleId: string;
}

export interface AssignPermissionRequest {
  userIds: string[];
  permissionId: string;
  granted: boolean;
  conditions?: any;
}

export interface PermissionResponse {
  id: string;
  name: string;
  description?: string;
  resource: ResourceType;
  action: PermissionType;
  conditions?: any;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface RoleResponse {
  id: string;
  name: string;
  description?: string;
  companyId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  permissions?: PermissionResponse[];
  userCount?: number;
}

export interface UserPermissionResponse {
  id: string;
  userId: string;
  permission: PermissionResponse;
  granted: boolean;
  conditions?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface PermissionQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  resource?: ResourceType;
  action?: PermissionType;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface RoleQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
