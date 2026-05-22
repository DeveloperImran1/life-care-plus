/**
 * Winston Logger Usage Guide
 *
 * This file documents how to use the professional logging system
 * throughout the application. Always use the logger module instead of
 * console.log, console.error, etc.
 */

import logger from '../lib/logger';

/**
 * BASIC LOGGING EXAMPLES
 */

// Info level - for general application information
logger.info('User logged in successfully', { userId: 123, email: 'user@example.com' });

// Warning level - for potential issues
logger.warn('High memory usage detected', { memoryUsage: '80%' });

// Error level - for errors and exceptions
logger.error('Database connection failed', new Error('ECONNREFUSED'), {
  database: 'postgres',
  host: 'localhost',
});

// Debug level - for detailed debugging (development only)
logger.debug('Processing payment request', { orderId: 456, amount: 99.99 });

/**
 * SPECIALIZED LOGGING METHODS
 */

// Server startup
logger.serverStart(5000);

// Database connection
logger.dbConnection('postgres', 'connected');
logger.dbConnection('mongodb', 'error');

// Authentication events
logger.auth('login', 'user@example.com', true, { ip: '192.168.1.1' });
logger.auth('signup', 'newuser@example.com', false, { reason: 'Email already exists' });

// API errors
logger.apiError('/api/v1/users/123', 404, 'User not found', {
  userId: 123,
  timestamp: new Date().toISOString(),
});

// HTTP requests (automatically logged via Morgan)
logger.http('GET', '/api/v1/users', 200, 125, { userId: 'user123' });

// Cron jobs
const startTime = Date.now();
try {
  // Job execution
  logger.cronJob('emailNotifications', true, Date.now() - startTime);
} catch (error) {
  logger.cronJob('emailNotifications', false, Date.now() - startTime);
  logger.error('Cron job failed', error as Error);
}

/**
 * LOG LEVELS AND WHEN TO USE THEM
 */

/*
ERROR (Level 0) - Highest Priority
  - Application errors that need immediate attention
  - Database connection failures
  - Authentication failures
  - Unhandled exceptions
  - File: error.log

WARN (Level 1)
  - Potential issues that should be reviewed
  - Deprecated API usage
  - Resource exhaustion warnings
  - High response times
  - File: error.log

INFO (Level 2) - Default
  - General application flow information
  - Server startup/shutdown
  - Database connections
  - Successful operations
  - Important business events
  - File: success.log

DEBUG (Level 3) - Development Only
  - Detailed debugging information
  - Variable states at key points
  - Function entry/exit traces
  - Only available in development mode
  - File: debug.log
*/

/**
 * LOG FILE LOCATIONS AND CONTENTS
 */

/*
logs/
├── combined.log       - All logs of all levels
├── success.log        - Info level logs only
├── error.log          - Error and warn level logs
├── debug.log          - Debug level logs (development only)
├── exceptions.log     - Uncaught exceptions
└── rejections.log     - Unhandled promise rejections

Each log file:
- Rotates when it reaches 5MB
- Keeps last 5 versions (or 3 for debug)
- Includes timestamp, level, message, and metadata
- Supports colorized output in console
*/

/**
 * PRACTICAL EXAMPLES FOR DIFFERENT SCENARIOS
 */

// Example 1: User Registration
export async function registerUser(email: string, password: string) {
  try {
    logger.info('User registration initiated', { email });

    // Validate email
    if (!isValidEmail(email)) {
      logger.warn('Invalid email format provided', { email });
      throw new Error('Invalid email format');
    }

    // Check if user exists
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      logger.auth('signup', email, false, { reason: 'Email already exists' });
      throw new Error('Email already exists');
    }

    // Create user
    const user = await createUser(email, password);
    logger.auth('signup', email, true, { userId: user.id });
    logger.info('User registered successfully', { userId: user.id, email });

    return user;
  } catch (error) {
    logger.error('User registration failed', error as Error, { email });
    throw error;
  }
}

// Example 2: API Endpoint with Error Handling
export async function getUserById(userId: string) {
  const startTime = Date.now();

  try {
    logger.debug('Fetching user by ID', { userId });

    const user = await findUserById(userId);

    if (!user) {
      const duration = Date.now() - startTime;
      logger.apiError(`/api/v1/users/${userId}`, 404, 'User not found', {
        userId,
        duration,
      });
      throw new Error('User not found');
    }

    const duration = Date.now() - startTime;
    logger.info('User retrieved successfully', { userId, duration });

    return user;
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error('Error retrieving user', error as Error, {
      userId,
      duration,
    });
    throw error;
  }
}

// Example 3: Database Operation
export async function updateUserProfile(userId: string, data: any) {
  try {
    logger.info('Updating user profile', { userId });

    const updatedUser = await updateUser(userId, data);

    logger.info('User profile updated successfully', { userId });
    return updatedUser;
  } catch (error) {
    if (error instanceof PrismaError) {
      logger.error('Database error during profile update', error as Error, {
        userId,
        code: error.code,
      });
    } else {
      logger.error('Error updating user profile', error as Error, { userId });
    }
    throw error;
  }
}

// Example 4: Cron Job Execution
export async function runDailyCleanup() {
  const startTime = Date.now();

  try {
    logger.info('Starting daily cleanup job');

    // Perform cleanup
    await cleanupExpiredSessions();
    await archiveOldLogs();
    await optimizeDatabase();

    const duration = Date.now() - startTime;
    logger.cronJob('dailyCleanup', true, duration);
    logger.info('Daily cleanup job completed', { duration });
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.cronJob('dailyCleanup', false, duration);
    logger.error('Daily cleanup job failed', error as Error, { duration });
    throw error;
  }
}

/**
 * BEST PRACTICES
 */

/*
✓ DO:
  - Always use logger instead of console.log
  - Include relevant metadata/context in logs
  - Use appropriate log levels
  - Log errors with stack traces
  - Log important business events
  - Include user IDs for user-related operations
  - Include request IDs for request tracing
  - Log slow operations (> 5 seconds)

✗ DON'T:
  - Don't log sensitive information (passwords, tokens, SSN, etc.)
  - Don't create inconsistent log entries
  - Don't log PII unnecessarily
  - Don't use console.log, console.error, etc.
  - Don't over-log (causes performance issues)
  - Don't log at wrong levels (info for errors, etc.)
  - Don't forget to close logger on shutdown
*/

/**
 * ENVIRONMENT VARIABLES
 */

/*
LOG_LEVEL - Set the minimum log level to capture
  - Available values: error, warn, info, debug
  - Default: info
  - Example: LOG_LEVEL=debug npm run dev

NODE_ENV - Application environment
  - development: Includes debug logs, colorized console
  - production: Only error/warn/info, no debug logs
  - Default: development
  - Example: NODE_ENV=production npm start
*/

/**
 * MONITORING AND ANALYSIS
 */

/*
To monitor logs in real-time:
  tail -f logs/combined.log

To monitor only errors:
  tail -f logs/error.log

To search for specific events:
  grep "User registration" logs/combined.log
  grep "ERROR" logs/error.log | grep "2024-05-22"

To analyze performance:
  grep "duration" logs/combined.log | awk '{print $NF}'

To count logs by level:
  grep -c "ERROR" logs/error.log
  grep -c "WARN" logs/error.log
*/

// This file is for documentation only and should not be imported in actual code
export { };
