import logger from '../config/logger';

/**
 * Logger Utility Module
 * Provides consistent logging methods across the application
 * All logs are structured, timestamped, and follow Winston configuration
 */

interface LogMetadata {
  [key: string]: unknown;
}

class Logger {
  /**
   * Log info level messages
   * Used for general application information and successful operations
   * @param message - The message to log
   * @param meta - Optional metadata object
   */
  info(message: string, meta?: LogMetadata): void {
    logger.info(message, meta);
  }

  /**
   * Log warning level messages
   * Used for potentially problematic situations
   * @param message - The message to log
   * @param meta - Optional metadata object
   */
  warn(message: string, meta?: LogMetadata): void {
    logger.warn(message, meta);
  }

  /**
   * Log error level messages
   * Used for error events and exceptions
   * @param message - The message to log
   * @param error - Error object or additional context
   * @param meta - Optional metadata object
   */
  error(message: string, error?: Error | string | LogMetadata, meta?: LogMetadata): void {
    if (error instanceof Error) {
      logger.error(message, {
        error: {
          message: error.message,
          stack: error.stack,
          name: error.name,
        },
        ...meta,
      });
    } else if (typeof error === 'string') {
      logger.error(message, { error, ...meta });
    } else {
      logger.error(message, { ...error, ...meta });
    }
  }

  /**
   * Log debug level messages
   * Used for debugging information (development only)
   * @param message - The message to log
   * @param meta - Optional metadata object
   */
  debug(message: string, meta?: LogMetadata): void {
    logger.debug(message, meta);
  }

  /**
   * Log HTTP request with context
   * @param method - HTTP method (GET, POST, etc.)
   * @param url - Request URL
   * @param statusCode - Response status code
   * @param duration - Request duration in ms
   * @param meta - Optional metadata
   */
  http(
    method: string,
    url: string,
    statusCode: number,
    duration: number,
    meta?: LogMetadata,
  ): void {
    const level = statusCode >= 400 ? 'warn' : 'info';
    logger.log(level, `${method} ${url} ${statusCode} - ${duration}ms`, meta);
  }

  /**
   * Log server startup event
   * @param port - Server port
   */
  serverStart(port: number | string): void {
    logger.info(`🚀 Server is running on http://localhost:${port}`, { port });
  }

  /**
   * Log database connection event
   * @param dbName - Database name
   * @param status - Connection status
   */
  dbConnection(dbName: string, status: 'connected' | 'disconnected' | 'error'): void {
    const message =
      status === 'connected'
        ? `✅ Database "${dbName}" connected successfully`
        : status === 'disconnected'
          ? `⚠️ Database "${dbName}" disconnected`
          : `❌ Failed to connect to database "${dbName}"`;

    const level = status === 'error' ? 'error' : status === 'connected' ? 'info' : 'warn';
    logger.log(level, message, { database: dbName, status });
  }

  /**
   * Log authentication event
   * @param action - Auth action (login, logout, signup, etc.)
   * @param userId - User ID or identifier
   * @param success - Whether action was successful
   * @param meta - Optional metadata
   */
  auth(action: string, userId: string | number, success: boolean, meta?: LogMetadata): void {
    const level = success ? 'info' : 'warn';
    const message = `Authentication - ${action} (User: ${userId}) - ${success ? 'Success' : 'Failed'}`;
    logger.log(level, message, { action, userId, success, ...meta });
  }

  /**
   * Log API error with full context
   * @param endpoint - API endpoint
   * @param statusCode - HTTP status code
   * @param message - Error message
   * @param error - Error object
   * @param meta - Optional metadata
   */
  apiError(
    endpoint: string,
    statusCode: number,
    message: string,
    error?: Error | LogMetadata,
    meta?: LogMetadata,
  ): void {
    const errorData =
      error instanceof Error
        ? {
            errorMessage: error.message,
            errorStack: error.stack,
            errorName: error.name,
          }
        : error || {};

    logger.error(`API Error - ${endpoint} (${statusCode})`, {
      endpoint,
      statusCode,
      message,
      ...errorData,
      ...meta,
    });
  }

  /**
   * Log cron job execution
   * @param jobName - Job name
   * @param success - Whether job succeeded
   * @param duration - Execution duration in ms
   * @param meta - Optional metadata
   */
  cronJob(jobName: string, success: boolean, duration: number, meta?: LogMetadata): void {
    const level = success ? 'info' : 'error';
    const symbol = success ? '✅' : '❌';
    const message = `${symbol} Cron Job: ${jobName} (${duration}ms)`;

    logger.log(level, message, { jobName, success, duration, ...meta });
  }
}

// Export singleton instance
export default new Logger();
