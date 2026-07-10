import {
  AppointmentStatus,
  NotificationType,
  PaymentStatus,
  Prisma,
  UserRole,
} from '@prisma/client';
import httpStatus from 'http-status';
import { v4 as uuidv4 } from 'uuid';
import { paginationHelper } from '../../../helpers/paginationHelper';
import { stripe } from '../../../lib/stripe';
import prisma from '../../../shared/prisma';
import ApiError from '../../errors/ApiError';
import { IAuthUser } from '../../interfaces/common';
import { IPaginationOptions } from '../../interfaces/pagination';
import { redisHelper } from '../../../helpers/redisHelper';
import { appointmentCacheKeys } from './appointment.constant';
import { doctorScheduleCacheKeys } from '../doctorSchedule/doctorSchedule.constants';
import { NotificationService } from '../notification/notification.service';

const APPOINTMENT_CACHE_TTL = 30 * 60; // 30 minutes

const createAppointment = async (user: IAuthUser, payload: any) => {
  const patientData = await prisma.patient.findUniqueOrThrow({
    where: {
      email: user?.email,
    },
  });

  const doctorData = await prisma.doctor.findUniqueOrThrow({
    where: {
      id: payload.doctorId,
      isDeleted: false,
    },
  });

  await prisma.doctorSchedules.findFirstOrThrow({
    where: {
      doctorId: doctorData.id,
      scheduleId: payload.scheduleId,
      isBooked: false,
    },
  });

  const videoCallingId = uuidv4();

  const result = await prisma.$transaction(async (tnx) => {
    const appointmentData = await tnx.appointment.create({
      data: {
        patientId: patientData.id,
        doctorId: doctorData.id,
        scheduleId: payload.scheduleId,
        videoCallingId,
      },
    });

    await tnx.doctorSchedules.update({
      where: {
        doctorId_scheduleId: {
          doctorId: doctorData.id,
          scheduleId: payload.scheduleId,
        },
      },
      data: {
        isBooked: true,
      },
    });

    const transactionId = uuidv4();

    const paymentData = await tnx.payment.create({
      data: {
        appointmentId: appointmentData.id,
        amount: doctorData.appointmentFee,
        transactionId,
      },
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: user?.email || '',
      line_items: [
        {
          price_data: {
            currency: 'bdt',
            product_data: {
              name: `Appointment with ${doctorData.name}`,
            },
            unit_amount: doctorData.appointmentFee * 100,
          },
          quantity: 1,
        },
      ],
      metadata: {
        appointmentId: appointmentData.id,
        paymentId: paymentData.id,
      },
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/settings/payment/success`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/patient/dashboard/my-appointments`,
    });

    return { paymentUrl: session.url, appointmentData };
  });

  await redisHelper.deleteCacheByPattern(appointmentCacheKeys.allLists());
  await redisHelper.deleteCacheByPattern(doctorScheduleCacheKeys.allLists());

  // Emit real-time notification for new appointment
  await NotificationService.emitNotification(result.appointmentData.doctorId, {
    type: NotificationType.APPOINTMENT_CREATED,
    title: 'New Appointment Booked',
    message: `A new appointment has been booked with you`,
    priority: 'HIGH',
    actionUrl: '/doctor/dashboard/my-appointments',
    data: { appointmentId: result.appointmentData.id },
  });

  await NotificationService.emitToRole('ADMIN', {
    type: NotificationType.APPOINTMENT_CREATED,
    title: 'New Appointment',
    message: `A new appointment has been created`,
    priority: 'MEDIUM',
    actionUrl: '/admin/dashboard/appointments-management',
  });

  return { paymentUrl: result.paymentUrl };
};

const getMyAppointment = async (user: IAuthUser, filters: any, options: IPaginationOptions) => {
  const cacheKey = appointmentCacheKeys.myList(user?.email, user?.role, filters, options);

  const result = await redisHelper.getOrSetCache(
    cacheKey,
    async () => {
      const { page, limit, skip, sortBy, sortOrder } =
        paginationHelper.calculatePagination(options);
      const { ...filterData } = filters;

      const andConditions: Prisma.AppointmentWhereInput[] = [];

      if (user?.role === UserRole.PATIENT) {
        andConditions.push({
          patient: {
            email: user?.email,
          },
        });
      } else if (user?.role === UserRole.DOCTOR) {
        andConditions.push({
          doctor: {
            email: user?.email,
          },
        });
      }

      if (Object.keys(filterData).length > 0) {
        const filterConditions = Object.keys(filterData).map((key) => ({
          [key]: {
            equals: (filterData as any)[key],
          },
        }));

        andConditions.push(...filterConditions);
      }

      const whereConditions: Prisma.AppointmentWhereInput =
        andConditions.length > 0 ? { AND: andConditions } : {};

      const resultData = await prisma.appointment.findMany({
        where: whereConditions,
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
        include:
          user?.role === UserRole.DOCTOR
            ? {
                patient: true,
                schedule: true,
                prescription: true,
                review: true,
                payment: true,
                doctor: {
                  include: {
                    doctorSpecialties: {
                      include: {
                        specialities: true,
                      },
                    },
                  },
                },
              }
            : {
                doctor: {
                  include: {
                    doctorSpecialties: {
                      include: {
                        specialities: true,
                      },
                    },
                  },
                },
                schedule: true,
                prescription: true,
                review: true,
                payment: true,
                patient: true,
              },
      });

      const total = await prisma.appointment.count({
        where: whereConditions,
      });

      return {
        meta: {
          total,
          limit,
          page,
        },
        data: resultData,
      };
    },
    APPOINTMENT_CACHE_TTL,
  );

  return result;
};

// task get all data from db (appointment data) - admin

const updateAppointmentStatus = async (
  appointmentId: string,
  status: AppointmentStatus,
  user: IAuthUser,
) => {
  const appointmentData = await prisma.appointment.findUniqueOrThrow({
    where: {
      id: appointmentId,
    },
    include: {
      doctor: true,
    },
  });

  if (user?.role === UserRole.DOCTOR) {
    if (!(user?.email === appointmentData.doctor.email))
      throw new ApiError(httpStatus.BAD_REQUEST, 'This is not your appointment');
  }

  const result = await prisma.appointment.update({
    where: {
      id: appointmentId,
    },
    data: {
      status,
    },
  });

  await redisHelper.deleteCacheByPattern(appointmentCacheKeys.allLists());
  await redisHelper.deleteCacheByPattern(doctorScheduleCacheKeys.allLists());

  // Emit notification for status change
  const notificationType =
    status === AppointmentStatus.CANCELED
      ? NotificationType.APPOINTMENT_CANCELED
      : NotificationType.APPOINTMENT_UPDATED;

  const statusMessage =
    status === AppointmentStatus.CANCELED
      ? 'Your appointment has been canceled'
      : `Your appointment status has been updated to ${status}`;

  await NotificationService.emitNotification(
    [appointmentData.patientId, appointmentData.doctorId],
    {
      type: notificationType,
      title: status === AppointmentStatus.CANCELED ? 'Appointment Canceled' : 'Appointment Updated',
      message: statusMessage,
      priority: 'HIGH',
      actionUrl: '/dashboard/my-appointments',
      data: { appointmentId, status },
    },
  );

  await NotificationService.emitToRole('ADMIN', {
    type: notificationType,
    title: status === AppointmentStatus.CANCELED ? 'Appointment Canceled' : 'Appointment Updated',
    message: `An appointment status changed to ${status}`,
    priority: 'MEDIUM',
    actionUrl: '/admin/dashboard/appointments-management',
  });

  return result;
};

const getAllFromDB = async (filters: any, options: IPaginationOptions) => {
  const cacheKey = appointmentCacheKeys.allList(filters, options);

  const result = await redisHelper.getOrSetCache(
    cacheKey,
    async () => {
      const { limit, page, skip } = paginationHelper.calculatePagination(options);
      const { patientEmail, doctorEmail, ...filterData } = filters;
      const andConditions = [];

      if (patientEmail) {
        andConditions.push({
          patient: {
            email: patientEmail,
          },
        });
      } else if (doctorEmail) {
        andConditions.push({
          doctor: {
            email: doctorEmail,
          },
        });
      }

      if (Object.keys(filterData).length > 0) {
        andConditions.push({
          AND: Object.keys(filterData).map((key) => {
            return {
              [key]: {
                equals: (filterData as any)[key],
              },
            };
          }),
        });
      }

      const whereConditions: Prisma.AppointmentWhereInput =
        andConditions.length > 0 ? { AND: andConditions } : {};

      const resultData = await prisma.appointment.findMany({
        where: whereConditions,
        skip,
        take: limit,
        orderBy:
          options.sortBy && options.sortOrder
            ? { [options.sortBy]: options.sortOrder }
            : {
                createdAt: 'desc',
              },
        include: {
          doctor: {
            include: {
              doctorSpecialties: {
                include: {
                  specialities: true,
                },
              },
            },
          },
          patient: true,
          schedule: true,
          prescription: true,
          review: true,
          payment: true,
        },
      });
      const total = await prisma.appointment.count({
        where: whereConditions,
      });

      return {
        meta: {
          total,
          page,
          limit,
        },
        data: resultData,
      };
    },
    APPOINTMENT_CACHE_TTL,
  );

  return result;
};

const cancelUnpaidAppointments = async () => {
  const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000);

  const unPaidAppointments = await prisma.appointment.findMany({
    where: {
      createdAt: {
        lte: thirtyMinAgo,
      },
      paymentStatus: PaymentStatus.UNPAID,
    },
  });

  const appointmentIdsToCancel = unPaidAppointments.map((appointment) => appointment.id);

  await prisma.$transaction(async (tnx) => {
    // Update appointments to CANCELED status instead of deleting
    await tnx.appointment.updateMany({
      where: {
        id: {
          in: appointmentIdsToCancel,
        },
      },
      data: {
        status: AppointmentStatus.CANCELED,
      },
    });

    // Delete associated payments
    await tnx.payment.deleteMany({
      where: {
        appointmentId: {
          in: appointmentIdsToCancel,
        },
      },
    });

    // Free up doctor schedules (Fixed N+1 Issue)
    const scheduleConditions = unPaidAppointments.map((appointment) => ({
      doctorId: appointment.doctorId,
      scheduleId: appointment.scheduleId,
    }));

    if (scheduleConditions.length > 0) {
      await tnx.doctorSchedules.updateMany({
        where: {
          OR: scheduleConditions,
        },
        data: {
          isBooked: false,
        },
      });
    }
  });

  await redisHelper.deleteCacheByPattern(appointmentCacheKeys.allLists());
  await redisHelper.deleteCacheByPattern(doctorScheduleCacheKeys.allLists());
};

const createAppointmentWithPayLater = async (user: IAuthUser, payload: any) => {
  const patientData = await prisma.patient.findUniqueOrThrow({
    where: {
      email: user?.email,
    },
  });

  const doctorData = await prisma.doctor.findUniqueOrThrow({
    where: {
      id: payload.doctorId,
      isDeleted: false,
    },
  });

  await prisma.doctorSchedules.findFirstOrThrow({
    where: {
      doctorId: doctorData.id,
      scheduleId: payload.scheduleId,
      isBooked: false,
    },
  });

  const videoCallingId = uuidv4();

  const result = await prisma.$transaction(async (tnx) => {
    const appointmentData = await tnx.appointment.create({
      data: {
        patientId: patientData.id,
        doctorId: doctorData.id,
        scheduleId: payload.scheduleId,
        videoCallingId,
      },
      include: {
        patient: true,
        doctor: true,
        schedule: true,
      },
    });

    await tnx.doctorSchedules.update({
      where: {
        doctorId_scheduleId: {
          doctorId: doctorData.id,
          scheduleId: payload.scheduleId,
        },
      },
      data: {
        isBooked: true,
      },
    });

    const transactionId = uuidv4();

    await tnx.payment.create({
      data: {
        appointmentId: appointmentData.id,
        amount: doctorData.appointmentFee,
        transactionId,
      },
    });

    return appointmentData;
  });

  await redisHelper.deleteCacheByPattern(appointmentCacheKeys.allLists());
  await redisHelper.deleteCacheByPattern(doctorScheduleCacheKeys.allLists());

  // Emit notification for pay-later appointment
  await NotificationService.emitNotification(result.doctorId, {
    type: NotificationType.APPOINTMENT_CREATED,
    title: 'New Appointment Booked',
    message: `${result.patient?.name || 'A patient'} booked an appointment with you`,
    priority: 'HIGH',
    actionUrl: '/doctor/dashboard/my-appointments',
    data: { appointmentId: result.id },
  });

  await NotificationService.emitToRole('ADMIN', {
    type: NotificationType.APPOINTMENT_CREATED,
    title: 'New Appointment',
    message: `${result.patient?.name || 'A patient'} booked with Dr. ${result.doctor?.name || 'a doctor'}`,
    priority: 'MEDIUM',
    actionUrl: '/admin/dashboard/appointments-management',
  });

  return result;
};

const initiatePaymentForAppointment = async (appointmentId: string, user: IAuthUser) => {
  const patientData = await prisma.patient.findUniqueOrThrow({
    where: {
      email: user?.email,
    },
  });

  const appointment = await prisma.appointment.findUnique({
    where: {
      id: appointmentId,
      patientId: patientData.id,
    },
    include: {
      payment: true,
      doctor: true,
    },
  });

  if (!appointment) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Appointment not found or unauthorized');
  }

  if (appointment.paymentStatus !== PaymentStatus.UNPAID) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Payment already completed for this appointment');
  }

  if (appointment.status === AppointmentStatus.CANCELED) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot pay for cancelled appointment');
  }

  // Create Stripe checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    customer_email: user?.email || '',
    line_items: [
      {
        price_data: {
          currency: 'bdt',
          product_data: {
            name: `Appointment with ${appointment.doctor.name}`,
          },
          unit_amount: appointment.payment!.amount * 100,
        },
        quantity: 1,
      },
    ],
    metadata: {
      appointmentId: appointment.id,
      paymentId: appointment.payment!.id,
    },
    success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/settings/payment/success`,
    cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/patient/dashboard/my-appointments`,
  });

  return { paymentUrl: session.url };
};

export const AppointmentService = {
  createAppointment,
  getMyAppointment,
  updateAppointmentStatus,
  getAllFromDB,
  cancelUnpaidAppointments,
  createAppointmentWithPayLater,
  initiatePaymentForAppointment,
};
