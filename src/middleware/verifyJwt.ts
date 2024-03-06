import jwt from "jsonwebtoken";
import ErrorHandler from "../config/ErrorHandler";
import { NextFunction, Request, Response } from "express";

// Extend Express Request interface to include userId
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

const verifyJWT = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Check if the Authorization header is present
  const { authorization } = req.headers;
  if (!authorization || !authorization.startsWith("Bearer")) {
    return next(new ErrorHandler("Unauthorized", 401));
  }

  // Extract the token from the Authorization header
  const token = authorization.split(" ")[1];

  // Verify the JWT token
  jwt.verify(
    token,
    process.env.ACCESS_TOKEN_SECRET!, // Ensure the token secret is set and correct
    (err: any, decoded: any) => {
      if (err) {
        // Handle JWT verification errors
        if (err.name === "TokenExpiredError") {
          // Token expired error
          return next(new ErrorHandler("Token expired", 401));
        } else {
          // Other JWT verification errors
          return next(new ErrorHandler("Invalid token", 401));
        }
      }

      // Store the userId in the request object for later use
      req.userId = decoded.UserInfo.userId;
      next(); // Move to the next middleware or route handler
    }
  );
};

export default verifyJWT;
