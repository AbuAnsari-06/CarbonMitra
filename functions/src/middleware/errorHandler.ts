import { Request, Response, NextFunction } from "express";
import { randomUUID } from "crypto";

/**
 * Standard Application Error class with user-safe messaging and structured error codes.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly errorCode: string;
  public readonly userSafeMessage: string;
  public readonly details?: any;

  constructor(
    userSafeMessage: string,
    statusCode: number = 500,
    errorCode: string = "INTERNAL_SERVER_ERROR",
    details?: any
  ) {
    super(userSafeMessage);
    this.name = "AppError";
    this.userSafeMessage = userSafeMessage;
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Specific error class for Sentinel Hub Satellite Imagery failures.
 */
export class SentinelHubError extends AppError {
  constructor(message: string = "Cloud-free satellite imagery is currently unavailable for this region.", details?: any) {
    super(
      message,
      422,
      "SENTINEL_NO_IMAGERY",
      details
    );
    this.name = "SentinelHubError";
  }
}

/**
 * Invocation Logger Middleware.
 */
export function invocationLoggerMiddleware(req: Request, res: Response, next: NextFunction): void {
  const startTime = Date.now();
  const correlationId = (req.headers["x-correlation-id"] as string) || randomUUID();
  req.headers["x-correlation-id"] = correlationId;

  const uid = (req.headers["x-user-id"] as string) || req.body?.ownerUid || req.body?.buyerUid || "anonymous";

  res.on("finish", () => {
    const durationMs = Date.now() - startTime;
    const isSuccess = res.statusCode >= 200 && res.statusCode < 400;

    const logEntry = {
      timestamp: new Date().toISOString(),
      correlationId,
      type: "INVOCATION_LOG",
      method: req.method,
      path: req.originalUrl || req.path,
      statusCode: res.statusCode,
      durationMs,
      uid,
      success: isSuccess,
    };

    if (isSuccess) {
      console.log(JSON.stringify(logEntry));
    } else {
      console.warn(JSON.stringify(logEntry));
    }
  });

  next();
}

/**
 * Global Error Handler Middleware.
 */
export function globalErrorHandler(err: any, req: Request, res: Response, _next: NextFunction): void {
  const correlationId = (req.headers["x-correlation-id"] as string) || randomUUID();

  let statusCode = 500;
  let errorCode = "INTERNAL_SERVER_ERROR";
  let userSafeMessage = "An unexpected error occurred while processing your request.";

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    errorCode = err.errorCode;
    userSafeMessage = err.userSafeMessage;
  } else if (err.name === "SentinelHubError" || err.code === "SENTINEL_NO_IMAGERY") {
    statusCode = 422;
    errorCode = "SENTINEL_NO_IMAGERY";
    userSafeMessage = err.message || "Cloud-free satellite imagery is currently unavailable for the specified farmland polygon.";
  } else if (err.status || err.statusCode) {
    statusCode = err.status || err.statusCode;
    userSafeMessage = err.message || userSafeMessage;
  }

  const errorLog = {
    timestamp: new Date().toISOString(),
    correlationId,
    type: "ERROR_LOG",
    errorCode,
    statusCode,
    path: req.originalUrl || req.path,
    errorMessage: err.message || "Unknown error",
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  };

  console.error(JSON.stringify(errorLog));

  res.status(statusCode).json({
    success: false,
    error: userSafeMessage,
    errorCode,
    correlationId,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Helper to wrap async function handlers to pass errors seamlessly to globalErrorHandler.
 */
export const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
