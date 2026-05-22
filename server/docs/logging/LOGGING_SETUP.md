# Winston Logging System - Professional Setup Guide

## Overview

This backend now has a production-ready logging system using Winston that provides:

- ✅ **Structured Logging**: All logs are formatted consistently with timestamps and metadata
- ✅ **Multiple Log Files**: Separate files for errors, success, combined, and debug logs
- ✅ **Log Rotation**: Automatic log file rotation at 5MB with version history
- ✅ **Development Console**: Colorful console output in development mode
- ✅ **Morgan Integration**: HTTP request logging with Winston
- ✅ **Error Tracking**: Automatic handling of uncaught exceptions and rejections
- ✅ **Request Tracking**: Unique request IDs and performance monitoring
- ✅ **Type-Safe**: Full TypeScript support

## Directory Structure

```
server/
├── src/
│   ├── config/
│   │   └── logger.ts              # Winston logger configuration
│   ├── lib/
│   │   ├── logger.ts              # Reusable logger utility (SINGLETON)
│   │   └── LOGGER_USAGE_GUIDE.ts  # Usage examples and documentation
│   ├── app/
│   │   ├── middlewares/
│   │   │   ├── requestLogger.ts   # Morgan + Winston request logging
│   │   │   └── globalErrorHandler.ts (UPDATED)
│   │   └── ...
│   ├── app.ts                     # (UPDATED - logging middleware added)
│   └── server.ts                  # (UPDATED - logger integration)
└── logs/                          # Runtime logs directory
    ├── combined.log               # All logs
    ├── success.log                # Info level logs
    ├── error.log                  # Errors and warnings
    ├── debug.log                  # Debug logs (dev only)
    ├── exceptions.log             # Uncaught exceptions
    └── rejections.log             # Unhandled rejections
```

## Log Levels

| Level     | Priority | Use Case             | Output Files              |
| --------- | -------- | -------------------- | ------------------------- |
| **ERROR** | Highest  | Errors, exceptions   | error.log, combined.log   |
| **WARN**  | High     | Warnings, issues     | error.log, combined.log   |
| **INFO**  | Medium   | General info, events | success.log, combined.log |
| **DEBUG** | Low      | Debugging info       | debug.log, combined.log   |

## Usage

### Basic Logging

```typescript
import logger from "@/lib/logger";

// Info level
logger.info("Operation successful", { userId: 123 });

// Warning level
logger.warn("Resource limit approaching", { usage: "90%" });

// Error level
logger.error("Database connection failed", new Error("ECONNREFUSED"), {
  host: "localhost",
});

// Debug level (development only)
logger.debug("Processing request", { requestId: "req-123" });
```

### Specialized Methods

```typescript
// Server startup
logger.serverStart(5000);

// Database connection
logger.dbConnection("postgres", "connected");

// Authentication events
logger.auth("login", "user@example.com", true, { ip: "192.168.1.1" });

// API errors
logger.apiError("/api/v1/users/123", 404, "User not found");

// HTTP requests (automatically logged)
logger.http("GET", "/api/v1/users", 200, 125);

// Cron jobs
logger.cronJob("dailyCleanup", true, 250); // job name, success, duration (ms)
```

## Features

### 1. Request Logging Middleware

The `requestLogger` middleware uses Morgan with Winston to log all HTTP requests:

```typescript
// Located in: src/app/middlewares/requestLogger.ts
// Automatically logs:
// - HTTP method, URL, status code
// - Response time in milliseconds
// - User ID (if available)
// - Skips health checks and root path

Format: [timestamp] METHOD URL STATUS_CODE - DURATIONms | User: USER_ID
```

### 2. Request Tracking

The `requestTracker` middleware adds:

- Unique request ID for tracing
- Request start time for performance monitoring
- Automatic logging of slow requests (> 5 seconds)
- Error response logging

### 3. Error Handling

The global error handler now logs all errors with:

- Full error message and stack trace
- Request context (path, method, IP)
- Environment-specific sanitization (production removes stack traces)

### 4. Cron Job Logging

```typescript
const startTime = Date.now();
try {
  // Job execution
  logger.cronJob("jobName", true, Date.now() - startTime);
} catch (error) {
  logger.cronJob("jobName", false, Date.now() - startTime);
  logger.error("Job failed", error as Error);
}
```

### 5. Exception & Rejection Handling

Winston automatically captures:

- Uncaught exceptions → `exceptions.log`
- Unhandled promise rejections → `rejections.log`

## Configuration

### Environment Variables

```bash
# Log level: error, warn, info, debug
LOG_LEVEL=info

# Environment: development, production
NODE_ENV=development
```

### Logger Configuration

Located in: `src/config/logger.ts`

Key settings:

- **Log Level**: `info` (default), change via `LOG_LEVEL` env var
- **Max File Size**: 5MB
- **Max Versions**: 5 files (3 for debug logs)
- **Format**: `[YYYY-MM-DD HH:mm:ss] LEVEL: MESSAGE`
- **Console**: Colorized in development only

## Production Considerations

### Best Practices

✅ **DO:**

- Use appropriate log levels
- Include relevant metadata
- Log errors with full context
- Monitor log file sizes
- Clean up old log files periodically

❌ **DON'T:**

- Log sensitive data (passwords, tokens, PII)
- Use console.log/console.error
- Over-log (performance impact)
- Log at wrong levels

### Performance

- Logs are written asynchronously
- File rotation prevents unbounded growth
- Console output is colorized for development only
- Production logs are plain text for easier parsing

## Monitoring Logs

### Real-time Monitoring

```bash
# All logs
tail -f logs/combined.log

# Only errors
tail -f logs/error.log

# Only info (success)
tail -f logs/success.log

# Debug logs (development)
tail -f logs/debug.log
```

### Searching Logs

```bash
# Find specific events
grep "User registered" logs/combined.log

# Find errors on specific date
grep "2024-05-22" logs/error.log

# Count log entries by level
grep -c "ERROR" logs/error.log
grep -c "WARN" logs/error.log
grep -c "INFO" logs/success.log

# Find slow requests
grep -E '[0-9]{4,}ms' logs/combined.log

# Find specific user activity
grep "userId: 123" logs/combined.log
```

### Log Analysis

```bash
# View latest 50 entries
tail -50 logs/combined.log

# View from specific time
grep "2024-05-22 18:00" logs/combined.log

# Get error rate
wc -l logs/error.log

# Export logs
cat logs/combined.log | gzip > logs-backup.log.gz
```

## Implementation Details

### Files Created/Modified

1. **Created: `src/config/logger.ts`**
   - Winston logger instance configuration
   - Transport setup (console, file, exceptions, rejections)
   - Format configuration with timestamps
   - Log rotation settings

2. **Created: `src/lib/logger.ts`**
   - Singleton logger utility
   - Specialized logging methods
   - Type-safe metadata support
   - Business event logging helpers

3. **Created: `src/app/middlewares/requestLogger.ts`**
   - Morgan middleware configuration
   - Custom tokens for detailed logging
   - Request tracker with performance monitoring
   - Error response logging

4. **Modified: `src/app.ts`**
   - Added request logging middleware
   - Added request tracking middleware
   - Updated cron job logging
   - Replaced console.log

5. **Modified: `src/server.ts`**
   - Replaced console.log with logger
   - Updated error handling with logger
   - Added graceful shutdown logging

6. **Modified: `src/app/middlewares/globalErrorHandler.ts`**
   - Integrated logger for error tracking
   - Structured error logging with context

7. **Updated: `.gitignore`**
   - Added logs/ folder
   - Added \*.log pattern

### Dependencies Added

```json
{
  "dependencies": {
    "winston": "^3.x.x",
    "morgan": "^1.x.x"
  },
  "devDependencies": {
    "@types/morgan": "^1.x.x"
  }
}
```

## Troubleshooting

### Issue: Logs not being written to files

**Solution:**

1. Check logs folder permissions: `ls -la logs/`
2. Ensure write permissions: `chmod 755 logs/`
3. Verify disk space: `df -h`
4. Check file handles: `ulimit -n`

### Issue: Console output not colorized

**Solution:**

1. Verify `NODE_ENV=development`
2. Check terminal supports colors
3. Use `npm run dev` instead of `node`

### Issue: High memory usage

**Solution:**

1. Reduce log level: `LOG_LEVEL=warn`
2. Reduce log file retention
3. Implement log cleanup cron job
4. Archive old logs to compressed files

### Issue: Log files growing too large

**Solution:**

1. Change `LOG_LEVEL` to `warn` or `error`
2. Reduce max file size in `logger.ts`
3. Implement cleanup script:
   ```bash
   find logs/ -name "*.log" -mtime +30 -delete
   ```

## Complete Example Flow

```typescript
// 1. Server startup
// logs: "[2024-05-22 18:35:48] info: 🚀 Server is running on http://localhost:5000"

// 2. User registration request
// logs: "[2024-05-22 18:35:50] info: POST /api/v1/auth/register 200 - 245ms | User: anonymous"

// 3. Error occurs
// logs: "[2024-05-22 18:35:51] error: API Error Handler"
//       "error.log": {"error": {"message": "...", "stack": "..."}, "path": "...", "statusCode": 400}

// 4. Cron job runs
// logs: "[2024-05-22 18:40:00] info: 🔄 Running unpaid appointment cleanup"
//       "[2024-05-22 18:40:00] info: ✅ Cron Job: cancelUnpaidAppointments (1250ms)"
```

## Migration Guide

If you had console.log calls, replace them:

```typescript
// Before
console.log("User logged in:", userId);
console.error("Database error:", error);
console.warn("Low memory");

// After
logger.info("User logged in", { userId });
logger.error("Database error", error);
logger.warn("Low memory");
```

## Support

For detailed usage examples, see: `src/lib/LOGGER_USAGE_GUIDE.ts`

This file contains:

- Complete code examples
- Practical implementation patterns
- Best practices
- Environment configuration
- Monitoring commands
- Troubleshooting tips

---

**Production Ready ✅** | **Type-Safe ✅** | **Scalable ✅** | **Configurable ✅**
