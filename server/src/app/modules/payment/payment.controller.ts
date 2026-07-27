import { Request, Response } from 'express';
import httpStatus from 'http-status';
import config from '../../../config';
import { stripe } from '../../../lib/stripe';
import catchAsync from '../../../shared/catchAsync';
import pick from '../../../shared/pick';
import sendResponse from '../../../shared/sendResponse';
import { IAuthUser } from '../../interfaces/common';
import { PaymentService } from '../payment/payment.service';

const handleStripeWebhookEvent = catchAsync(async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string;
  const webhookSecret = config.stripeWebhookSecret as string;

  if (!webhookSecret) {
    console.error('⚠️ Stripe webhook secret not configured');
    res.status(500).send('Webhook secret not configured');
    return;
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err: any) {
    console.error('⚠️ Webhook signature verification failed:', err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  try {
    const result = await PaymentService.handleStripeWebhookEvent(event);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Webhook processed successfully',
      data: result,
    });
  } catch (error: any) {
    console.error('❌ Error processing webhook:', error);
    // Still return 200 to acknowledge receipt to Stripe
    // Stripe will retry if we return an error
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Webhook received but processing failed',
      data: { error: error.message },
    });
  }
});

const getPaymentStatus = catchAsync(async (req: Request & { user?: IAuthUser }, res: Response) => {
  const { appointmentId } = req.params;
  const user = req.user;

  const result = await PaymentService.getPaymentStatus(appointmentId, user as IAuthUser);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Payment status retrieved successfully',
    data: result,
  });
});

const getAllFromDB = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, ['status', 'appointmentId']);
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);

  const result = await PaymentService.getAllFromDB(filters, options);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Payments retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await PaymentService.getById(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Payment retrieved successfully',
    data: result,
  });
});

const mockPaymentSuccess = catchAsync(async (req: Request, res: Response) => {
  res.redirect(`${config.frontendUrl || 'http://localhost:3000'}/settings/payment/success`);
});

export const PaymentController = {
  handleStripeWebhookEvent,
  getPaymentStatus,
  getAllFromDB,
  getById,
  mockPaymentSuccess,
};
