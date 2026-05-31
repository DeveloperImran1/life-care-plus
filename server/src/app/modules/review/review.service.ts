import { PaymentStatus, Prisma } from '@prisma/client';
import httpStatus from 'http-status';
import { paginationHelper } from '../../../helpers/paginationHelper';
import prisma from '../../../shared/prisma';
import ApiError from '../../errors/ApiError';
import { IAuthUser } from '../../interfaces/common';
import { IPaginationOptions } from '../../interfaces/pagination';
import { redisHelper } from '../../../helpers/redisHelper';
import { reviewCacheKeys } from './review.contant';
import { doctorCacheKeys } from '../doctor/doctor.constants';
import { NotificationService, NotificationType } from '../notification/notification.service';

const REVIEW_CACHE_TTL = 45 * 60; // 45 minutes

const insertIntoDB = async (user: IAuthUser, payload: any) => {
  const patientData = await prisma.patient.findUniqueOrThrow({
    where: {
      email: user?.email,
    },
  });

  const appointmentData = await prisma.appointment.findUniqueOrThrow({
    where: {
      id: payload.appointmentId,
    },
  });

  if (appointmentData.paymentStatus !== PaymentStatus.PAID) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Payment must be completed before submitting a review',
    );
  }

  if (!(patientData.id === appointmentData.patientId)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'This is not your appointment!');
  }

  const result = await prisma.$transaction(async (tx) => {
    const resultObj = await tx.review.create({
      data: {
        appointmentId: appointmentData.id,
        doctorId: appointmentData.doctorId,
        patientId: appointmentData.patientId,
        rating: payload.rating,
        comment: payload.comment,
      },
    });

    const averageRating = await tx.review.aggregate({
      _avg: {
        rating: true,
      },
    });

    await tx.doctor.update({
      where: {
        id: resultObj.doctorId,
      },
      data: {
        averageRating: averageRating._avg.rating as number,
      },
    });

    return resultObj;
  });

  await redisHelper.deleteCacheByPattern(reviewCacheKeys.allLists());
  await redisHelper.deleteCacheByPattern(doctorCacheKeys.allDoctorLists());
  await redisHelper.deleteCacheByPattern(doctorCacheKeys.details(result.doctorId));

  // Emit notification to doctor about new review
  await NotificationService.emitNotification(result.doctorId, {
    type: NotificationType.REVIEW_CREATED,
    title: 'New Review Received',
    message: `You received a new ${result.rating}-star review`,
    priority: 'LOW',
    actionUrl: '/doctor/dashboard/my-appointments',
    data: { reviewId: result.id, rating: result.rating },
  });

  await NotificationService.emitToRole('ADMIN', {
    type: NotificationType.REVIEW_CREATED,
    title: 'New Review Submitted',
    message: `A ${result.rating}-star review was submitted`,
    priority: 'LOW',
    actionUrl: '/admin/dashboard/reviews',
  });

  return result;
};

const getAllFromDB = async (filters: any, options: IPaginationOptions) => {
  const cacheKey = reviewCacheKeys.list(filters, options);

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

      const whereConditions: Prisma.ReviewWhereInput =
        andConditions.length > 0 ? { AND: andConditions } : {};

      const resultData = await prisma.review.findMany({
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
      const total = await prisma.review.count({
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
    REVIEW_CACHE_TTL,
  );

  return result;
};

export const ReviewService = {
  insertIntoDB,
  getAllFromDB,
};
