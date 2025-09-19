import { Router } from 'express';
import { TeamController } from '../controllers/teamController';
import { authenticate } from '../../../shared/middleware/auth';
import { validateRequest } from '../../../shared/middleware/validation';
import { requirePermission, requireResourceAccess } from '@/shared/middleware/permission';
import {
  createTeamSchema,
  updateTeamSchema,
  teamQuerySchema,
  workingHoursSchema,
  addMembersSchema,
  removeMembersSchema
} from '../validators/teamValidators';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticate);

/**
 * @route   GET /api/v1/teams/stats
 * @desc    Get team statistics
 * @access  Private (CS_ADMIN, DEPARTMENT_HEAD, TEAM_LEADER)
 */
router.get('/stats', TeamController.getTeamStats);

/**
 * @route   GET /api/v1/teams
 * @desc    Get all teams with filtering and pagination
 * @access  Private (All authenticated users)
 */
router.get('/',
  requirePermission('TEAM', 'READ'),
  validateRequest({ query: teamQuerySchema }),
  TeamController.getTeams
);

/**
 * @route   POST /api/v1/teams
 * @desc    Create a new team
 * @access  Private (CS_ADMIN, DEPARTMENT_HEAD)
 */
router.post('/',
  validateRequest({ body: createTeamSchema }),
  TeamController.createTeam
);

/**
 * @route   GET /api/v1/teams/:id
 * @desc    Get team by ID
 * @access  Private (Role-based access)
 */
router.get('/:id', TeamController.getTeamById);

/**
 * @route   PUT /api/v1/teams/:id
 * @desc    Update team
 * @access  Private (CS_ADMIN, DEPARTMENT_HEAD, TEAM_LEADER)
 */
router.put('/:id',
  validateRequest({ body: updateTeamSchema }),
  TeamController.updateTeam
);

/**
 * @route   DELETE /api/v1/teams/:id
 * @desc    Delete team
 * @access  Private (CS_ADMIN, DEPARTMENT_HEAD)
 */
router.delete('/:id', TeamController.deleteTeam);

/**
 * @route   POST /api/v1/teams/:id/members
 * @desc    Add members to team
 * @access  Private (CS_ADMIN, DEPARTMENT_HEAD, TEAM_LEADER)
 */
router.post('/:id/members',
  validateRequest({ body: addMembersSchema }),
  TeamController.addMembers
);

/**
 * @route   DELETE /api/v1/teams/:id/members
 * @desc    Remove members from team
 * @access  Private (CS_ADMIN, DEPARTMENT_HEAD, TEAM_LEADER)
 */
router.delete('/:id/members',
  validateRequest({ body: removeMembersSchema }),
  TeamController.removeMembers
);

/**
 * @route   PUT /api/v1/teams/:id/working-hours
 * @desc    Update team working hours
 * @access  Private (CS_ADMIN, DEPARTMENT_HEAD, TEAM_LEADER)
 */
router.put('/:id/working-hours',
  validateRequest({ body: workingHoursSchema }),
  TeamController.updateWorkingHours
);

export default router;
