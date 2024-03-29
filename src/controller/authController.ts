import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncError";
import User, { IUser } from "../model/user";
import ErrorHandler from "../config/ErrorHandler";
import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import SendMail from "../utils/sendMail";
import bcrypt from "bcryptjs";
import "dotenv/config";
import {
  IRegistrationBody,
  IActivationToken,
  ILoginRequest,
  IActivationRequest,
  ISocialAuthRequest,
} from "../@types/types";
import generatePassword from "../utils/randomPasswordGenerator";
import path from "path";
import ejs from "ejs";

// register user
export const registrationUser = CatchAsyncError(
  async (
    req: Request<{}, {}, IRegistrationBody>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { email, password, phone } = req.body;

      const isEmailExist = await User.findOne({ email });
      if (isEmailExist) {
        return next(new ErrorHandler("Email already exists", 400));
      }

      const user: IRegistrationBody = {
        email,
        password,
        phone,
      };
      const activationToken = createActivation(user);
      const activationCode = activationToken.activationCode;
      const data = { user: { name: user.email }, activationCode };
      //   send the dynamica data to the ejs
      const html = await ejs.renderFile(
        path.join(__dirname, "../mail/activation-mail.ejs"),
        data
      );

      try {
        await SendMail({
          email: user.email,
          subject: "Activate your account",
          template: "activation-mail.ejs",
          data,
        });
        res.status(201).json({
          success: true,
          message: `Please check your email: ${user.email} to activate your account`,
          activationToken: activationToken.token,
        });
      } catch (error: any) {
        console.log("[RESTER_EMAIL_SEND_ERROR]:", error);
        return next(error.message);
      }
    } catch (error: any) {
      console.log("REGISTER-USER-ERROR", error);
      return next(error.message);
    }
  }
);

// create activation code util func
const createActivation = (user: IRegistrationBody): IActivationToken => {
  const activationCode = Math.floor(1000 + Math.random() * 9000).toString();
  const token = jwt.sign(
    { user, activationCode },
    process.env.ACTIVATION_SECRET as Secret,
    {
      expiresIn: "5m",
    }
  );
  return { token, activationCode };
};

// activate user using otp
export const activateUser = CatchAsyncError(
  async (
    req: Request<{}, {}, IActivationRequest>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { activation_token, activation_code } = req.body;
      const newUser: { user: IUser; activationCode: string } = jwt.verify(
        activation_token,
        process.env.ACTIVATION_SECRET!
      ) as { user: IUser; activationCode: string };
      if (newUser.activationCode !== activation_code) {
        return next(new ErrorHandler("Invalid activation code", 400));
      }

      const { name, email, password, phone } = newUser.user;

      // create username
      const username = email.split("@")[0];
      const randomNumber = Math.floor(Math.random() * 10000); // Generate a random number between 0 and 9999
      const finalUsername = `${username}${randomNumber}`;

      // bcrypt the password then store
      const hashedPassword = await bcrypt.hash(password, 10);
      await User.create({
        name,
        email,
        password: hashedPassword,
        username: finalUsername,
        phone,
      });

      res.status(201).json({
        success: true,
      });
    } catch (error: any) {
      console.log("ACTIVATE-USER-ERROR:", error.message);
      next(error.message);
    }
  }
);

// Login user
export const loginUser = CatchAsyncError(
  async (
    req: Request<{}, {}, ILoginRequest>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { email, password } = req.body;

      const foundUser = await User.findOne({ email });

      if (!foundUser) {
        return next(new ErrorHandler("Invalid email or password", 401));
      }

      const isPasswordMatch = await bcrypt.compare(
        password,
        foundUser.password
      );

      if (!isPasswordMatch) {
        return next(new ErrorHandler("Invalid email or password", 400));
      }

      const accessToken = jwt.sign(
        {
          UserInfo: {
            userId: foundUser._id,
          },
        },
        process.env.ACCESS_TOKEN_SECRET!,
        { expiresIn: "15m" } //15m
      );

      const refreshToken = jwt.sign(
        { userId: foundUser._id },
        process.env.REFRESH_TOKEN_SECRET!,
        { expiresIn: "7d" }
      );

      // Create secure cookie with refresh token
      res.cookie("jwt", refreshToken, {
        httpOnly: true, //accessible only by web server
        secure: true, //https
        sameSite: "none", //cross-site cookie
        maxAge: 7 * 24 * 60 * 60 * 1000, //cookie expiry: set to match rT
        // maxAge: 5 * 1000, //cookie expiry: set to match rT
      });

      // Send accessToken containing username and roles
      res.json({ accessToken });
    } catch (error: any) {
      console.log("[LOGIN_USER_ERROR]:", error);
      next(error.message);
    }
  }
);

export const socialAuth = CatchAsyncError(
  async (
    req: Request<{}, {}, ISocialAuthRequest>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { email, name, avatar } = req.body;

      let foundUser = await User.findOne({ email });

      if (!foundUser) {
        const hashedPassword = await bcrypt.hash(generatePassword(), 10);
        // create username
        const username = email.split("@")[0];
        const randomNumber = Math.floor(Math.random() * 10000); // Generate a random number between 0 and 9999
        const finalUsername = `${username}${randomNumber}`;
        foundUser = await User.create({
          name,
          avatar,
          email,
          password: hashedPassword,
          username: finalUsername,
          phone: "XXXXXXXXXX",
        });
      }

      const accessToken = jwt.sign(
        {
          UserInfo: {
            userId: foundUser._id,
          },
        },
        process.env.ACCESS_TOKEN_SECRET!,
        { expiresIn: "15m" } //15m
      );

      const refreshToken = jwt.sign(
        { userId: foundUser._id },
        process.env.REFRESH_TOKEN_SECRET!,
        { expiresIn: "7d" }
      );

      // Create secure cookie with refresh token
      res.cookie("jwt", refreshToken, {
        httpOnly: true, //accessible only by web server
        secure: true, //https
        sameSite: "none", //cross-site cookie
        maxAge: 7 * 24 * 60 * 60 * 1000, //cookie expiry: set to match rT
        // maxAge: 5 * 1000, //cookie expiry: set to match rT
      });

      // Send accessToken containing username and roles
      res.json({ accessToken });
    } catch (error: any) {
      console.log("[SOCIAL_USER_ERROR]:", error);
      next(error.message);
    }
  }
);

// clear cookies
export const logout = (req: Request, res: Response) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(204); //No content
  res.clearCookie("jwt", { httpOnly: true, sameSite: "none", secure: true });
  res.json({ message: "Cookie cleared" });
};

// refreah token
export const refresh = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const cookies = req.cookies;

    if (!cookies?.jwt) return next(new ErrorHandler("Unauthorized", 401));

    const refreshToken = cookies.jwt;

    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET!,
      async (err: any, decoded: any) => {
        if (err) return next(new ErrorHandler("Forbidden", 403));
        const foundUser = await User.findOne({
          _id: decoded.userId,
        }).exec();

        if (!foundUser) return next(new ErrorHandler("Unauthorized", 401));

        // Generate a new refresh token
        const newRefreshToken = jwt.sign(
          { userId: foundUser._id },
          process.env.REFRESH_TOKEN_SECRET!,
          { expiresIn: "7d" }
        );

        // Generate a new access token
        const accessToken = jwt.sign(
          {
            UserInfo: {
              userId: foundUser._id,
            },
          },
          process.env.ACCESS_TOKEN_SECRET!,
          { expiresIn: "15m" }
        );

        // Update the refresh token in the client
        res.cookie("jwt", newRefreshToken, {
          httpOnly: true,
          secure: true,
          sameSite: "none",
          maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        // Send the new access token to the client
        res.json({ accessToken });
      }
    );
  }
);

//forgot password
export const forgotPassoword = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const isUserExist = await User.findOne({ email: req.body.email });

      if (!isUserExist) {
        return next(new ErrorHandler("Email does not exist.", 400));
      }

      const user: IRegistrationBody = {
        email: isUserExist.email,
      };

      const activationToken = createActivation(user);
      const activationCode = activationToken.activationCode;
      const data = { user: { name: user.email }, activationCode };

      const html = await ejs.renderFile(
        path.join(__dirname, "../mail/activation-mail.ejs"),
        data
      );

      // send email
      try {
        await SendMail({
          email: user.email,
          subject: "Change your password",
          template: "activation-mail.ejs",
          data,
        });

        res.status(200).json({
          success: true,
          message: `Please check your email: ${user.email} for OTP.`,
          activationToken: activationToken.token,
        });
      } catch (error:any) {
        console.log("[FORGET_PASSWORD_EMAIL_ERROR]:", error);
        next(error.message);
      }
    } catch (error: any) {
      console.log("[FORGET_PASSWORD_ERROR]:", error);
      return next(error.message);
    }
  }
);

export const changePassword = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { activation_token, activation_code, newPassword } = req.body;
      const newUser: { user: IUser; activationCode: string } = jwt.verify(
        activation_token,
        process.env.ACTIVATION_SECRET!
      ) as { user: IUser; activationCode: string };
      if (newUser.activationCode !== activation_code) {
        return next(new ErrorHandler("Invalid activation code", 400));
      }

      const { email } = newUser.user;
      // bcrypt the password then store
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await User.findOneAndUpdate(
        {
          email,
        },
        { password: hashedPassword },
        { new: true }
      );
      res.status(200).json({
        success: true,
      });
    } catch (error: any) {
      console.log("[CHANGE_PASSWORD_ERROR]:", error.message);
      next(error.message);
    }
  }
);
