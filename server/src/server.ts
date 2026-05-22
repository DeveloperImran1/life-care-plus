import { Server } from 'http';
import app from './app';
import seedSuperAdmin from './helpers/seed';
import config from './config';
import logger from './lib/logger';

async function bootstrap() {
  // This variable will hold our server instance
  let server: Server;

  try {
    // Seed super admin
    await seedSuperAdmin();

    // Start the server
    server = app.listen(config.port, () => {
      logger.serverStart(config.port);
    });

    // Function to gracefully shut down the server
    const exitHandler = () => {
      if (server) {
        server.close(() => {
          logger.info('Server closed gracefully.');
          process.exit(1); // Exit with a failure code
        });
      } else {
        process.exit(1);
      }
    };

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (error) => {
      logger.error('Unhandled Rejection is detected, we are closing our server', error as Error);
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
