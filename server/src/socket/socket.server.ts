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
      origin: ['http://localhost:3000', 'http://localhost:3001', process.env.FRONTEND_URL],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Redis adapter for scaling (reuse existing REDIS_URL)
  const redisUrl = process.env.REDIS_URL;
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
