import express from "express";
import verifyJWT from "../middleware/verifyJwt";
import { userInfo } from "../controller/userController";

const router = express.Router();

router.get("/me", verifyJWT, userInfo);

export default router;
