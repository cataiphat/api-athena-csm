import { Response, NextFunction } from 'express';
import { PrismaClient, UserRole } from '@prisma/client';
import { AuthenticatedRequest, PaginationQuery, FilterQuery } from '@/shared/types';
import { NotFoundError, ValidationError, ForbiddenError } from '@/shared/utils/AppError';
import { logger } from '@/shared/utils/logger';

const prisma = new PrismaClient();

export class NotificationController {
  static async getNotifications(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ForbiddenError('Authentication required');
      }

      const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query as PaginationQuery;
      const { type, status } = req.query as FilterQuery;

      const skip = (page - 1) * limit;
      
      let whereClause: any = {
        userId: req.user.id, // Users can only see their own notifications
      };

      // Apply filters
      if (type) whereClause.type = type;
      if (status === 'read') whereClause.readAt = { not: null };
      if (status === 'unread') whereClause.readAt = null;

      const [notifications, total] = await Promise.all([
        prisma.notification.findMany({
          where: whereClause,
          skip,
          take: limit,
          orderBy: { [sortBy]: sortOrder },
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true, email: true },
            },
          },
        }),
        prisma.notification.count({ where: whereClause }),
      ]);

      const totalPages = Math.ceil(total / limit);

      res.status(200).json({
        success: true,
        message: 'Notifications retrieved successfully',
        data: notifications,
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

  static async getNotificationById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ForbiddenError('Authentication required');
      }

      const { id } = req.params;

      const notification = await prisma.notification.findUnique({
        where: { id },
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
        },
      });

      if (!notification) {
        throw new NotFoundError('Notification not found');
      }

      // Users can only access their own notifications
      if (notification.userId !== req.user.id) {
        throw new ForbiddenError('Access denied to this notification');
      }

      res.status(200).json({
        success: true,
        message: 'Notification retrieved successfully',
        data: notification,
      });
    } catch (error) {
      next(error);
    }
  }

  static async createNotification(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ForbiddenError('Authentication required');
      }

      // Only Super Admin and CS Admin can create notifications
      if (req.user.role !== UserRole.SUPER_ADMIN && req.user.role !== UserRole.CS_ADMIN) {
        throw new ForbiddenError('Insufficient permissions');
      }

      const {
        title,
        message,
        type,
        userId,
        userIds,
        metadata,
      } = req.body;

      // Create notifications for multiple users or single user
      const targetUserIds = userIds || (userId ? [userId] : []);

      if (targetUserIds.length === 0) {
        throw new ValidationError('At least one user ID must be provided');
      }

      // Validate users exist and belong to same company (for CS Admin)
      if (req.user.role === UserRole.CS_ADMIN) {
        const users = await prisma.user.findMany({
          where: {
            id: { in: targetUserIds },
            companyId: req.user.companyId,
          },
        });

        if (users.length !== targetUserIds.length) {
          throw new ValidationError('Some users not found or not in your company');
        }
      }

      const notifications = await prisma.notification.createMany({
        data: targetUserIds.map((targetUserId: string) => ({
          title,
          message,
          type,
          userId: targetUserId,
          metadata,
        })),
      });

      logger.info('Notifications created successfully', {
        count: notifications.count,
        type,
        createdBy: req.user.id,
      });

      res.status(201).json({
        success: true,
        message: `${notifications.count} notifications created successfully`,
        data: { count: notifications.count },
      });
    } catch (error) {
      next(error);
    }
  }

  static async markAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ForbiddenError('Authentication required');
      }

      const { id } = req.params;

      const notification = await prisma.notification.findUnique({
        where: { id },
      });

      if (!notification) {
        throw new NotFoundError('Notification not found');
      }

      // Users can only mark their own notifications as read
      if (notification.userId !== req.user.id) {
        throw new ForbiddenError('Access denied to this notification');
      }

      const updatedNotification = await prisma.notification.update({
        where: { id },
        data: { readAt: new Date() },
      });

      res.status(200).json({
        success: true,
        message: 'Notification marked as read',
        data: updatedNotification,
      });
    } catch (error) {
      next(error);
    }
  }

  static async markAllAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ForbiddenError('Authentication required');
      }

      const result = await prisma.notification.updateMany({
        where: {
          userId: req.user.id,
          readAt: null,
        },
        data: { readAt: new Date() },
      });

      res.status(200).json({
        success: true,
        message: `${result.count} notifications marked as read`,
        data: { count: result.count },
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteNotification(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ForbiddenError('Authentication required');
      }

      const { id } = req.params;

      const notification = await prisma.notification.findUnique({
        where: { id },
      });

      if (!notification) {
        throw new NotFoundError('Notification not found');
      }

      // Users can only delete their own notifications
      if (notification.userId !== req.user.id) {
        throw new ForbiddenError('Access denied to this notification');
      }

      await prisma.notification.delete({
        where: { id },
      });

      res.status(200).json({
        success: true,
        message: 'Notification deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  static async getUnreadCount(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ForbiddenError('Authentication required');
      }

      const count = await prisma.notification.count({
        where: {
          userId: req.user.id,
          readAt: null,
        },
      });

      res.status(200).json({
        success: true,
        message: 'Unread notification count retrieved successfully',
        data: { count },
      });
    } catch (error) {
      next(error);
    }
  }

  static async sendSLAViolationNotification(ticketId: string, violationType: 'FIRST_RESPONSE' | 'RESOLUTION') {
    try {
      const ticket = await prisma.ticket.findUnique({
        where: { id: ticketId },
        include: {
          assignee: true,
          department: {
            include: {
              leader: true,
              users: {
                where: {
                  role: { in: [UserRole.CS_ADMIN, UserRole.CS_OPERATION] },
                },
              },
            },
          },
          company: true,
        },
      });

      if (!ticket) {
        logger.error('Ticket not found for SLA violation notification', { ticketId });
        return;
      }

      const notificationTitle = `SLA Violation: ${violationType === 'FIRST_RESPONSE' ? 'First Response' : 'Resolution'} Time Exceeded`;
      const notificationMessage = `Ticket ${ticket.ticketNumber} has exceeded the ${violationType === 'FIRST_RESPONSE' ? 'first response' : 'resolution'} time limit.`;

      // Notify assignee, department leader, and CS admins
      const usersToNotify = [];
      
      if (ticket.assignee) {
        usersToNotify.push(ticket.assignee.id);
      }
      
      if (ticket.department?.leader) {
        usersToNotify.push(ticket.department.leader.id);
      }
      
      if (ticket.department?.users) {
        usersToNotify.push(...ticket.department.users.map(user => user.id));
      }

      // Remove duplicates
      const uniqueUserIds = [...new Set(usersToNotify)];

      if (uniqueUserIds.length > 0) {
        await prisma.notification.createMany({
          data: uniqueUserIds.map(userId => ({
            title: notificationTitle,
            message: notificationMessage,
            type: 'SLA_VIOLATION',
            userId,
            metadata: {
              ticketId,
              ticketNumber: ticket.ticketNumber,
              violationType,
            },
          })),
        });

        logger.info('SLA violation notifications sent', {
          ticketId,
          violationType,
          notificationCount: uniqueUserIds.length,
        });
      }
    } catch (error) {
      logger.error('Failed to send SLA violation notification', {
        ticketId,
        violationType,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
