import dotenv from "dotenv";
dotenv.config();

import "./config/cloudinary.config.js";
import express from "express";
import type { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import { PORT } from "./config/config.service.js";
import { globalErrorHandler, AppError } from "./common/utils/globalErrorHandler.js";
import authRouter from "./modules/auth/auth.controller.js";
import { checkConnectionDB } from "./DB/connectionDB.js";
import redisService from "./common/service/redis.service.js";
import uploadRouter from "./modules/upload/upload.controller.js";

const app: express.Application = express();
const port: number = Number(PORT);

const bootstrap = () => {
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    handler: (req: Request, res: Response, next: NextFunction) => {
      throw new AppError("Too many requests from this IP, please try again after 15 minutes", 429);
    },
    standardHeaders: true,
    legacyHeaders: false,
  });

  app.use(express.json());
  app.use(cors(), helmet(), limiter);

  app.get("/", (req, res) => {
    res.status(200).json({ message: "Welcome to the Social Media APP" });
  });

  checkConnectionDB();
  redisService.connect();

  app.use("/auth", authRouter);
  app.use("/api/upload", uploadRouter);

  app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
    throw new AppError(`URL ${req.originalUrl} not found`, 404);
  });

  app.use(globalErrorHandler);

  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
};

export default bootstrap;