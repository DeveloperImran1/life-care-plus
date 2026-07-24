import { NotificationType, PaymentStatus, Prisma } from '@prisma/client';
import Stripe from 'stripe';
import httpStatus from 'http-status';
import { paginationHelper } from '../../../helpers/paginationHelper';
import { redisHelper } from '../../../helpers/redisHelper';
import prisma from '../../../shared/prisma';
import ApiError from '../../errors/ApiError';
import { IAuthUser } from '../../interfaces/common';
import { IPaginationOptions } from '../../interfaces/pagination';
import { appointmentCacheKeys } from '../appointment/appointment.constant';
import { doctorScheduleCacheKeys } from '../doctorSchedule/doctorSchedule.constants';
import { NotificationService } from '../notification/notification.service';
import { createVideoRoom } from '../../../helpers/dailyco';

const handleStripeWebhookEvent = async (event: Stripe.Event) => {
  // Check if event has already been processed (idempotency)
  const existingPayment = await prisma.payment.findFirst({
    where: {
      stripeEventId: event.id,
    },
  });

  if (existingPayment) {
    console.log(`⚠️ Event ${event.id} already processed. Skipping.`);
    return { message: 'Event already processed' };
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as any;

      const appointmentId = session.metadata?.appointmentId;
      const paymentId = session.metadata?.paymentId;

      if (!appointmentId || !paymentId) {
        console.error('⚠️ Missing metadata in webhook event');
        return { message: 'Missing metadata' };
      }

      // Verify appointment exists
      const appointment = await prisma.appointment.findUnique({
        where: { id: appointmentId },
      });

      if (!appointment) {
        console.error(
          `⚠️ Appointment ${appointmentId} not found. Payment may be for expired appointment.`,
        );
        return { message: 'Appointment not found' };
      }

      // Update both appointment and payment in a transaction
      await prisma.$transaction(async (tx) => {
        await tx.appointment.update({
          where: {
            id: appointmentId,
          },
          data: {
            paymentStatus:
              session.payment_status === 'paid' ? PaymentStatus.PAID : PaymentStatus.UNPAID,
          },
        });

        await tx.payment.update({
          where: {
            id: paymentId,
          },
          data: {
            status: session.payment_status === 'paid' ? PaymentStatus.PAID : PaymentStatus.UNPAID,
            paymentGatewayData: session,
            stripeEventId: event.id, // Store event ID for idempotency
          },
        });
      });

      console.log(`✅ Payment ${session.payment_status} for appointment ${appointmentId}`);

      // --- Create Video Room after successful payment ---
      if (session.payment_status === 'paid' && appointment) {
        try {
          // পেমেন্ট সাকসেস হলে ডাটাবেসে থাকা আইডি দিয়ে রুম তৈরি করবে
          await createVideoRoom(appointment.videoCallingId);
          console.log(
            `✅ Daily.co video room created automatically for Paid Appointment: ${appointmentId}`,
          );
        } catch (error) {
          console.log(`⚠️ Room already exists or error occurred:`, error);
        }
      }
      // ---------------------------------------------------

      // Invalidate Redis cache
      await redisHelper.deleteCacheByPattern(appointmentCacheKeys.allLists());
      await redisHelper.deleteCacheByPattern(doctorScheduleCacheKeys.allLists());

      // Emit real-time notification for payment completion
      if (session.payment_status === 'paid' && appointment) {
        await NotificationService.emitNotification(appointment.patientId, {
          type: NotificationType.PAYMENT_COMPLETED,
          title: 'Payment Successful',
          message: 'Your appointment payment has been completed successfully',
          priority: 'HIGH',
          actionUrl: '/patient/dashboard/my-appointments',
          data: { appointmentId },
        });

        await NotificationService.emitToRole('ADMIN', {
          type: NotificationType.PAYMENT_COMPLETED,
          title: 'Payment Received',
          message: `Payment completed for appointment ${appointmentId}`,
          priority: 'MEDIUM',
          actionUrl: '/admin/dashboard/appointments-management',
        });
      }

      break;
    }

    case 'checkout.session.expired': {
      const session = event.data.object as any;
      console.log(`⚠️ Checkout session expired: ${session.id}`);
      // Appointment will be cleaned up by cron job
      break;
    }

    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object as any;
      console.log(`❌ Payment failed: ${paymentIntent.id}`);
      break;
    }

    default:
      console.log(`ℹ️ Unhandled event type: ${event.type}`);
  }

  return { message: 'Webhook processed successfully' };
};

const getPaymentStatus = async (appointmentId: string, user: IAuthUser) => {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: {
      payment: true,
      patient: true,
      doctor: true,
    },
  });

  if (!appointment) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Appointment not found');
  }

  if (user?.role === 'PATIENT' && appointment.patient.email !== user.email) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden');
  }

  if (user?.role === 'DOCTOR' && appointment.doctor.email !== user.email) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden');
  }

  return {
    paymentStatus: appointment.paymentStatus,
    payment: appointment.payment,
  };
};

const getAllFromDB = async (filters: any, options: IPaginationOptions) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const { ...filterData } = filters;

  const andConditions: Prisma.PaymentWhereInput[] = [];

  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: { equals: (filterData as any)[key] },
      })),
    });
  }

  const whereConditions: Prisma.PaymentWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.payment.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? { [options.sortBy]: options.sortOrder }
        : { createdAt: 'desc' },
    include: {
      appointment: {
        include: {
          patient: true,
          doctor: true,
        },
      },
    },
  });

  const total = await prisma.payment.count({ where: whereConditions });

  return {
    meta: { total, page, limit },
    data: result,
  };
};

const getById = async (id: string) => {
  const payment = await prisma.payment.findUnique({
    where: { id },
    include: {
      appointment: {
        include: {
          patient: true,
          doctor: true,
          schedule: true,
        },
      },
    },
  });

  if (!payment) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Payment not found');
  }

  return payment;
};

const mockPaymentSuccess = async (appointmentId: string, paymentId: string) => {
  await prisma.$transaction(async (tx) => {
    await tx.appointment.update({
      where: { id: appointmentId },
      data: { paymentStatus: PaymentStatus.PAID },
    });

    await tx.payment.update({
      where: { id: paymentId },
      data: { status: PaymentStatus.PAID },
    });
  });

  await redisHelper.deleteCacheByPattern(appointmentCacheKeys.allLists());
  await redisHelper.deleteCacheByPattern(doctorScheduleCacheKeys.allLists());
  return true;
};

export const PaymentService = {
  handleStripeWebhookEvent,
  getPaymentStatus,
  getAllFromDB,
  getById,
  mockPaymentSuccess,
};
