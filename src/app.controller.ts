import dotenv from "dotenv";
dotenv.config({ path: ".env.development" });

import "./config/cloudinary.config";
import "./config/firebase.config";
import express from "express";
import type { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import { PORT } from "./config/config.service";
import { globalErrorHandler, AppError } from "./common/utils/globalErrorHandler";
import authRouter from "./modules/auth/auth.controller";
import { checkConnectionDB } from "./DB/connectionDB";
import redisService from "./common/service/redis.service";
import uploadRouter from "./modules/upload/upload.controller";
import postRouter from "./modules/posts/post.controller";
import notificationRouter from "./modules/notifications/notification.controller";
import storyRouter from "./modules/story/story.controller";



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
  
app.use("/api/posts", postRouter);
app.use("/api/notifications", notificationRouter);
app.use("/api/stories", storyRouter);

  app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
    throw new AppError(`URL ${req.originalUrl} not found`, 404);
  });

  app.use(globalErrorHandler);

  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
};

export default bootstrap;