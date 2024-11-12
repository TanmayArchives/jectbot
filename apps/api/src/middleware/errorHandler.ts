import { Request, Response, NextFunction } from 'express';
import { logger } from '@repo/web3';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    logger.error('Operational error', {
      statusCode: err.statusCode,
      message: err.message,
      path: req.path
    });

    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message
    });
  }

  // Programming or unknown errors
  logger.error('Unexpected error', {
    error: err,
    path: req.path,
    body: req.body
  });

  return res.status(500).json({
    status: 'error',
    message: 'Something went wrong'
  });
};

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}; 