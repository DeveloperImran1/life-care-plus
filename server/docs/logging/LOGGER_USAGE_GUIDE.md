# Winston Logger Usage Guide

This file documents how to use the professional logging system throughout the application.

Always use the logger module instead of:

- `console.log`
- `console.error`
- `console.warn`

---

# Import Logger

```ts
import logger from './logger';
```

---

# Basic Logging Examples

## Info Level

Used for general application information.

```ts
logger.info('User logged in successfully', {
  userId: 123,
  email: 'user@example.com',
});
```

---

## Warning Level

Used for potential issues.

```ts
logger.warn('High memory usage detected', {
  memoryUsage: '80%',
});
```

---

## Error Level

Used for errors and exceptions.

```ts
logger.error('Database connection failed', new Error('ECONNREFUSED'), {
  database: 'postgres',
  host: 'localhost',
});
```

---

## Debug Level

Used for detailed debugging information in development.

```ts
logger.debug('Processing payment request', {
  orderId: 456,
  amount: 99.99,
});
```

---

# Specialized Logging Methods

## Server Startup

```ts
logger.serverStart(5000);
```

---

## Database Connection

```ts
logger.dbConnection('postgres', 'connected');

logger.dbConnection('mongodb', 'error');
```

---

## Authentication Events

```ts
logger.auth('login', 'user@example.com', true, {
  ip: '192.168.1.1',
});

logger.auth('signup', 'newuser@example.com', false, {
  reason: 'Email already exists',
});
```

---

## API Errors

```ts
logger.apiError('/api/v1/users/123', 404, 'User not found', {
  userId: 123,
  timestamp: new Date().toISOString(),
});
```

---

## HTTP Requests

Automatically logged using Morgan middleware.

```ts
logger.http('GET', '/api/v1/users', 200, 125, {
  userId: 'user123',
});
```

---

## Cron Jobs

```ts
const startTime = Date.now();

try {
  logger.cronJob('emailNotifications', true, Date.now() - startTime);
} catch (error) {
  logger.cronJob('emailNotifications', false, Date.now() - startTime);

  logger.error('Cron job failed', error as Error);
}
```

---

# Log Levels And Usage

| Level | Priority | Use Case                       | File        |
| ----- | -------- | ------------------------------ | ----------- |
| ERROR | Highest  | Critical errors and crashes    | error.log   |
| WARN  | High     | Warnings and suspicious issues | error.log   |
| INFO  | Medium   | General application flow       | success.log |
| DEBUG | Low      | Detailed debugging information | debug.log   |

---

# ERROR Level

Used for:

- Database connection failures
- Authentication failures
- Unhandled exceptions
- API crashes
- Server crashes

Example:

```ts
logger.error('Database connection failed', error);
```

Saved in:

```txt
logs/error.log
```

---

# WARN Level

Used for:

- High response times
- Deprecated APIs
- Resource exhaustion
- Suspicious activities

Example:

```ts
logger.warn('High memory usage detected');
```

Saved in:

```txt
logs/error.log
```

---

# INFO Level

Used for:

- User login
- User registration
- Successful API calls
- Database connections
- Server startup

Example:

```ts
logger.info('User registered successfully');
```

Saved in:

```txt
logs/success.log
```

---

# DEBUG Level

Used only in development.

Example:

```ts
logger.debug('Processing payment request');
```

Saved in:

```txt
logs/debug.log
```

---

# Log Files Structure

```txt
logs/
├── combined.log
├── success.log
├── error.log
├── debug.log
├── exceptions.log
└── rejections.log
```

---

# Log Files Explanation

## combined.log

Contains all logs.

---

## success.log

Contains only info level logs.

---

## error.log

Contains warnings and errors.

---

## debug.log

Contains debug logs in development mode only.

---

## exceptions.log

Contains uncaught exceptions.

---

## rejections.log

Contains unhandled promise rejections.

---

# Log Rotation

Each log file:

- Rotates automatically after 5MB
- Keeps last 5 versions
- Debug logs keep 3 versions
- Includes timestamps
- Includes metadata
- Supports colorful console output

---

# Practical Examples

# Example 1: User Registration

```ts
export async function registerUser(email: string, password: string) {
  try {
    logger.info('User registration initiated', {
      email,
    });

    if (!isValidEmail(email)) {
      logger.warn('Invalid email format provided', {
        email,
      });

      throw new Error('Invalid email format');
    }

    const existingUser = await findUserByEmail(email);

    if (existingUser) {
      logger.auth('signup', email, false, {
        reason: 'Email already exists',
      });

      throw new Error('Email already exists');
    }

    const user = await createUser(email, password);

    logger.auth('signup', email, true, {
      userId: user.id,
    });

    logger.info('User registered successfully', {
      userId: user.id,
      email,
    });

    return user;
  } catch (error) {
    logger.error('User registration failed', error as Error, { email });

    throw error;
  }
}
```

---

# Example 2: API Endpoint With Error Handling

```ts
export async function getUserById(userId: string) {
  const startTime = Date.now();

  try {
    logger.debug('Fetching user by ID', {
      userId,
    });

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

    logger.info('User retrieved successfully', {
      userId,
      duration,
    });

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
```

---

# Example 3: Database Operation

```ts
export async function updateUserProfile(userId: string, data: any) {
  try {
    logger.info('Updating user profile', {
      userId,
    });

    const updatedUser = await updateUser(userId, data);

    logger.info('User profile updated successfully', {
      userId,
    });

    return updatedUser;
  } catch (error) {
    if (error instanceof PrismaError) {
      logger.error('Database error during profile update', error as Error, {
        userId,
        code: error.code,
      });
    } else {
      logger.error('Error updating user profile', error as Error, {
        userId,
      });
    }

    throw error;
  }
}
```

---

# Example 4: Cron Job Execution

```ts
export async function runDailyCleanup() {
  const startTime = Date.now();

  try {
    logger.info('Starting daily cleanup job');

    await cleanupExpiredSessions();

    await archiveOldLogs();

    await optimizeDatabase();

    const duration = Date.now() - startTime;

    logger.cronJob('dailyCleanup', true, duration);

    logger.info('Daily cleanup job completed', {
      duration,
    });
  } catch (error) {
    const duration = Date.now() - startTime;

    logger.cronJob('dailyCleanup', false, duration);

    logger.error('Daily cleanup job failed', error as Error, {
      duration,
    });

    throw error;
  }
}
```

---

# Best Practices

## ✅ DO

- Always use logger instead of console.log
- Include metadata/context in logs
- Use correct log levels
- Log errors with stack traces
- Log important business events
- Include user IDs
- Include request IDs
- Monitor slow requests

---

## ❌ DON'T

- Don't log passwords or tokens
- Don't log unnecessary PII
- Don't over-log
- Don't use wrong log levels
- Don't use console.log in production
- Don't forget logger cleanup on shutdown

---

# Environment Variables

## LOG_LEVEL

Controls minimum log level.

Available values:

```env
LOG_LEVEL=error
LOG_LEVEL=warn
LOG_LEVEL=info
LOG_LEVEL=debug
```

Default:

```env
LOG_LEVEL=info
```

---

## NODE_ENV

Controls environment behavior.

Development:

```env
NODE_ENV=development
```

Production:

```env
NODE_ENV=production
```

Development mode:

- colorful logs
- debug logs enabled

Production mode:

- clean output
- debug logs disabled

---

# Monitoring And Analysis

# Monitor All Logs

```bash
tail -f logs/combined.log
```

---

# Monitor Errors

```bash
tail -f logs/error.log
```

---

# Search Specific Logs

```bash
grep "User registration" logs/combined.log
```

---

# Search Errors By Date

```bash
grep "ERROR" logs/error.log | grep "2024-05-22"
```

---

# Analyze Performance

```bash
grep "duration" logs/combined.log | awk '{print $NF}'
```

---

# Count Logs By Level

```bash
grep -c "ERROR" logs/error.log

grep -c "WARN" logs/error.log
```

---

# Final Notes

- This logging system is production-ready
- Winston automatically handles log rotation
- Morgan automatically logs HTTP requests
- Structured logging helps debugging
- Always prefer logger over console methods
- Logs help monitor performance and errors
- Logger improves maintainability and scalability
- This file is documentation only

```

```
