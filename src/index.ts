import "dotenv/config";
import express, { Request, Response } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import connectDB from "./config/connectDB";
import { allowedOrigins } from "./config/allowedOrigins";
import { ErrorMiddleware } from "./middleware/extendError";

// appp initialised
const app = express();

// middleware
app.use(express.json({ limit: "50mb" }));
app.use(cookieParser());
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// health
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ message: "API is working!" });
});

// listening
app.listen(process.env.PORT, () => {
  console.log(`Server is Running at Port: ${process.env.PORT}`);
  connectDB();
});

// errorMiddleware
app.use(ErrorMiddleware);

