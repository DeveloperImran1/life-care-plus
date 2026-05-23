import { NextFunction, Request, Response } from 'express';
import morgan from 'morgan';
import logger from '../../lib/logger';

/**
 * Morgan Token Configuration
 * Custom tokens for more detailed request logging
 */

// Add custom morgan tokens for better logging
morgan.token('user-id', (req: Request) => {
  return (req as any).user?.id || 'anonymous';
});

morgan.token('response-time-ms', (req: Request, res: Response) => {
  if (!res.headersSent) return '';
  const value = res.getHeader('X-Response-Time');
  return value ? `${value}ms` : `${Date.now() - (req as any)._startTime}ms`;
});

/**
 * Request Logging Middleware
 * Combines Morgan stream with Winston logger for structured HTTP request logging
 */

// Custom morgan format for detailed request logging
const morganFormat =
  ':method :url :status :res[content-length] - :response-time-ms | User: :user-id | IP: :remote-addr';

// Create morgan stream to pipe output to Winston
const stream = {
  write: (message: string) => {
    logger.info(message.trim());
  },
};

// Export Morgan middleware configured with Winston
export const requestLogger = morgan(morganFormat, {
  stream,
  skip: (req: Request, res: Response) => {
    // Skip logging health check endpoints to reduce log noise
    if (req.path === '/' || req.path === '/health') {
      return true;
    }
    return false;
  },
});

/**
 * Request Tracking Middleware
 * Adds start time and unique request ID to request object
 * Can be used for performance monitoring and request tracing
 */
export const requestTracker = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Store request start time for duration calculation
  (req as any)._startTime = Date.now();

  // Generate unique request ID for tracing
  (req as any)._requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Log request initiation (optional - only log critical requests)
  if (req.method !== 'GET') {
    logger.debug(`📨 Incoming ${req.method} request`, {
      method: req.method,
      path: req.path,
      requestId: (req as any)._requestId,
    });
  }

  // Calculate response time in milliseconds
  const originalSend = res.send;
  res.send = function (data: any) {
    const duration = Date.now() - (req as any)._startTime;
    const statusCode = res.statusCode;

    // Log errors and slow requests
    if (statusCode >= 400 || duration > 5000) {
      const level = statusCode >= 500 ? 'error' : 'warn';
      logger[level as 'error' | 'warn'](
        `${req.method} ${req.path} ${statusCode} - ${duration}ms`,
        {
          method: req.method,
          path: req.path,
          statusCode,
          duration,
          requestId: (req as any)._requestId,
        }
      );
    }

    // Store response time header for morgan to use
    res.setHeader('X-Response-Time', duration);

    return originalSend.call(this, data);
  };

  next();
};

export default requestLogger;
