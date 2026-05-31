import { PaymentStatus } from '@prisma/client';
import Stripe from 'stripe';
import prisma from '../../../shared/prisma';
import { NotificationService, NotificationType } from '../notification/notification.service';

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

export const PaymentService = {
  handleStripeWebhookEvent,
};
