# Winston Logging System - Architecture

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      Express Application                         │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Request Handler                                         │   │
│  │  ├─ HTTP Requests                                        │   │
│  │  ├─ Route Handlers                                       │   │
│  │  └─ Controllers                                          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                           ▲                                       │
│                           │                                       │
│  ┌────────────────────────┴──────────────────────────────────┐   │
│  │  Middleware Pipeline                                      │   │
│  │  ┌──────────────────────────────────────────────────────┐ │   │
│  │  │ 1. requestTracker                                    │ │   │
│  │  │    └─ Start time, Request ID                        │ │   │
│  │  ├──────────────────────────────────────────────────────┤ │   │
│  │  │ 2. requestLogger (Morgan)                           │ │   │
│  │  │    └─ HTTP method, URL, Status, Duration           │ │   │
│  │  ├──────────────────────────────────────────────────────┤ │   │
│  │  │ 3. Route Handlers                                   │ │   │
│  │  └──────────────────────────────────────────────────────┘ │   │
│  │                                                             │   │
│  │  Error Handler (globalErrorHandler)                        │   │
│  │  └─ Logs errors with full context                         │   │
│  └────────────────────────────────────────────────────────────┘   │
│                           │                                       │
│                           ▼                                       │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  Logger Utility (Singleton)                               │ │
│  │  src/lib/logger.ts                                        │ │
│  │                                                            │ │
│  │  Methods:                                                 │ │
│  │  • info()          → Info events                          │ │
│  │  • warn()          → Warning events                       │ │
│  │  • error()         → Error events                         │ │
│  │  • debug()         → Debug info                           │ │
│  │  • serverStart()   → Server startup                       │ │
│  │  • dbConnection()  → DB events                            │ │
│  │  • auth()          → Auth events                          │ │
│  │  • apiError()      → API errors                           │ │
│  │  • cronJob()       → Cron job logs                        │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                           │
                           ▼
    ┌──────────────────────────────────────────────────────┐
    │   Winston Logger Instance                            │
    │   src/config/logger.ts                               │
    │                                                       │
    │   Level: error, warn, info, debug                    │
    │   Format: [YYYY-MM-DD HH:mm:ss] LEVEL: MESSAGE      │
    │   Metadata: service, context, stack traces           │
    └──────────────────────────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
    ┌────────┐         ┌────────┐        ┌─────────┐
    │ Console│         │  File  │        │Handlers │
    │Transport          Transports      (Exception)
    │                  │                │
    │ (Development)    ├─ combined.log  │
    │ Colorized        ├─ success.log   │
    │ Real-time        ├─ error.log     │
    │                  ├─ debug.log     │
    │                  ├─ exceptions.log│
    │                  └─ rejections.log│
    └────────┘         └────────┘        └─────────┘
```

## Data Flow

```
HTTP Request
    │
    ▼
requestTracker Middleware
    ├─ Generate Request ID
    ├─ Record Start Time
    └─ Store in req._startTime, req._requestId
    │
    ▼
requestLogger Middleware (Morgan)
    ├─ Extract Request Details
    ├─ Calculate Response Time
    └─ Stream to Winston Logger
    │
    ▼
Route Handler / Controller
    ├─ logger.info() / logger.error() / etc.
    └─ Include metadata
    │
    ▼
Error Handler
    ├─ Catch errors
    ├─ logger.error() with context
    └─ Send error response
    │
    ▼
Winston Logger
    │
    ├─ Console Output (Dev)
    │   ├─ Colorized
    │   └─ Real-time
    │
    └─ File Output (All)
        ├─ combined.log
        ├─ success.log
        ├─ error.log
        ├─ debug.log
        ├─ exceptions.log
        └─ rejections.log
```

## File Organization

```
server/
├── src/
│   ├── config/
│   │   └── logger.ts                    ← Logger Configuration
│   │       ├─ Winston instance
│   │       ├─ Transports (Console, File)
│   │       ├─ Formatters
│   │       └─ Exception Handlers
│   │
│   ├── lib/
│   │   ├── logger.ts                    ← Logger Utility (Singleton)
│   │   │   ├─ info(), warn(), error(), debug()
│   │   │   ├─ serverStart()
│   │   │   ├─ dbConnection()
│   │   │   ├─ auth()
│   │   │   ├─ apiError()
│   │   │   ├─ cronJob()
│   │   │   └─ http()
│   │   │
│   │   ├── LOGGER_USAGE_GUIDE.ts        ← Usage Examples
│   │   └── stripe.ts (existing)
│   │
│   ├── app/
│   │   ├── middlewares/
│   │   │   ├── requestLogger.ts         ← Morgan + Winston
│   │   │   │   ├─ morgan configuration
│   │   │   │   ├─ requestTracker middleware
│   │   │   │   └─ custom tokens
│   │   │   │
│   │   │   ├── globalErrorHandler.ts    ← Error Logging (Updated)
│   │   │   │   └─ Error logging integration
│   │   │   │
│   │   │   ├── auth.ts (existing)
│   │   │   ├── rateLimiter.ts (existing)
│   │   │   └── validateRequest.ts (existing)
│   │   │
│   │   ├── app.ts                       ← Express App (Updated)
│   │   │   ├─ requestTracker middleware
│   │   │   ├─ requestLogger middleware
│   │   │   ├─ Cron job logging
│   │   │   └─ Logger imports
│   │   │
│   │   └── routes/ (existing)
│   │
│   ├── server.ts                        ← Server Entry (Updated)
│   │   ├─ serverStart logging
│   │   ├─ Error logging
│   │   ├─ Rejection handling
│   │   └─ Logger imports
│   │
│   └── (other modules...)
│
├── logs/                                ← Log Output Directory
│   ├── combined.log                     ← All logs
│   ├── success.log                      ← Info level
│   ├── error.log                        ← Errors & warnings
│   ├── debug.log                        ← Debug info (dev)
│   ├── exceptions.log                   ← Uncaught exceptions
│   └── rejections.log                   ← Promise rejections
│
├── package.json                         ← Dependencies Updated
│   └─ winston, morgan, @types/morgan
│
├── .env.example                         ← Config Template Updated
│   └─ LOG_LEVEL setting
│
├── .gitignore                           ← Updated
│   └─ logs/ and *.log
│
├── LOGGING_SETUP.md                     ← Complete Setup Guide
├── QUICK_START.md                       ← Quick Start Guide
├── IMPLEMENTATION_SUMMARY.md            ← Implementation Details
└── logs-cli.sh                          ← Log Management CLI
```

## Logger Singleton Pattern

```
┌─────────────────────────────────────┐
│  src/lib/logger.ts (Singleton)      │
│                                     │
│  class Logger {                     │
│    info()                           │
│    warn()                           │
│    error()                          │
│    debug()                          │
│    serverStart()                    │
│    dbConnection()                   │
│    auth()                           │
│    apiError()                       │
│    cronJob()                        │
│    http()                           │
│  }                                  │
│                                     │
│  export default new Logger()        │
└─────────────────────────────────────┘
         ▲
         │ (imports only)
         │
    ┌────┴────┐
    │          │
┌───────┐  ┌───────┐  ┌──────────┐
│ app.ts│  │server │  │ any      │
│       │  │.ts    │  │ route    │
│logger │  │logger │  │ logger   │
└───────┘  └───────┘  └──────────┘
```

## Log Level Flow

```
DEBUG (Level 3)
    │
    ▼ (includes)
INFO (Level 2)
    │
    ▼ (includes)
WARN (Level 1)
    │
    ▼ (includes)
ERROR (Level 0)

Console:
- Development: All levels colorized
- Production: Only error/warn/info

Files:
- combined.log: All levels
- success.log: info level only
- error.log: error + warn levels
- debug.log: debug level (dev only)
```

## Request Lifecycle with Logging

```
1. HTTP Request Arrives
   │
   ├─ requestTracker Middleware
   │  ├─ req._startTime = Date.now()
   │  ├─ req._requestId = "1234567890-abc123"
   │  └─ Optionally log request start
   │
   ├─ requestLogger Middleware (Morgan)
   │  ├─ Log request details
   │  └─ Format: [time] GET /api/users 200 - 125ms | User: anonymous
   │
   ├─ Route Handler
   │  ├─ Controller logic
   │  ├─ Database queries
   │  └─ Optional logger calls
   │      ├─ logger.info()
   │      ├─ logger.error()
   │      └─ logger.warn()
   │
   ├─ Response Sent
   │  ├─ Calculate duration
   │  ├─ Log if error (4xx/5xx)
   │  └─ Log if slow (>5s)
   │
   └─ Error Handler (if error)
      ├─ logger.error() with context
      ├─ Include request details
      └─ Send error response

2. Winston Logger Processes
   │
   ├─ Format log entry
   ├─ Add timestamp
   ├─ Add metadata
   │
   └─ Route to transports
      ├─ Console (if development)
      ├─ combined.log
      ├─ success.log (if info)
      ├─ error.log (if error/warn)
      └─ debug.log (if debug)

3. Log File Rotation
   │
   ├─ Monitor file size
   ├─ If > 5MB
   │  └─ Rotate: combined.log.1, .2, etc.
   │
   └─ Keep 5 versions
```

## Integration Points

```
┌──────────────────────────────────────────────┐
│             Express Application              │
├──────────────────────────────────────────────┤
│                                              │
│  1. app.ts                                   │
│     ├─ requestTracker middleware             │
│     ├─ requestLogger middleware              │
│     └─ Cron job: logger.cronJob()            │
│                                              │
│  2. server.ts                                │
│     ├─ logger.serverStart()                  │
│     ├─ Error logging                         │
│     └─ Rejection handling                    │
│                                              │
│  3. globalErrorHandler.ts                    │
│     └─ logger.error() integration            │
│                                              │
│  4. Controllers/Services                     │
│     ├─ logger.info()                         │
│     ├─ logger.error()                        │
│     ├─ logger.auth()                         │
│     ├─ logger.apiError()                     │
│     └─ logger.debug()                        │
│                                              │
└──────────────────────────────────────────────┘
         │              │             │
         ▼              ▼             ▼
    ┌─────────┐  ┌──────────┐  ┌──────────┐
    │ Console │  │ combined │  │ success  │
    │ Output  │  │ .log     │  │ .log     │
    └─────────┘  └──────────┘  └──────────┘
                      │
                      ▼
                ┌──────────┐
                │ error.log│
                └──────────┘
```

---

**Architecture is modular, scalable, and production-ready!** ✅
