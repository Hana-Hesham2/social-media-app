import express from "express";
import type {Request,Response,NextFunction} from "express";
import cors from "cors";
import helmet from "helmet";
import {rateLimit} from "express-rate-limit";
import dotenv from "dotenv";
import { PORT } from "./config/config.service";
import { globalErrorHandler } from "./common/utils/globalErrorHandler";
import { AppError } from "./common/utils/globalErrorHandler";
import authRouter from "./modules/auth/auth.controller";
import { checkConnectionDB } from "./DB/connectionDB";
import { connect } from "node:http2";
import redisService from "./common/service/redis.service";
import uploadRouter from "./modules/upload/uplaod.controller";


const app:express.Application=express();
const port:number =Number(PORT);


const bootstrap = () => { 
    const limiter = rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes) 
        message: "Too many requests from this IP, please try again after 15 minutes",
        handler: (req:Request, res:Response, next:NextFunction) => {
        //     res.status(options.statusCode).json({
        //         status: "fail",
        //         message: options.message,
        //     });
        // },
        throw new AppError("Too many requests from this IP, please try again after 15 minutes",429);
        },
        standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
        legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    }) 
    
    app.use(express.json());
    app.use(cors(),helmet(),limiter);


    app.get("/",(req,res)=>{
        res.status(200).json({message:"Welcome to the Social Media APP"});
    });

    checkConnectionDB()
    redisService.connect()

    app.use("/auth",authRouter)
    app.use("/api/upload", uploadRouter);

    app.use((req:express.Request,res:express.Response,next:express.NextFunction)=>{
  throw new AppError(`URL ${req.originalUrl} not found`,404)})

app.use(globalErrorHandler);

app.listen(port,()=>{
        console.log(`Server is running on port ${port}`);
    }); 
    
}


export default bootstrap;