import { AppointmentStatus, Prescription, Prisma } from '@prisma/client';
import httpStatus from 'http-status';
import { paginationHelper } from '../../../helpers/paginationHelper';
import prisma from '../../../shared/prisma';
import ApiError from '../../errors/ApiError';
import { IAuthUser } from '../../interfaces/common';
import { IPaginationOptions } from '../../interfaces/pagination';
import { redisHelper } from '../../../helpers/redisHelper';
import { prescriptionCacheKeys } from './prescription.constants';
import { NotificationService, NotificationType } from '../notification/notification.service';

const PRESCRIPTION_CACHE_TTL = 60 * 60; // 1 hour

const insertIntoDB = async (user: IAuthUser, payload: Partial<Prescription>) => {
  const appointmentData = await prisma.appointment.findUniqueOrThrow({
    where: {
      id: payload.appointmentId,
      status: AppointmentStatus.COMPLETED,
      // paymentStatus: PaymentStatus.PAID
    },
    include: {
      doctor: true,
    },
  });

  if (!(user?.email === appointmentData.doctor.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'This is not your appointment!');
  }

  const result = await prisma.prescription.create({
    data: {
      appointmentId: appointmentData.id,
      doctorId: appointmentData.doctorId,
      patientId: appointmentData.patientId,
      instructions: payload.instructions as string,
      followUpDate: payload.followUpDate || null || undefined,
    },
    include: {
      patient: true,
    },
  });

  await redisHelper.deleteCacheByPattern(prescriptionCacheKeys.allLists());

  // Emit notification to patient about new prescription
  await NotificationService.emitNotification(result.patientId, {
    type: NotificationType.PRESCRIPTION_CREATED,
    title: 'New Prescription',
    message: `${appointmentData.doctor.name} has issued a new prescription for you`,
    priority: 'MEDIUM',
    actionUrl: '/patient/dashboard/prescriptions',
    data: { prescriptionId: result.id },
  });

  return result;
};

const patientPrescription = async (user: IAuthUser, options: IPaginationOptions) => {
  const cacheKey = prescriptionCacheKeys.patientList(user?.email, options);

  const result = await redisHelper.getOrSetCache(
    cacheKey,
    async () => {
      const { limit, page, skip } = paginationHelper.calculatePagination(options);

      const resultData = await prisma.prescription.findMany({
        where: {
          patient: {
            email: user?.email,
          },
        },
        skip,
        take: limit,
        orderBy:
          options.sortBy && options.sortOrder
            ? { [options.sortBy]: options.sortOrder }
            : { createdAt: 'desc' },
        include: {
          doctor: true,
          patient: true,
          appointment: true,
        },
      });

      const total = await prisma.prescription.count({
        where: {
          patient: {
            email: user?.email,
          },
        },
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
    PRESCRIPTION_CACHE_TTL,
  );

  return result;
};

const getAllFromDB = async (filters: any, options: IPaginationOptions) => {
  const cacheKey = prescriptionCacheKeys.allList(filters, options);

  const result = await redisHelper.getOrSetCache(
    cacheKey,
    async () => {
      const { limit, page, skip } = paginationHelper.calculatePagination(options);
      const { patientEmail, doctorEmail } = filters;
      const andConditions = [];

      if (patientEmail) {
        andConditions.push({
          patient: {
            email: patientEmail,
          },
        });
      }

      if (doctorEmail) {
        andConditions.push({
          doctor: {
            email: doctorEmail,
          },
        });
      }

      const whereConditions: Prisma.PrescriptionWhereInput =
        andConditions.length > 0 ? { AND: andConditions } : {};

      const resultData = await prisma.prescription.findMany({
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
          doctor: true,
          patient: true,
          appointment: true,
        },
      });
      const total = await prisma.prescription.count({
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
    PRESCRIPTION_CACHE_TTL,
  );

  return result;
};

export const PrescriptionService = {
  insertIntoDB,
  patientPrescription,
  getAllFromDB,
};
