import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import pick from '../../../shared/pick';
import sendResponse from '../../../shared/sendResponse';
import { IAuthUser } from '../../interfaces/common';
import { NotificationService } from './notification.service';
import prisma from '../../../shared/prisma';

const getMyNotifications = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
    const user = req.user;

    // Look up user ID from email
    const userData = await prisma.user.findUniqueOrThrow({
      where: { email: user?.email },
      select: { id: true },
    });

    const result = await NotificationService.getUserNotifications(userData.id, options);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Notifications retrieved successfully',
      data: result.data,
      meta: result.meta,
    });
  },
);

const markAsRead = catchAsync(async (req: Request & { user?: IAuthUser }, res: Response) => {
  const { id } = req.params;
  const user = req.user;

  const userData = await prisma.user.findUniqueOrThrow({
    where: { email: user?.email },
    select: { id: true },
  });

  const result = await NotificationService.markAsRead(id, userData.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Notification marked as read',
    data: result,
  });
});

const markAllAsRead = catchAsync(async (req: Request & { user?: IAuthUser }, res: Response) => {
  const user = req.user;

  const userData = await prisma.user.findUniqueOrThrow({
    where: { email: user?.email },
    select: { id: true },
  });

  const result = await NotificationService.markAllAsRead(userData.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'All notifications marked as read',
    data: result,
  });
});

export const NotificationController = {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
};
