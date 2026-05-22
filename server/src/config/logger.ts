import * as fs from 'fs';
import * as path from 'path';
import winston from 'winston';

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Define custom colors for different log levels
const customColors = {
  error: 'red',
  warn: 'yellow',
  info: 'cyan',
  debug: 'magenta',
};

winston.addColors(customColors);

// Define log format with timestamps and colors
const logFormat = winston.format.combine(
  // Add timestamps in ISO format
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  // Add colorization for console output
  winston.format.colorize({
    all: process.env.NODE_ENV === 'development',
  }),
  // Custom printf format for readable logs
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    // Only include metadata if it exists and is not empty
    const metaString =
      Object.keys(meta).length > 0
        ? `\n${JSON.stringify(meta, null, 2)}`
        : '';

    return `[${timestamp}] ${level}: ${message}${metaString}`;
  })
);

// Define console format (colorized for development)
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaString =
      Object.keys(meta).length > 0
        ? `\n${JSON.stringify(meta, null, 2)}`
        : '';

    return `[${timestamp}] ${level}: ${message}${metaString}`;
  })
);

// Create the Winston logger instance
const logger = winston.createLogger({
  // Set default log level based on environment
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  // Add metadata to logs
  defaultMeta: { service: 'life-care-plus-api' },
  transports: [
    // Console transport for development/debugging
    new winston.transports.Console({
      format: consoleFormat,
      level: process.env.LOG_LEVEL || 'info',
    }),

    // Error log file - stores all errors and warnings
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      format: logFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),

    // Success log file - stores info level logs
    new winston.transports.File({
      filename: path.join(logsDir, 'success.log'),
      level: 'info',
      format: logFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),

    // Combined log file - stores all logs
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      format: logFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
  // Handle uncaught exceptions
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'exceptions.log'),
      format: logFormat,
    }),
  ],
  // Handle unhandled promise rejections
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'rejections.log'),
      format: logFormat,
    }),
  ],
});

// Add debug file transport only in development
if (process.env.NODE_ENV === 'development') {
  logger.add(
    new winston.transports.File({
      filename: path.join(logsDir, 'debug.log'),
      level: 'debug',
      format: logFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 3,
    })
  );
}

export default logger;
