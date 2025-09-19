import { Request, Response, NextFunction } from 'express';
import { logger } from '@/shared/utils/logger';
import { AppError } from '@/shared/utils/AppError';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  logger.error('Error occurred:', {
    message: (error as Error).message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  // Handle known application errors
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      success: false,
      message: (error as Error).message,
      ...(error.details && { details: error.details }),
    });
    return;
  }

  // Handle Prisma errors
  if (error.name === 'PrismaClientKnownRequestError') {
    res.status(400).json({
      success: false,
      message: 'Database operation failed',
      details: (error as Error).message,
    });
    return;
  }

  // Handle validation errors
  if (error.name === 'ValidationError') {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      details: (error as Error).message,
    });
    return;
  }

  // Handle JWT errors
  if (error.name === 'JsonWebTokenError') {
    res.status(401).json({
      success: false,
      message: 'Invalid token',
    });
    return;
  }

  if (error.name === 'TokenExpiredError') {
    res.status(401).json({
      success: false,
      message: 'Token expired',
    });
    return;
  }

  // Handle multer errors (file upload)
  if (error.name === 'MulterError') {
    res.status(400).json({
      success: false,
      message: 'File upload error',
      details: (error as Error).message,
    });
    return;
  }

  // Default error response
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  });
};
