import * as fs from 'fs';
import * as path from 'path';
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

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

// Security filter to hide passwords and sensitive tokens
const redactFormat = winston.format((info) => {
  const sensitiveKeys = ['password', 'token', 'accessToken', 'refreshToken'];

  const redact = (obj: any) => {
    Object.keys(obj).forEach((key) => {
      if (sensitiveKeys.includes(key)) {
        obj[key] = '***REDACTED***';
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        redact(obj[key]);
      }
    });
  };

  if (info.meta) {
    // deep clone to avoid mutating original object
    const clonedMeta = JSON.parse(JSON.stringify(info.meta));
    redact(clonedMeta);
    info.meta = clonedMeta;
  }
  return info;
});

// Define log format with timestamps and colors
const logFormat = winston.format.combine(
  redactFormat(),
  // Add timestamps in ISO format
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  // Add colorization for console output
  winston.format.colorize({
    all: process.env.NODE_ENV === 'development',
  }),
  // Custom printf format for readable logs
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    // Only include metadata if it exists and is not empty
    const metaString = Object.keys(meta).length > 0 ? `\n${JSON.stringify(meta, null, 2)}` : '';

    return `[${timestamp}] ${level}: ${message}${metaString}`;
  }),
);

// Define console format (colorized for development)
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaString = Object.keys(meta).length > 0 ? `\n${JSON.stringify(meta, null, 2)}` : '';

    return `[${timestamp}] ${level}: ${message}${metaString}`;
  }),
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
    new DailyRotateFile({
      filename: path.join(logsDir, 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      format: logFormat,
      maxSize: '5m',
      maxFiles: '14d',
    }),

    // Success log file - stores info level logs
    new DailyRotateFile({
      filename: path.join(logsDir, 'success-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'info',
      format: logFormat,
      maxSize: '5m',
      maxFiles: '14d',
    }),

    // Combined log file - stores all logs
    new DailyRotateFile({
      filename: path.join(logsDir, 'combined-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      format: logFormat,
      maxSize: '5m',
      maxFiles: '14d',
    }),
  ],
  // Handle uncaught exceptions
  exceptionHandlers: [
    new DailyRotateFile({
      filename: path.join(logsDir, 'exceptions-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      format: logFormat,
      maxSize: '5m',
      maxFiles: '14d',
    }),
  ],
  // Handle unhandled promise rejections
  rejectionHandlers: [
    new DailyRotateFile({
      filename: path.join(logsDir, 'rejections-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      format: logFormat,
      maxSize: '5m',
      maxFiles: '14d',
    }),
  ],
});

// Add debug file transport only in development
if (process.env.NODE_ENV === 'development') {
  logger.add(
    new DailyRotateFile({
      filename: path.join(logsDir, 'debug-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'debug',
      format: logFormat,
      maxSize: '5m',
      maxFiles: '3d',
    }),
  );
}

export default logger;
