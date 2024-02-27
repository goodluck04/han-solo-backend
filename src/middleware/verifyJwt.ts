import jwt from "jsonwebtoken";
import ErrorHandler from "../config/ErrorHandler";
import { NextFunction, Request, Response } from "express";

// added custom value in request
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

const verifyJWT = (req: Request, res: Response, next: NextFunction) => {
  //   const authHeader = req.headers.authorization || req.headers.Authorization;
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return next(new ErrorHandler("Forbidden", 401));
  }

  const token = authorization.split(" ")[1];

  jwt.verify(
    token,
    process.env.ACCESS_TOKEN_SECRET!,
    (err: any, decoded: any) => {
      if (err) return next(new ErrorHandler("Forbidden", 403));
      req.userId = decoded.UserInfo.userId;
      next();
    }
  );
};

export default verifyJWT;
