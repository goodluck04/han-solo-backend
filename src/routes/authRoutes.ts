import express from "express";
import {
  activateUser,
  createActivation,
  loginUser,
  refresh,
  registrationUser,
} from "../controller/authController";
import { validationActivationRequest, validationLoginRequest, validationRegisterRequest } from "../validation/authValidation";

const router = express.Router();

router.post("/register", validationRegisterRequest,registrationUser);
router.post("/activation", validationActivationRequest,activateUser);
router.post("/login", validationLoginRequest,loginUser);
router.get("/refresh-token", refresh);

export default router;
