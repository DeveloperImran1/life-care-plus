# Winston Logger - Quick Start Guide

## 🚀 Getting Started in 2 Minutes

### Step 1: Verify Installation ✅

```bash
cd server
npm ls winston morgan @types/morgan
# Should show versions installed
```

### Step 2: Check Log Files Are Created

```bash
npm run dev
# Wait 5-10 seconds, then press Ctrl+C
ls -la logs/
# You should see: combined.log, success.log, error.log
```

### Step 3: Start Using Logger

```typescript
// In any TypeScript file
import logger from "@/lib/logger";

// Use it
logger.info("Hello World", { userId: 123 });
logger.error("Something failed", new Error("OOPS"));
logger.warn("Resource limit", { usage: "90%" });
logger.debug("Debug info", { data: "value" });
```

## 📚 Common Usage Patterns

### User Operations

```typescript
import logger from "@/lib/logger";

// Login
logger.auth("login", "user@email.com", true);

// Signup
logger.auth("signup", "newuser@email.com", false, { reason: "Email exists" });

// Password reset
logger.auth("password-reset", "user@email.com", true);
```

### Database Operations

```typescript
import logger from "@/lib/logger";

try {
  const user = await db.user.findUnique({ where: { id: 123 } });
  logger.info("User found", { userId: 123 });
} catch (error) {
  logger.error("Database query failed", error as Error, { userId: 123 });
}
```

### API Errors

```typescript
import logger from "@/lib/logger";

app.get("/api/users/:id", (req, res) => {
  const userId = req.params.id;
  try {
    const user = findUser(userId);
    if (!user) {
      logger.apiError("/api/users/:id", 404, "User not found");
      return res.status(404).json({ error: "Not found" });
    }
    res.json(user);
  } catch (error) {
    logger.apiError("/api/users/:id", 500, "Internal error", error as Error);
    res.status(500).json({ error: "Internal error" });
  }
});
```

### Cron Jobs

```typescript
import logger from "@/lib/logger";

cron.schedule("0 0 * * *", async () => {
  const start = Date.now();
  try {
    logger.info("Daily cleanup started");
    await cleanupExpiredData();
    const duration = Date.now() - start;
    logger.cronJob("dailyCleanup", true, duration);
  } catch (error) {
    const duration = Date.now() - start;
    logger.cronJob("dailyCleanup", false, duration);
    logger.error("Cleanup failed", error as Error);
  }
});
```

### HTTP Logging

```typescript
import logger from "@/lib/logger";

// Already integrated in app.ts!
// All requests are automatically logged

// Manual HTTP logging
logger.http("POST", "/api/users", 201, 245, { userId: "user-123" });
```

### Server Events

```typescript
import logger from "@/lib/logger";

// Server startup (already in server.ts)
logger.serverStart(5000);

// Database connection (implement as needed)
logger.dbConnection("postgres", "connected");
logger.dbConnection("redis", "error");
```

## 🔍 Monitoring Commands

```bash
# Real-time logs
tail -f logs/combined.log

# Errors only
tail -f logs/error.log

# Success logs only
tail -f logs/success.log

# Search for user activity
grep "user@email.com" logs/combined.log

# Find slow requests (> 1 second)
grep -E '[0-9]{4,}ms' logs/combined.log

# Count errors by date
grep "2024-05-22" logs/error.log | wc -l

# Export logs to file
cat logs/combined.log > exported-logs.txt
```

## ⚙️ Configuration

### Set Log Level

```bash
# In .env file
LOG_LEVEL=debug    # Show debug logs
LOG_LEVEL=info     # Only info and above (default)
LOG_LEVEL=warn     # Only warnings and errors
LOG_LEVEL=error    # Only errors
```

### Development vs Production

```bash
# Development (colorized console, debug logs)
NODE_ENV=development npm run dev

# Production (plain text, only info/error)
NODE_ENV=production npm run build && npm start
```

## 📂 Log Files Explained

| File               | Purpose            | When to Check                  |
| ------------------ | ------------------ | ------------------------------ |
| **combined.log**   | All logs           | General debugging, audit trail |
| **success.log**    | Info level only    | Verify operations completed    |
| **error.log**      | Errors & warnings  | Troubleshoot issues            |
| **debug.log**      | Debug info (dev)   | Deep debugging in development  |
| **exceptions.log** | Uncaught errors    | Critical issues                |
| **rejections.log** | Promise rejections | Async errors                   |

## 🆘 Troubleshooting

### Logs not appearing?

```bash
# Check if logs directory exists
ls logs/

# Create if missing
mkdir logs
chmod 755 logs

# Check file permissions
ls -la logs/

# Verify LOG_LEVEL in .env
echo "LOG_LEVEL=$LOG_LEVEL"
```

### Console not colorized?

```bash
# Use development mode
NODE_ENV=development npm run dev

# Verify terminal supports colors
echo -e "\033[31mRed\033[0m"
```

### Log files too large?

```bash
# Check size
du -sh logs/

# Archive old logs
tar -czf logs-backup-$(date +%Y%m%d).tar.gz logs/
rm logs/*.log

# Or set stricter LOG_LEVEL
LOG_LEVEL=error npm run dev
```

## ✨ Pro Tips

### 1. Use Request IDs for Tracing

```typescript
const requestId = (req as any)._requestId;
logger.info("Processing request", { requestId });
```

### 2. Include Metadata

```typescript
// Good
logger.info("Payment processed", {
  orderId: 123,
  amount: 99.99,
  currency: "USD",
  userId: 456,
});

// Better than
logger.info("Payment processed for order 123");
```

### 3. Chain Error Details

```typescript
try {
  await riskyOperation();
} catch (error) {
  logger.error("Operation failed", error as Error, {
    context: "specific operation",
    timestamp: new Date().toISOString(),
    userId: 123,
  });
}
```

### 4. Monitor Performance

```typescript
const start = Date.now();
await heavyOperation();
const duration = Date.now() - start;
if (duration > 1000) {
  logger.warn("Slow operation", { operation: "heavyOp", duration });
}
```

### 5. Create Log Dashboards

```bash
# Monitor multiple logs simultaneously
# Terminal 1
tail -f logs/error.log

# Terminal 2
tail -f logs/combined.log

# Terminal 3
watch -n 1 'tail -5 logs/error.log'
```

## 📊 Log File Rotation

Winston automatically handles rotation:

- **Max Size**: 5MB per file
- **Versions Kept**: 5 (3 for debug.log)
- **Old files**: Renamed with index (combined.log.1, combined.log.2, etc.)

```bash
# View rotation
ls -la logs/
# combined.log
# combined.log.1
# combined.log.2
# error.log
# success.log
```

## 🎯 Integration Checklist

- ✅ Winston installed
- ✅ Logger configuration created
- ✅ Logger utility created
- ✅ Request logging middleware added
- ✅ Error handler updated
- ✅ Server startup logging added
- ✅ Cron jobs logging added
- ✅ Gitignore updated for logs/

## 📖 Full Documentation

- **Complete Setup**: See `LOGGING_SETUP.md`
- **Usage Examples**: See `src/lib/LOGGER_USAGE_GUIDE.ts`
- **Implementation Details**: See `IMPLEMENTATION_SUMMARY.md`

## 🚀 Ready to Deploy?

```bash
# 1. Verify logs are working
npm run dev
# Make a request: curl http://localhost:5000/api/v1/users
# Check logs: tail logs/combined.log

# 2. Set environment variables
# In production .env:
LOG_LEVEL=warn
NODE_ENV=production

# 3. Run production build
npm run build
npm start

# 4. Monitor logs
tail -f logs/error.log
```

## 💡 Best Practices Summary

✅ Always use logger instead of console.log
✅ Include metadata with every log
✅ Use appropriate log levels
✅ Log errors with full context
✅ Monitor log file sizes
✅ Review errors regularly
✅ Archive old logs monthly
✅ Never log sensitive data

---

**Questions?** Check `src/lib/LOGGER_USAGE_GUIDE.ts` for comprehensive examples.

**Ready to start logging!** 🎉
