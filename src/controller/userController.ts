import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncError";
import User from "../model/user";
import ErrorHandler from "../config/ErrorHandler";

export const userInfo = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await User.findById(req.userId);

      if (!user) {
        next(new ErrorHandler("User does not exist.", 400));
      }
      res.status(200).json({
        success: true,
        user,
      });
    } catch (error: any) {
      next(error.message);
    }
  }
);
