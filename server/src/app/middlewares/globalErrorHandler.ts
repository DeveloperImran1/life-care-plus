import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import {
  PrismaClientValidationError,
  PrismaClientKnownRequestError,
  PrismaClientUnknownRequestError,
} from '@prisma/client/runtime/client';

import AppError from '../errors/ApiError';
import handleZodError from '../errors/handleZodError';
import handlePrismaValidationError from '../errors/prismaErrorParser';
import logger from '../../lib/logger';

const sanitizeError = (
  err: any, // eslint-disable-line
  message: string,
  errorDetails: Record<string, any> | null, // eslint-disable-line
) => {
  if (process.env.NODE_ENV === 'production') {
    if (
      err instanceof PrismaClientKnownRequestError ||
      err instanceof PrismaClientValidationError ||
      err instanceof PrismaClientUnknownRequestError
    ) {
      return {
        message,
        errorDetails: null,
      };
    }

    if (err instanceof Error) {
      return {
        message,
        errorDetails: null,
      };
    }
  }

  return {
    message,
    errorDetails,
  };
};

const sanitizeSensitiveData = (data: any) => {
  const sensitiveFields = [
    'password',
    'oldPassword',
    'newPassword',
    'confirmPassword',
    'token',
    'accessToken',
    'refreshToken',
    'authorization',
    'apiKey',
    'secret',
  ];
  if (!data || typeof data !== 'object') return data;

  const clone = { ...data };

  Object.keys(clone).forEach((key) => {
    if (sensitiveFields.some((field) => key.toLowerCase().includes(field.toLowerCase()))) {
      clone[key] = '[REDACTED]';
    }
  });

  return clone;
};

const globalErrorHandler = (
  err: any, // eslint-disable-line
  req: Request,
  res: Response,
  next: NextFunction, // eslint-disable-line
) => {
  // Log error with full details
  logger.error('API Error Handler', err, {
    path: req.path,
    method: req.method,
    ip: req.ip,
    user: req.user,
    body: sanitizeSensitiveData(req.body),
    query: sanitizeSensitiveData(req.query),
    params: sanitizeSensitiveData(req.params),
  });

  let statusCode = 500;
  let message = 'Something went wrong!';
  let errorDetails: Record<string, any> | null = {}; // eslint-disable-line

  if (err instanceof ZodError) {
    const simplifiedError = handleZodError(err);

    statusCode = simplifiedError?.statusCode || 400;
    message = simplifiedError?.message || 'Validation error';
    errorDetails = simplifiedError?.errorDetails || {};
  } else if (err instanceof PrismaClientValidationError) {
    const prismaError = handlePrismaValidationError(err);

    statusCode = prismaError.statusCode;
    message = prismaError.message;
    errorDetails = prismaError.errorDetails;
  } else if (err instanceof PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002': {
        const fields = Array.isArray(err.meta?.target)
          ? err.meta.target
          : err.message.match(/\(`(.+?)`\)/)?.[1]?.split('`, `') || ['field'];

        const modelName = err.meta?.modelName || 'Record';
        const fieldName = fields.join(', ');

        statusCode = 409;
        message = `${modelName} with this ${fieldName} already exists!`;
        errorDetails = {
          code: err.code,
          model: modelName,
          fields,
        };
        break;
      }

      case 'P2003': {
        const modelName = err.meta?.modelName || 'Record';

        statusCode = 400;
        message = `${modelName} relation data not found!`;
        errorDetails = {
          code: err.code,
          model: modelName,
          field: err.meta?.field_name,
        };
        break;
      }

      case 'P2011': {
        statusCode = 400;
        message = 'Required field cannot be null';
        errorDetails = {
          code: err.code,
          constraint: err.meta?.constraint,
        };
        break;
      }

      case 'P2025': {
        const modelName = err.meta?.modelName || 'Record';

        statusCode = 404;
        message = `${modelName} not found!`;
        errorDetails = {
          code: err.code,
          model: modelName,
          cause: err.meta?.cause,
        };
        break;
      }

      default: {
        statusCode = 400;
        message = 'Database request error';
        errorDetails = {
          code: err.code,
          meta: err.meta,
        };
        break;
      }
    }
  } else if (err instanceof PrismaClientUnknownRequestError) {
    statusCode = 500;
    message = 'Unknown database request error';
    errorDetails = {
      name: err.name,
      message: err.message,
    };
  } else if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    errorDetails = {
      stack: err.stack,
    };
  } else if (err instanceof Error) {
    statusCode = 500;
    message = err.message;
    errorDetails = {
      stack: err.stack,
    };
  }

  const sanitizedError = sanitizeError(err, message, errorDetails);

  res.status(statusCode).json({
    success: false,
    message: sanitizedError.message,
    errorDetails: sanitizedError.errorDetails,
  });
};

export default globalErrorHandler;
