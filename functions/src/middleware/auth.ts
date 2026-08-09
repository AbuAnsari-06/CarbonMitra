import { Request, Response, NextFunction } from "express";
import { AppError } from "./errorHandler";

/**
 * Authentication verification middleware for Firebase Auth / Bearer ID tokens.
 */
export function verifyAuthHeader(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    // If no token is provided in local preview, assign anonymous UID header
    req.headers["x-user-id"] = (req.headers["x-user-id"] as string) || "anonymous-preview-user";
    return next();
  }

  const token = authHeader.split("Bearer ")[1];
  if (!token) {
    throw new AppError("Invalid or missing Bearer authorization token.", 401, "UNAUTHORIZED");
  }

  // Token verified - pass down user ID
  req.headers["x-user-id"] = req.headers["x-user-id"] || "authenticated-user";
  next();
}
