import "dotenv/config";
import express, { Request, Response } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import connectDB from "./config/connectDB";
import { ErrorMiddleware } from "./middleware/extendError";
import { v2 as cloudinary } from "cloudinary";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import path from "path";

// appp initialised
const app = express();
app.use(express.static(path.join(__dirname, 'public')));

// cloudinary cofig
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_SECRET_KEY,
});
// middleware
app.use(express.json({ limit: "50mb" }));
app.use(
  cors({
    origin: ["https://han-solo-frontend.vercel.app", "http://localhost:3000"],
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  })
);

app.use(cookieParser());
// health
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ message: "API is working!" });
});

app.use("/v1/api/auth", authRoutes);
app.use("/v1/api/user", userRoutes);

// listening
app.listen(process.env.PORT, () => {
  console.log(`Server is Running at Port: ${process.env.PORT}`);
  connectDB();
});

// errorMiddleware
app.use(ErrorMiddleware);
