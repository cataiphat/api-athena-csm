import { Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest, TokenResponse } from '@/shared/types';
import { JWTService } from '@/shared/utils/jwt';
import { UnauthorizedError, ValidationError } from '@/shared/utils/AppError';
import { logger } from '@/shared/utils/logger';

const prisma = new PrismaClient();

export class AuthController {
  static async login(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        throw new ValidationError('Email and password are required');
      }

      // Find user by email
      const user = await prisma.user.findUnique({
        where: { email },
        include: {
          company: {
            select: { id: true, name: true },
          },
          department: {
            select: { id: true, name: true },
          },
        },
      });

      if (!user) {
        throw new UnauthorizedError('Invalid credentials');
      }

      if (user.status !== 'ACTIVE') {
        throw new UnauthorizedError('Account is not active');
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedError('Invalid credentials');
      }

      // Generate tokens
      const tokenPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
        companyId: user.companyId,
      };

      const { accessToken, refreshToken, expiresIn } = JWTService.generateTokenPair(tokenPayload);

      // Update last login
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });

      const response: TokenResponse = {
        accessToken,
        refreshToken,
        expiresIn,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          companyId: user.companyId,
          departmentId: user.departmentId || undefined,
        },
      };

      logger.info('User logged in successfully', { userId: user.id, email: user.email });

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: response,
      });
    } catch (error) {
      next(error);
    }
  }

  static async refreshToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        throw new ValidationError('Refresh token is required');
      }

      // Verify refresh token
      const decoded = JWTService.verifyRefreshToken(refreshToken);

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

      // Generate new tokens
      const tokenPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
        companyId: user.companyId,
      };

      const tokens = JWTService.generateTokenPair(tokenPayload);

      const response: TokenResponse = {
        ...tokens,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          companyId: user.companyId,
          departmentId: user.departmentId || undefined,
        },
      };

      res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        data: response,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          avatar: true,
          role: true,
          status: true,
          companyId: true,
          departmentId: true,
          settings: true,
          lastLoginAt: true,
          createdAt: true,
          company: {
            select: { id: true, name: true },
          },
          department: {
            select: { id: true, name: true },
          },
        },
      });

      if (!user) {
        throw new UnauthorizedError('User not found');
      }

      res.status(200).json({
        success: true,
        message: 'Profile retrieved successfully',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  static async logout(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      // In a real application, you might want to blacklist the token
      // For now, we'll just return a success response
      
      logger.info('User logged out', { userId: req.user?.id });

      res.status(200).json({
        success: true,
        message: 'Logout successful',
      });
    } catch (error) {
      next(error);
    }
  }

  static async checkToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      res.status(200).json({
        success: true,
        message: 'Token is valid',
        data: {
          user: req.user,
          isValid: true,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
