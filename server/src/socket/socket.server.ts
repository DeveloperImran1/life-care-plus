import { Server as SocketServer } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { Server as HttpServer } from 'http';
import { Redis } from 'ioredis';
import config from '../config';
import { jwtHelpers } from '../helpers/jwtHelpers';
import { Secret } from 'jsonwebtoken';
import logger from '../lib/logger';
import prisma from '../shared/prisma';
import { UserRole } from '@prisma/client';

// Extend Socket.io Socket to include user info
declare module 'socket.io' {
  interface Socket {
    user?: {
      userId: string;
      email: string;
      role: UserRole;
    };
  }
}

export function initializeSocket(httpServer: HttpServer) {
  const io = new SocketServer(httpServer, {
    cors: {
      origin: ['http://localhost:3000', 'http://localhost:3001', config.frontendUrl as string],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Redis adapter for scaling (reuse existing REDIS_URL)
  const redisUrl = config.redisUrl;
  if (redisUrl) {
    try {
      const pubClient = new Redis(redisUrl, { maxRetriesPerRequest: null });
      const subClient = pubClient.duplicate();

      io.adapter(createAdapter(pubClient, subClient));
      logger.info('✅ Socket.io Redis adapter connected');
    } catch (error) {
      logger.error('⚠️ Socket.io Redis adapter failed, running without adapter', error as Error);
    }
  }

  // Authentication middleware — validate JWT on connection
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization;

      if (!token) {
        return next(new Error('Authentication token missing'));
      }

      // Remove "Bearer " prefix if present
      const cleanToken = token.replace('Bearer ', '');

      const decoded = jwtHelpers.verifyToken(cleanToken, config.jwt.jwt_secret as Secret);

      // Look up the user ID from the database using email
      const user = await prisma.user.findUnique({
        where: { email: decoded.email },
        select: { id: true, email: true, role: true },
      });

      if (!user) {
        return next(new Error('User not found'));
      }

      // Attach user info to socket
      socket.user = {
        userId: user.id,
        email: user.email,
        role: user.role,
      };

      next();
    } catch (error) {
      next(new Error('Invalid authentication token'));
    }
  });

  // Connection handling
  io.on('connection', (socket) => {
    const user = socket.user!;
    logger.info(`✅ Socket connected: ${user.email} (${user.role})`);

    // Join user-specific room (by user ID)
    socket.join(`user:${user.userId}`);

    // Join role-specific room
    socket.join(`role:${user.role.toLowerCase()}`);

    // Join admin room for both ADMIN and SUPER_ADMIN
    if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
      socket.join('role:admin');
    }

    // Join doctor-specific room
    if (user.role === 'DOCTOR') {
      socket.join(`doctor:${user.userId}`);
    }

    // Join patient-specific room
    if (user.role === 'PATIENT') {
      socket.join(`patient:${user.userId}`);
    }

    // Broadcast online status to admins
    io.to('role:admin').emit('user:online', {
      userId: user.userId,
      email: user.email,
      role: user.role,
      timestamp: new Date().toISOString(),
    });

    // ==========================================
    // 💬 CHAT SYSTEM EVENTS
    // ==========================================

    // ১. নির্দিষ্ট চ্যাট রুমে জয়েন করা (যাতে মেসেজ লিক না হয়!)
    socket.on('join_chat_room', (data: { conversationId: string }) => {
      const roomName = `chat:${data.conversationId}`;
      socket.join(roomName);
      logger.info(`User ${user.userId} joined chat room: ${roomName}`);
    });

    // ২. মেসেজ পাঠানো (রিয়েল-টাইম + ডাটাবেস সেভ)
    socket.on(
      'send_message',
      async (data: { conversationId: string; text?: string; fileUrl?: string }) => {
        try {
          // ক. আগে মেসেজটা ডাটাবেসে সেভ করবো (যাতে ডাটা পণ্ডিত না হারায়)
          const savedMessage = await prisma.message.create({
            data: {
              conversationId: data.conversationId,
              senderId: user.userId, // যে ইউজার লগড-ইন আছে, তার আইডি
              text: data.text,
              fileUrl: data.fileUrl,
            },
          });

          // খ. সেভ কনফার্ম হলে ওই রুমের অন্য ইউজারকে সাথে সাথে মেসেজটা ছুঁড়ে মারবো!
          const roomName = `chat:${data.conversationId}`;
          io.to(roomName).emit('receive_message', savedMessage);
        } catch (error) {
          logger.error('Error saving chat message', error);
          socket.emit('message_error', { message: 'Failed to send message' });
        }
      },
    );

    // ২.৫ মেসেজ আনসেন্ড (Unsend/Delete) করা
    socket.on('unsend_message', async (data: { messageId: string; conversationId: string }) => {
      try {
        // ডাটাবেসে মেসেজটা ডিলিট মার্ক করা হলো
        await prisma.message.update({
          where: { id: data.messageId },
          data: { isDeleted: true, text: "", fileUrl: null }, // টেক্সট ও ফাইল মুছে দিলাম প্রাইভেসি রক্ষার্থে
        });

        const roomName = `chat:${data.conversationId}`;
        // ওই রুমের সবাইকে জানিয়ে দিলাম যে মেসেজটা ডিলিট হয়ে গেছে
        io.to(roomName).emit('message_deleted', data.messageId);
      } catch (error) {
        logger.error('Error unsending message', error);
      }
    });

    // ৩. টাইপিং ইন্ডিকেটর ("Doctor is typing...")
    socket.on('typing', (data: { conversationId: string }) => {
      const roomName = `chat:${data.conversationId}`;
      // 'to()' ব্যবহার করলে যে টাইপ করছে সে ছাড়া ওই রুমের বাকি সবাই ইভেন্টটা পাবে
      socket.to(roomName).emit('user_typing', {
        userId: user.userId,
        isTyping: true,
      });
    });

    socket.on('stop_typing', (data: { conversationId: string }) => {
      const roomName = `chat:${data.conversationId}`;
      socket.to(roomName).emit('user_typing', {
        userId: user.userId,
        isTyping: false,
      });
    });

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      logger.info(`❌ Socket disconnected: ${user.email} (${reason})`);

      io.to('role:admin').emit('user:offline', {
        userId: user.userId,
        email: user.email,
        role: user.role,
        timestamp: new Date().toISOString(),
        reason,
      });
    });

    // Handle errors
    socket.on('error', (error) => {
      logger.error('Socket error', error);
    });
  });

  return io;
}

export type SocketIOServer = ReturnType<typeof initializeSocket>;
