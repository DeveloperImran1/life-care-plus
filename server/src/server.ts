import { Server } from 'http';
import app from './app';
import { closeJobs, initializeJobs } from './app/jobs';
import config from './config';
import seedSuperAdmin from './helpers/seed';
import logger from './lib/logger';
import { initializeSocket } from './socket/socket.server';
import * as Sentry from '@sentry/node';
import { AppointmentCron } from './app/modules/appointment/appointment.cron';

async function bootstrap() {
  // This variable will hold our server instance
  let server: Server;

  try {
    // Seed super admin
    await seedSuperAdmin();

    // Start the server
    server = app.listen(config.port, () => {
      logger.serverStart(config.port as number | string);
    });

    // ক্রন জব চালু করা হলো 🚀
    AppointmentCron.checkAndSendAppointmentReminders();

    // Initialize Socket.io
    const io = initializeSocket(server);

    // Make io available globally for emitting events from services
    (global as any).io = io;
    logger.info('✅ Socket.io initialized');

    // Initialize Background Jobs
    await initializeJobs();

    // Function to gracefully shut down the server
    const exitHandler = async () => {
      await closeJobs();
      if (server) {
        server.close(() => {
          logger.info('Server closed gracefully.');
          process.exit(0);
        });
      } else {
        process.exit(0);
      }
    };

    // Handle signals for graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received');
      exitHandler();
    });

    process.on('SIGINT', () => {
      logger.info('SIGINT received');
      exitHandler();
    });
    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception detected, shutting down...', error as Error);
      Sentry.captureException(error);
      process.exit(1);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', async (error) => {
      logger.error('Unhandled Rejection is detected, we are closing our server', error as Error);
      Sentry.captureException(error);
      await closeJobs();
      if (server) {
        server.close(() => {
          logger.error('Server closed due to unhandled rejection', error as Error);
          process.exit(1);
        });
      } else {
        process.exit(1);
      }
    });
  } catch (error) {
    logger.error('Error during server startup', error as Error);
    process.exit(1);
  }
}

bootstrap();
