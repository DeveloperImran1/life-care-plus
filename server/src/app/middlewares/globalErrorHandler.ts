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
  } else if (err?.code === 'P2002') {
    // Handle Prisma Duplicate entity error (Fix applied here)
    const target = (err.meta?.target as string) || 'field';
    const field = err.meta?.target.split('_')[1];
    message = `The ${field} is already in use. Please use a different value.`;
    statusCode = 409; // 409 conflict better
    errorDetails = {
      field: target,
      issue: 'Already exists in database',
    };
    errorDetails = { code: err.code, target: err.meta?.target };
  } else if (err?.code === 'P2003') {
    statusCode = 400;
    message = `Foreign key constraint failed on the field: ${err.meta?.field_name}`;
    errorDetails = {
      code: err.code,
      field: err.meta?.field_name,
      model: err.meta?.modelName,
    };
  } else if (err?.code === 'P2011') {
    statusCode = 400;
    message = `Null constraint violation on the field: ${err.meta?.field_name}`;
    errorDetails = { code: err.code, field: err.meta?.field_name };
  } else if (err?.code === 'P2025') {
    statusCode = 404;

    // Build full meaningful message
    const model = err.meta?.modelName || 'UnknownModel';
    const field = err.meta?.field_name || 'UnknownField';
    const cause = err.meta?.cause || 'No matching record found';

    message = `Record not found in ${model} where ${field}: ${cause}`;

    // Include full details if needed
    errorDetails = {
      code: err.code,
      model,
      field,
      meta: err.meta,
      stack: err.stack,
    };
  } else if (err instanceof PrismaClientValidationError) {
    const prismaError = handlePrismaValidationError(err);
    statusCode = prismaError.statusCode;
    message = prismaError.message;
    errorDetails = prismaError.errorDetails;
  } else if (err instanceof PrismaClientKnownRequestError) {
    statusCode = 400;
    message = err.message;
    errorDetails = { code: err.code, meta: err.meta };
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

