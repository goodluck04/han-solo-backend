import express from "express";
import {
  activateUser,
  loginUser,
  refresh,
  registrationUser,
  forgotPassoword,
  changePassword,
  socialAuth,
  logout,
} from "../controller/authController";
import {
  validationActivationRequest,
  validationChangPasswordRequest,
  validationForgotPasswordRequest,
  validationLoginRequest,
  validationRegisterRequest,
  validationSocialAuthRequest,
} from "../validation/authValidation";

const router = express.Router();

router.post("/register", validationRegisterRequest, registrationUser);
router.post("/activation", validationActivationRequest, activateUser);
router.post("/login", validationLoginRequest, loginUser);
router.post("/logout", logout);
router.post("/social-auth", validationSocialAuthRequest, socialAuth);
router.get("/refresh", refresh);
router.post(
  "/forgot-password",
  validationForgotPasswordRequest,
  forgotPassoword
);
router.post("/change-password", validationChangPasswordRequest, changePassword);

export default router;
