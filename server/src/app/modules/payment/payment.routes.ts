import { UserRole } from '@prisma/client';
import express from 'express';
import auth from '../../middlewares/auth';
import { PaymentController } from '../payment/payment.controller';

const router = express.Router();

router.get('/', auth(UserRole.SUPER_ADMIN, UserRole.ADMIN), PaymentController.getAllFromDB);

router.get('/mock-success', PaymentController.mockPaymentSuccess);

router.get(
  '/status/:appointmentId',
  auth(UserRole.PATIENT, UserRole.DOCTOR, UserRole.SUPER_ADMIN, UserRole.ADMIN),
  PaymentController.getPaymentStatus,
);

router.get('/:id', auth(UserRole.SUPER_ADMIN, UserRole.ADMIN), PaymentController.getById);

export const PaymentRoutes = router;
