// import { Prisma } from '@prisma/client';
// import { NextFunction, Request, Response } from 'express';
// import httpStatus from 'http-status';

// // Sanitize error to prevent exposing sensitive information in production
// const sanitizeError = (error: any) => {
//   // Don't expose Prisma errors in production
//   if (process.env.NODE_ENV === 'production' && error.code?.startsWith('P')) {
//     return {
//       message: 'Database operation failed',
//       errorDetails: null,
//     };
//   }
//   return error;
// };

// const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
//   console.log({ err });

//   const statusCode = httpStatus.INTERNAL_SERVER_ERROR;
//   const success = false;
//   let message = err.message || 'Something went wrong!';
//   let error = err;

//   if (err instanceof Prisma.PrismaClientValidationError) {
//     message = 'Validation Error';
//     error = err.message;
//   } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
//     if (err.code === 'P2002') {
//       message = 'Duplicate Key error';
//       error = err.meta;
//     }
//   }

//   // Sanitize error before sending response
//   const sanitizedError = sanitizeError(error);

//   res.status(statusCode).json({
//     success,
//     message,
//     error: sanitizedError,
//   });
// };

// export default globalErrorHandler;



import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

import AppError from '../errors/ApiError';
import { PrismaClientValidationError, PrismaClientKnownRequestError, PrismaClientUnknownRequestError } from '@prisma/client/runtime/client';
import handleZodError from '../errors/handleZodError';
import handlePrismaValidationError from '../errors/prismaErrorParser';

const globalErrorHandler = (
  err: any, // eslint-disable-line
  req: Request,
  res: Response,
  next: NextFunction, // eslint-disable-line
) => {
  console.log(err);
  let statusCode = 500;
  let message = 'Something went wrong!';
  let errorDetails: Record<string, any> = {}; // eslint-disable-line

  if (err instanceof ZodError) {
    const simplifiedError = handleZodError(err);
    statusCode = simplifiedError?.statusCode || 400;
    message = simplifiedError?.message || 'Validation error';
    errorDetails = simplifiedError?.errorDetails || {};
  }
  else if (err instanceof PrismaClientValidationError) {
    const prismaError = handlePrismaValidationError(err);
    statusCode = prismaError.statusCode;
    message = prismaError.message;
    errorDetails = prismaError.errorDetails;
  } else if (err instanceof PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002': {
        const fields =
          Array.isArray(err.meta?.target)
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
        };

        break;
      }

      case 'P2011':
        statusCode = 400;
        message = 'Required field cannot be null';
        errorDetails = {
          code: err.code,
          constraint: err.meta?.constraint,
        };
        break;

      case 'P2025': {
        const modelName = err.meta?.modelName || 'Record';

        statusCode = 404;
        message = `${modelName} not found!`;

        errorDetails = {
          code: err.code,
          model: modelName,
        };

        break;
      }

      default:
        statusCode = 400;
        message = 'Database request error';
        errorDetails = {
          code: err.code,
          meta: err.meta,
        };
        break;
    }
  } else if (err instanceof PrismaClientUnknownRequestError) {
    statusCode = 500;
    message = err.message;
    errorDetails = err;
  } else if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    errorDetails = { stack: err.stack };
  } else if (err instanceof Error) {
    message = err.message;
    errorDetails = { stack: err.stack };
  }

  res.status(statusCode).json({
    success: false,
    message,
    errorDetails,
  });
};

export default globalErrorHandler;

