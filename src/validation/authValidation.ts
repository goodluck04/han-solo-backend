import { NextFunction, Request, Response } from "express";
import { body, validationResult } from "express-validator";

const handleValidationErrors = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

export const validationRegisterRequest = [
  body("phone")
    .isString()
    .notEmpty()
    .withMessage("Enter valid phone Number"),
  body("email")
    .isString()
    .notEmpty()
    .isEmail()
    .withMessage("Please enter valid email"),
  body("password")
    .isString()
    .notEmpty()
    .withMessage("Please enter valid password"),
  handleValidationErrors,
];
export const validationActivationRequest = [
  body("activation_token")
    .isString()
    .notEmpty()
    .withMessage("Name Must be string"),
  body("activation_code")
    .isString()
    .notEmpty()
    .withMessage("Name Must be string"),
  handleValidationErrors,
];

export const validationLoginRequest = [
    body("email")
      .isString()
      .notEmpty()
      .isEmail()
      .withMessage("Please enter valid email"),
    body("password")
      .isString()
      .notEmpty()
      .withMessage("Please enter valid password"),
    handleValidationErrors,
  ];

export const validationSocialAuthRequest = [
    body("email")
      .isString()
      .notEmpty()
      .isEmail()
      .withMessage("Please enter valid email"),
    body("name")
      .isString()
      .notEmpty()
      .withMessage("Please enter your name."),
    body("avatar")
      .isString()
      .notEmpty()
      .withMessage("Please enter your avatar url."),
    handleValidationErrors,
  ];
export const validationForgotPasswordRequest = [
    body("email")
      .isString()
      .notEmpty()
      .isEmail()
      .withMessage("Please enter valid email"),
    handleValidationErrors,
  ];
export const validationChangPasswordRequest = [
    body("activation_token")
      .isString()
      .notEmpty()
      .withMessage("Please enter activation_token"),
    body("activation_code")
      .isString()
      .notEmpty()
      .withMessage("Please enter activation_code"),
    body("newPassword")
      .isString()
      .notEmpty()
      .withMessage("Please enter password"),
    handleValidationErrors,
  ];
