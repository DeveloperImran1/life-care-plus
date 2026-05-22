import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Application, NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import cron from 'node-cron';
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import { requestLogger, requestTracker } from './app/middlewares/requestLogger';
import logger from './lib/logger';
import router from './app/routes';
import { PaymentController } from './app/modules/payment/payment.controller';
import { AppointmentService } from './app/modules/appointment/appointment.service';

const app: Application = express();
app.use(cookieParser());

app.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  PaymentController.handleStripeWebhookEvent,
);

app.use(
  cors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
  }),
);

// Add request tracking middleware
app.use(requestTracker);

// Add request logging middleware (Morgan with Winston)
app.use(requestLogger);

//parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cron job for cleaning up unpaid appointments
cron.schedule('*/5 * * * *', () => {
  const startTime = Date.now();
  try {
    logger.info('🔄 Running unpaid appointment cleanup');
    AppointmentService.cancelUnpaidAppointments();
    const duration = Date.now() - startTime;
    logger.cronJob('cancelUnpaidAppointments', true, duration);
  } catch (err) {
    const duration = Date.now() - startTime;
    logger.cronJob('cancelUnpaidAppointments', false, duration);
    logger.error('❌ Cron job error', err as Error);
  }
});

app.get('/', (_req: Request, res: Response) => {
  res.send({
    Message: 'Life Care Plus Server is running..',
  });
});

app.use('/api/v1', router);

app.use(globalErrorHandler);

app.use((req: Request, res: Response, _next: NextFunction) => {
  res.status(httpStatus.NOT_FOUND).json({
    success: false,
    message: 'API NOT FOUND!',
    error: {
      path: req.originalUrl,
      message: 'Your requested path is not found!',
    },
  });
});

export default app;
