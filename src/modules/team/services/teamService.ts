import { PrismaClient, UserRole } from '@prisma/client';
import { CreateTeamRequest, UpdateTeamRequest, TeamResponse, TeamListResponse, TeamStatsResponse } from '../types';
import { AppError } from '../../../shared/utils/AppError';
import { logger } from '../../../shared/utils/logger';

const prisma = new PrismaClient();

export class TeamService {
  static async createTeam(data: CreateTeamRequest, userId: string, role: UserRole): Promise<TeamResponse> {
    try {
      // Verify department exists (single-tenant)
      const department = await prisma.department.findFirst({
        where: { id: data.departmentId }
      });

      if (!department) {
        throw new AppError('Department not found', 404);
      }

      // Check if team name already exists in department
      const existingTeam = await prisma.team.findFirst({
        where: {
          name: { equals: data.name },
          departmentId: data.departmentId
        }
      });

      if (existingTeam) {
        throw new AppError('Team name already exists in this department', 400);
      }

      // Verify leader exists (single-tenant)
      if (data.leaderId) {
        const leader = await prisma.user.findFirst({
          where: {
            id: data.leaderId,
            role: {
              type: { in: ['TEAM_LEADER', 'DEPARTMENT_HEAD', 'CS_ADMIN'] }
            }
          },
          include: {
            role: true
          }
        });

        if (!leader) {
          throw new AppError('Team leader not found or invalid role', 404);
        }
      }

      // Verify members exist (single-tenant)
      if (data.memberIds && data.memberIds.length > 0) {
        const members = await prisma.user.findMany({
          where: {
            id: { in: data.memberIds },
            teamId: null // Members should not already be in another team
          }
        });

        if (members.length !== data.memberIds.length) {
          throw new AppError('Some members not found or already assigned to another team', 400);
        }
      }

      // Create team with working hours
      const team = await prisma.team.create({
        data: {
          name: data.name,
          description: data.description,
          departmentId: data.departmentId,
          leaderId: data.leaderId,
          workingHours: data.workingHours ? {
            create: data.workingHours.map(wh => ({
              dayOfWeek: wh.dayOfWeek,
              startTime: wh.startTime,
              endTime: wh.endTime,
              isActive: wh.isActive ?? true
            }))
          } : undefined
        },
        include: {
          department: { select: { id: true, name: true } },
          leader: { select: { id: true, firstName: true, lastName: true, email: true } },
          workingHours: true,
          _count: { select: { members: true, tickets: true } }
        }
      });

      // Assign members to team
      if (data.memberIds && data.memberIds.length > 0) {
        await prisma.user.updateMany({
          where: { id: { in: data.memberIds } },
          data: { teamId: team.id }
        });
      }

      logger.info('Team created successfully', { teamId: team.id, companyId, userId });
      return this.formatTeamResponse(team);
    } catch (error: any) {
      logger.error('Failed to create team', { error: (error as Error).message, companyId, userId });
      throw error instanceof AppError ? error : new AppError('Failed to create team', 500);
    }
  }

  static async getTeams(
    userId: string,
    userRole: UserRole,
    query: any
  ): Promise<TeamListResponse> {
    try {
      const { page = 1, limit = 10, search, departmentId, leaderId, hasWorkingHours, sortBy = 'createdAt', sortOrder = 'desc' } = query;
      const skip = (page - 1) * limit;

      // Build where clause (single-tenant)
      let whereClause: any = {};

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
        whereClause.leaderId = userId;
      }

      // Additional filters
      if (search) {
        whereClause.name = { contains: search, mode: 'insensitive' };
      }
      if (departmentId) {
        whereClause.departmentId = departmentId;
      }
      if (leaderId) {
        whereClause.leaderId = leaderId;
      }
      if (hasWorkingHours !== undefined) {
        whereClause.workingHours = hasWorkingHours ? { some: {} } : { none: {} };
      }

      const [teams, total] = await Promise.all([
        prisma.team.findMany({
          where: whereClause,
          include: {
            department: { select: { id: true, name: true } },
            leader: { select: { id: true, firstName: true, lastName: true, email: true } },
            members: { 
              select: { id: true, firstName: true, lastName: true, email: true, role: true },
              take: 5 // Limit members in list view
            },
            workingHours: true,
            _count: { select: { members: true, tickets: true } }
          },
          skip,
          take: limit,
          orderBy: { [sortBy]: sortOrder }
        }),
        prisma.team.count({ where: whereClause })
      ]);

      return {
        teams: teams.map(team => this.formatTeamResponse(team)),
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error: any) {
      logger.error('Failed to get teams', { error: (error as Error).message, companyId, userId });
      throw new AppError('Failed to retrieve teams', 500);
    }
  }

  static async getTeamById(teamId: string, companyId: string, userId: string, userRole: UserRole): Promise<TeamResponse> {
    try {
      let whereClause: any = { id: teamId, companyId };

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
        whereClause.leaderId = userId;
      }

      const team = await prisma.team.findFirst({
        where: whereClause,
        include: {
          department: { select: { id: true, name: true } },
          leader: { select: { id: true, firstName: true, lastName: true, email: true } },
          members: { 
            select: { id: true, firstName: true, lastName: true, email: true, role: true }
          },
          workingHours: { orderBy: { dayOfWeek: 'asc' } },
          _count: { select: { members: true, tickets: true } }
        }
      });

      if (!team) {
        throw new AppError('Team not found or access denied', 404);
      }

      return this.formatTeamResponse(team);
    } catch (error: any) {
      logger.error('Failed to get team', { teamId, error: (error as Error).message, companyId, userId });
      throw error instanceof AppError ? error : new AppError('Failed to retrieve team', 500);
    }
  }

  static async updateTeam(
    teamId: string, 
    data: UpdateTeamRequest, 
    companyId: string, 
    userId: string,
    userRole: UserRole
  ): Promise<TeamResponse> {
    try {
      // Check if team exists and user has permission
      const existingTeam = await this.getTeamById(teamId, companyId, userId, userRole);

      // Check name uniqueness if name is being updated
      if (data.name && data.name !== existingTeam.name) {
        const nameExists = await prisma.team.findFirst({
          where: {
            name: { equals: data.name },
            departmentId: existingTeam.departmentId,
            id: { not: teamId }
          }
        });

        if (nameExists) {
          throw new AppError('Team name already exists in this department', 400);
        }
      }

      // Verify new leader if provided
      if (data.leaderId) {
        const leader = await prisma.user.findFirst({
          where: { 
            id: data.leaderId, 
            companyId,
            role: { in: ['TEAM_LEADER', 'DEPARTMENT_HEAD', 'CS_ADMIN'] }
          }
        });

        if (!leader) {
          throw new AppError('Team leader not found or invalid role', 404);
        }
      }

      // Update team
      const updatedTeam = await prisma.team.update({
        where: { id: teamId },
        data: {
          name: data.name,
          description: data.description,
          leaderId: data.leaderId,
          workingHours: data.workingHours ? {
            deleteMany: {},
            create: data.workingHours.map(wh => ({
              dayOfWeek: wh.dayOfWeek,
              startTime: wh.startTime,
              endTime: wh.endTime,
              isActive: wh.isActive ?? true
            }))
          } : undefined
        },
        include: {
          department: { select: { id: true, name: true } },
          leader: { select: { id: true, firstName: true, lastName: true, email: true } },
          members: { 
            select: { id: true, firstName: true, lastName: true, email: true, role: true }
          },
          workingHours: { orderBy: { dayOfWeek: 'asc' } },
          _count: { select: { members: true, tickets: true } }
        }
      });

      // Handle member updates
      if (data.memberIds !== undefined) {
        // Remove current members
        await prisma.user.updateMany({
          where: { teamId },
          data: { teamId: null }
        });

        // Add new members
        if (data.memberIds.length > 0) {
          const members = await prisma.user.findMany({
            where: { 
              id: { in: data.memberIds }, 
              companyId,
              teamId: null
            }
          });

          if (members.length !== data.memberIds.length) {
            throw new AppError('Some members not found or already assigned to another team', 400);
          }

          await prisma.user.updateMany({
            where: { id: { in: data.memberIds } },
            data: { teamId }
          });
        }
      }

      logger.info('Team updated successfully', { teamId, companyId, userId });
      return this.formatTeamResponse(updatedTeam);
    } catch (error: any) {
      logger.error('Failed to update team', { teamId, error: (error as Error).message, companyId, userId });
      throw error instanceof AppError ? error : new AppError('Failed to update team', 500);
    }
  }

  static async deleteTeam(teamId: string, companyId: string, userId: string, userRole: UserRole): Promise<void> {
    try {
      // Check if team exists and user has permission
      await this.getTeamById(teamId, companyId, userId, userRole);

      // Check if team has active tickets
      const activeTickets = await prisma.ticket.count({
        where: {
          teamId,
          status: { in: ['WAIT', 'PROCESS'] }
        }
      });

      if (activeTickets > 0) {
        throw new AppError('Cannot delete team with active tickets', 400);
      }

      // Remove team members
      await prisma.user.updateMany({
        where: { teamId },
        data: { teamId: null }
      });

      // Delete team (working hours will be cascade deleted)
      await prisma.team.delete({
        where: { id: teamId }
      });

      logger.info('Team deleted successfully', { teamId, companyId, userId });
    } catch (error: any) {
      logger.error('Failed to delete team', { teamId, error: (error as Error).message, companyId, userId });
      throw error instanceof AppError ? error : new AppError('Failed to delete team', 500);
    }
  }

  static async addMembers(teamId: string, memberIds: string[], companyId: string, userId: string): Promise<TeamResponse> {
    try {
      // Verify team exists
      const team = await prisma.team.findFirst({
        where: { id: teamId, companyId }
      });

      if (!team) {
        throw new AppError('Team not found', 404);
      }

      // Verify members exist and are available
      const members = await prisma.user.findMany({
        where: {
          id: { in: memberIds },
          companyId,
          teamId: null
        }
      });

      if (members.length !== memberIds.length) {
        throw new AppError('Some members not found or already assigned to another team', 400);
      }

      // Add members to team
      await prisma.user.updateMany({
        where: { id: { in: memberIds } },
        data: { teamId }
      });

      logger.info('Members added to team successfully', { teamId, memberIds, companyId, userId });
      return this.getTeamById(teamId, companyId, userId, 'CS_ADMIN');
    } catch (error: any) {
      logger.error('Failed to add members to team', { teamId, error: (error as Error).message, companyId, userId });
      throw error instanceof AppError ? error : new AppError('Failed to add members to team', 500);
    }
  }

  static async removeMembers(teamId: string, memberIds: string[], companyId: string, userId: string): Promise<TeamResponse> {
    try {
      // Verify team exists
      const team = await prisma.team.findFirst({
        where: { id: teamId, companyId }
      });

      if (!team) {
        throw new AppError('Team not found', 404);
      }

      // Remove members from team
      await prisma.user.updateMany({
        where: {
          id: { in: memberIds },
          teamId
        },
        data: { teamId: null }
      });

      logger.info('Members removed from team successfully', { teamId, memberIds, companyId, userId });
      return this.getTeamById(teamId, companyId, userId, 'CS_ADMIN');
    } catch (error: any) {
      logger.error('Failed to remove members from team', { teamId, error: (error as Error).message, companyId, userId });
      throw error instanceof AppError ? error : new AppError('Failed to remove members from team', 500);
    }
  }

  static async getTeamStats(companyId: string, userId: string, userRole: UserRole): Promise<TeamStatsResponse> {
    try {
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
        whereClause.leaderId = userId;
      }

      const [totalTeams, teamsWithWorkingHours, totalMembers] = await Promise.all([
        prisma.team.count({ where: whereClause }),
        prisma.team.count({
          where: {
            ...whereClause,
            workingHours: { some: {} }
          }
        }),
        prisma.user.count({
          where: {
            companyId,
            teamId: { not: null }
          }
        })
      ]);

      return {
        totalTeams,
        activeTeams: totalTeams, // All teams are considered active
        totalMembers,
        averageMembersPerTeam: totalTeams > 0 ? Math.round(totalMembers / totalTeams * 100) / 100 : 0,
        teamsWithWorkingHours
      };
    } catch (error: any) {
      logger.error('Failed to get team stats', { error: (error as Error).message, companyId, userId });
      throw new AppError('Failed to retrieve team statistics', 500);
    }
  }

  private static formatTeamResponse(team: any): TeamResponse {
    return {
      id: team.id,
      name: team.name,
      description: team.description,
      departmentId: team.departmentId,
      leaderId: team.leaderId,
      companyId: team.companyId,
      createdAt: team.createdAt,
      updatedAt: team.updatedAt,
      department: team.department,
      leader: team.leader,
      members: team.members,
      workingHours: team.workingHours,
      _count: team._count
    };
  }
}
