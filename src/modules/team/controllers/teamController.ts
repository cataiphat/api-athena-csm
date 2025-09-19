import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../../shared/types';
import { AppError } from '../../../shared/utils/AppError';
import { logger } from '../../../shared/utils/logger';
import { TeamService } from '../services/teamService';

export class TeamController {
  static async getTeams(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { companyId, id: userId, role } = req.user!;
      const result = await TeamService.getTeams(companyId, userId, role, req.query);
      
      return res.json({
        success: true,
        message: 'Teams retrieved successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  static async createTeam(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { companyId, id: userId, role } = req.user!;
      const team = await TeamService.createTeam(req.body, companyId, userId, role);
      
      return res.status(201).json({
        success: true,
        message: 'Team created successfully',
        data: team
      });
    } catch (error) {
      next(error);
    }
  }

  static async getTeamById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { companyId, id: userId, role } = req.user!;
      const { id: teamId } = req.params;

      if (!teamId) {
        throw new AppError('Team ID is required', 400);
      }

      const team = await TeamService.getTeamById(teamId, companyId, userId, role);
      
      return res.json({
        success: true,
        message: 'Team retrieved successfully',
        data: team
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateTeam(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { companyId, id: userId, role } = req.user!;
      const { id: teamId } = req.params;

      if (!teamId) {
        throw new AppError('Team ID is required', 400);
      }

      const team = await TeamService.updateTeam(teamId, req.body, companyId, userId, role);
      
      return res.json({
        success: true,
        message: 'Team updated successfully',
        data: team
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteTeam(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { companyId, id: userId, role } = req.user!;
      const { id: teamId } = req.params;

      if (!teamId) {
        throw new AppError('Team ID is required', 400);
      }

      await TeamService.deleteTeam(teamId, companyId, userId, role);
      
      return res.json({
        success: true,
        message: 'Team deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  static async addMembers(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { companyId, id: userId, role } = req.user!;
      const { id: teamId } = req.params;
      const { userIds } = req.body;

      if (!teamId) {
        throw new AppError('Team ID is required', 400);
      }

      const result = await TeamService.addMembers(teamId, userIds, companyId, userId, role);
      
      return res.json({
        success: true,
        message: 'Members added successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  static async removeMembers(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { companyId, id: userId, role } = req.user!;
      const { id: teamId } = req.params;
      const { userIds } = req.body;

      if (!teamId) {
        throw new AppError('Team ID is required', 400);
      }

      const result = await TeamService.removeMembers(teamId, userIds, companyId, userId, role);
      
      return res.json({
        success: true,
        message: 'Members removed successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  static async getTeamStats(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { companyId, id: userId, role } = req.user!;
      const stats = await TeamService.getTeamStats(companyId, userId, role);
      
      return res.json({
        success: true,
        message: 'Team statistics retrieved successfully',
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateWorkingHours(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { companyId, id: userId, role } = req.user!;
      const { id: teamId } = req.params;
      const { workingHours } = req.body;

      if (!teamId) {
        throw new AppError('Team ID is required', 400);
      }

      const team = await TeamService.updateTeam(
        teamId,
        { workingHours }, 
        companyId, 
        userId, 
        role
      );
      
      return res.json({
        success: true,
        message: 'Working hours updated successfully',
        data: team
      });
    } catch (error) {
      next(error);
    }
  }
}
