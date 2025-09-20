import { Response, NextFunction } from 'express';
import { PrismaClient, UserRole, TicketStatus, TicketType, TicketPriority } from '@prisma/client';
import { AuthenticatedRequest, PaginationQuery, FilterQuery } from '@/shared/types';
import { NotFoundError, ValidationError, ForbiddenError } from '@/shared/utils/AppError';
import { logger } from '@/shared/utils/logger';
import { getFileInfo } from '@/shared/middleware/upload';

const prisma = new PrismaClient();

export class TicketController {
  static async getTickets(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ForbiddenError('Authentication required');
      }

      const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query as PaginationQuery;
      const { 
        search, 
        status, 
        type, 
        priority, 
        assigneeId, 
        departmentId,
        createdFrom,
        createdTo 
      } = req.query as FilterQuery;

      const skip = (page - 1) * limit;
      
      let whereClause: any = {};

      // Role-based access control
      if (req.user.role === UserRole.SUPER_ADMIN || req.user.role === UserRole.CS_ADMIN) {
        // Super admin and CS Admin can see all tickets
      } else if (req.user.role === UserRole.DEPARTMENT_HEAD) {
        // Department head can see tickets in their department
        if (req.user.departmentId) {
          whereClause.departmentId = req.user.departmentId;
        }
      } else {
        // CS Agent and CS Operation can see tickets in their department or assigned to them
        whereClause.OR = [
          { departmentId: req.user.departmentId },
          { assigneeId: req.user.id },
          { creatorId: req.user.id },
        ];
      }

      // Apply filters
      if (search) {
        whereClause.OR = [
          ...(whereClause.OR || []),
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { ticketNumber: { contains: search, mode: 'insensitive' } },
        ];
      }

      if (status) whereClause.status = status;
      if (type) whereClause.type = type;
      if (priority) whereClause.priority = priority;
      if (assigneeId) whereClause.assigneeId = assigneeId;
      if (departmentId) whereClause.departmentId = departmentId;

      // Date range filter
      if (createdFrom || createdTo) {
        whereClause.createdAt = {};
        if (createdFrom) whereClause.createdAt.gte = new Date(createdFrom);
        if (createdTo) whereClause.createdAt.lte = new Date(createdTo);
      }

      const [tickets, total] = await Promise.all([
        prisma.ticket.findMany({
          where: whereClause,
          skip,
          take: limit,
          orderBy: { [sortBy]: sortOrder },
          include: {
            customer: {
              select: { id: true, firstName: true, lastName: true, email: true, phone: true },
            },
            assignee: {
              select: { id: true, firstName: true, lastName: true, email: true },
            },
            creator: {
              select: { id: true, firstName: true, lastName: true, email: true },
            },
            department: {
              select: { id: true, name: true },
            },
            channel: {
              select: { id: true, name: true, type: true },
            },
            sla: {
              select: { id: true, name: true },
            },
            _count: {
              select: { comments: true, attachments: true },
            },
          },
        }),
        prisma.ticket.count({ where: whereClause }),
      ]);

      const totalPages = Math.ceil(total / limit);

      res.status(200).json({
        success: true,
        message: 'Tickets retrieved successfully',
        data: tickets,
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

  static async getTicketById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ForbiddenError('Authentication required');
      }

      const { id } = req.params;

      const ticket = await prisma.ticket.findUnique({
        where: { id },
        include: {
          customer: {
            select: { 
              id: true, 
              cif: true,
              firstName: true, 
              lastName: true, 
              email: true, 
              phone: true,
              address: true,
              idNumber: true,
            },
          },
          assignee: {
            select: { id: true, firstName: true, lastName: true, email: true, phone: true },
          },
          creator: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },

          department: {
            select: { id: true, name: true },
          },
          channel: {
            select: { id: true, name: true, type: true },
          },
          sla: {
            select: { id: true, name: true, firstResponseTimeHours: true, resolutionTimeHours: true },
          },
          comments: {
            include: {
              author: {
                select: { id: true, firstName: true, lastName: true, email: true },
              },
            },
            orderBy: { createdAt: 'asc' },
          },
          attachments: {
            orderBy: { createdAt: 'desc' },
          },
          slaTracking: {
            include: {
              sla: {
                select: { name: true },
              },
            },
          },
        },
      });

      if (!ticket) {
        throw new NotFoundError('Ticket not found');
      }

      // Single-tenant: simplified access control
      const hasAccess =
        req.user.role === UserRole.SUPER_ADMIN ||
        req.user.role === UserRole.CS_ADMIN ||
        ticket.departmentId === req.user.departmentId ||
        ticket.assigneeId === req.user.id ||
        ticket.creatorId === req.user.id;

      if (!hasAccess) {
        throw new ForbiddenError('Access denied to this ticket');
      }

      res.status(200).json({
        success: true,
        message: 'Ticket retrieved successfully',
        data: ticket,
      });
    } catch (error) {
      next(error);
    }
  }

  static async createTicket(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ForbiddenError('Authentication required');
      }

      const {
        title,
        description,
        type,
        priority = TicketPriority.MEDIUM,
        customerId,
        departmentId,
        channelId,
        slaId,
        tags,
        metadata,
      } = req.body;

      // Validate customer exists and belongs to same company
      const customer = await prisma.customer.findUnique({
        where: { id: customerId },
      });

      if (!customer) {
        throw new ValidationError('Customer not found');
      }

      // Single-tenant: no company validation needed

      // Validate department
      const department = await prisma.department.findUnique({
        where: { id: departmentId },
      });

      if (!department) {
        throw new ValidationError('Department not found');
      }

      // Generate ticket number
      const ticketCount = await prisma.ticket.count({
        where: { companyId: req.user.companyId },
      });
      const ticketNumber = `TKT${String(ticketCount + 1).padStart(6, '0')}`;

      // Create ticket
      const newTicket = await prisma.ticket.create({
        data: {
          ticketNumber,
          title,
          description,
          type,
          priority,
          status: TicketStatus.WAIT,
          source: 'MANUAL',
          customerId,
          creatorId: req.user.id,
          companyId: req.user.companyId,
          departmentId,
          channelId,
          slaId,
          tags: tags || [],
          metadata,
        },
        include: {
          customer: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
          creator: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
          department: {
            select: { id: true, name: true },
          },
        },
      });

      // Handle file attachments if any
      const files = req.files as Express.Multer.File[];
      if (files && files.length > 0) {
        const attachments = files.map(file => ({
          ...getFileInfo(file),
          ticketId: newTicket.id,
          uploadedBy: req.user!.id,
        }));

        await prisma.ticketAttachment.createMany({
          data: attachments,
        });
      }

      // Create SLA tracking if SLA is assigned
      if (slaId) {
        const sla = await prisma.sLA.findUnique({
          where: { id: slaId },
        });

        if (sla) {
          const now = new Date();
          const firstResponseDue = new Date(now.getTime() + sla.firstResponseTimeHours * 60 * 60 * 1000);
          const resolutionDue = new Date(now.getTime() + sla.resolutionTimeHours * 60 * 60 * 1000);

          await prisma.sLATracking.create({
            data: {
              ticketId: newTicket.id,
              slaId,
              firstResponseDue,
              resolutionDue,
            },
          });
        }
      }

      logger.info('Ticket created successfully', {
        ticketId: newTicket.id,
        ticketNumber: newTicket.ticketNumber,
        createdBy: req.user.id,
      });

      res.status(201).json({
        success: true,
        message: 'Ticket created successfully',
        data: newTicket,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateTicket(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ForbiddenError('Authentication required');
      }

      const { id } = req.params;
      const {
        title,
        description,
        type,
        priority,
        status,
        assigneeId,
        departmentId,
        slaId,
        tags,
        metadata,
      } = req.body;

      // Check if ticket exists and access permissions
      const existingTicket = await prisma.ticket.findUnique({
        where: { id },
      });

      if (!existingTicket) {
        throw new NotFoundError('Ticket not found');
      }

      // Check access permissions
      const hasAccess =
        req.user.role === UserRole.SUPER_ADMIN ||
        (req.user.role === UserRole.CS_ADMIN && existingTicket.companyId === req.user.companyId) ||
        (existingTicket.companyId === req.user.companyId && (
          existingTicket.departmentId === req.user.departmentId ||
          existingTicket.assigneeId === req.user.id ||
          existingTicket.creatorId === req.user.id
        ));

      if (!hasAccess) {
        throw new ForbiddenError('Access denied to this ticket');
      }

      // Prepare update data
      const updateData: any = {};
      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (type !== undefined) updateData.type = type;
      if (priority !== undefined) updateData.priority = priority;
      if (tags !== undefined) updateData.tags = tags;
      if (metadata !== undefined) updateData.metadata = metadata;

      // Only admins can update certain fields
      if (req.user.role === UserRole.SUPER_ADMIN || req.user.role === UserRole.CS_ADMIN) {
        if (status !== undefined) updateData.status = status;
        if (assigneeId !== undefined) updateData.assigneeId = assigneeId;
        if (departmentId !== undefined) updateData.departmentId = departmentId;
        if (slaId !== undefined) updateData.slaId = slaId;
      }

      // Update resolved/closed timestamps
      if (status === TicketStatus.DONE && !existingTicket.resolvedAt) {
        updateData.resolvedAt = new Date();
      }
      if (status === TicketStatus.CLOSED && !existingTicket.closedAt) {
        updateData.closedAt = new Date();
      }

      const updatedTicket = await prisma.ticket.update({
        where: { id },
        data: updateData,
        include: {
          customer: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
          assignee: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
          department: {
            select: { id: true, name: true },
          },
        },
      });

      logger.info('Ticket updated successfully', {
        ticketId: updatedTicket.id,
        updatedBy: req.user.id,
      });

      res.status(200).json({
        success: true,
        message: 'Ticket updated successfully',
        data: updatedTicket,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteTicket(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ForbiddenError('Authentication required');
      }

      // Only Super Admin and CS Admin can delete tickets
      if (req.user.role !== UserRole.SUPER_ADMIN && req.user.role !== UserRole.CS_ADMIN) {
        throw new ForbiddenError('Insufficient permissions');
      }

      const { id } = req.params;

      const existingTicket = await prisma.ticket.findUnique({
        where: { id },
      });

      if (!existingTicket) {
        throw new NotFoundError('Ticket not found');
      }

      // CS Admin can only delete tickets in their company
      if (req.user.role === UserRole.CS_ADMIN && existingTicket.companyId !== req.user.companyId) {
        throw new ForbiddenError('Cannot delete ticket from different company');
      }

      // Soft delete by setting status to CANCELLED
      await prisma.ticket.update({
        where: { id },
        data: { status: TicketStatus.CANCELLED },
      });

      logger.info('Ticket deleted successfully', {
        ticketId: id,
        deletedBy: req.user.id,
      });

      res.status(200).json({
        success: true,
        message: 'Ticket deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  static async addComment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ForbiddenError('Authentication required');
      }

      const { id } = req.params;
      if (!id) {
        throw new ValidationError('Ticket ID is required');
      }
      const { content, isInternal = false } = req.body;

      // Check if ticket exists and access permissions
      const ticket = await prisma.ticket.findUnique({
        where: { id },
      });

      if (!ticket) {
        throw new NotFoundError('Ticket not found');
      }

      const hasAccess =
        req.user.role === UserRole.SUPER_ADMIN ||
        (req.user.role === UserRole.CS_ADMIN && ticket.companyId === req.user.companyId) ||
        (ticket.companyId === req.user.companyId && (
          ticket.departmentId === req.user.departmentId ||
          ticket.assigneeId === req.user.id ||
          ticket.creatorId === req.user.id
        ));

      if (!hasAccess) {
        throw new ForbiddenError('Access denied to this ticket');
      }

      const comment = await prisma.ticketComment.create({
        data: {
          content,
          isInternal,
          ticketId: id,
          authorId: req.user.id,
        },
        include: {
          author: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
        },
      });

      // Update first response time if this is the first response
      if (!ticket.firstResponseAt && !isInternal) {
        await prisma.ticket.update({
          where: { id },
          data: { firstResponseAt: new Date() },
        });

        // Update SLA tracking
        await prisma.sLATracking.updateMany({
          where: { ticketId: id, firstResponseAt: null },
          data: { firstResponseAt: new Date() },
        });
      }

      res.status(201).json({
        success: true,
        message: 'Comment added successfully',
        data: comment,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getTicketStats(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ForbiddenError('Authentication required');
      }

      let whereClause: any = {};

      // Role-based access control
      if (req.user.role === UserRole.SUPER_ADMIN) {
        // Super admin can see all stats
      } else if (req.user.role === UserRole.CS_ADMIN) {
        whereClause.companyId = req.user.companyId;
      } else {
        whereClause.companyId = req.user.companyId;
        whereClause.OR = [
          { departmentId: req.user.departmentId },
          { assigneeId: req.user.id },
          { creatorId: req.user.id },
        ];
      }

      const [
        statusStats,
        typeStats,
        priorityStats,
        totalTickets,
        openTickets,
        overdueTickets,
      ] = await Promise.all([
        prisma.ticket.groupBy({
          by: ['status'],
          where: whereClause,
          _count: true,
        }),
        prisma.ticket.groupBy({
          by: ['type'],
          where: whereClause,
          _count: true,
        }),
        prisma.ticket.groupBy({
          by: ['priority'],
          where: whereClause,
          _count: true,
        }),
        prisma.ticket.count({ where: whereClause }),
        prisma.ticket.count({
          where: {
            ...whereClause,
            status: { in: [TicketStatus.WAIT, TicketStatus.PROCESS] },
          },
        }),
        prisma.sLATracking.count({
          where: {
            ticket: whereClause,
            OR: [
              { firstResponseBreach: true },
              { resolutionBreach: true },
            ],
          },
        }),
      ]);

      const stats = {
        total: totalTickets,
        open: openTickets,
        overdue: overdueTickets,
        byStatus: statusStats,
        byType: typeStats,
        byPriority: priorityStats,
      };

      res.status(200).json({
        success: true,
        message: 'Ticket statistics retrieved successfully',
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }
}
