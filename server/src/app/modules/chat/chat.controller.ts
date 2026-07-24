import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import httpStatus from 'http-status';
import { ChatService } from './chat.service';
import prisma from '../../../shared/prisma';

const getMyConversations = catchAsync(async (req: Request & { user?: any }, res: Response) => {
  // টোকেন থেকে ইমেইল নিয়ে ডাটাবেস থেকে আসল User ID বের করবো
  const user = await prisma.user.findUnique({ where: { email: req.user?.email } });

  const result = await ChatService.getMyConversations(user!.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Conversations retrieved successfully',
    data: result,
  });
});

const getMessages = catchAsync(async (req: Request, res: Response) => {
  const { conversationId } = req.params;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;

  const result = await ChatService.getMessages(conversationId, page, limit);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Messages retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

const uploadFile = catchAsync(async (req: Request, res: Response) => {
  const file = req.file as Express.Multer.File;
  const url = await ChatService.uploadFile(file);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'File uploaded successfully',
    data: { url },
  });
});

const createConversation = catchAsync(async (req: Request & { user?: any }, res: Response) => {
  const userEmail = req.user?.email;
  const { participantEmail } = req.body; // এখন আমরা আইডি না, ইমেইল রিসিভ করবো!
  const result = await ChatService.createConversation(userEmail, participantEmail);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Conversation created successfully',
    data: result,
  });
});

export const ChatController = {
  getMyConversations,
  getMessages,
  uploadFile,
  createConversation,
};
