import { Request, Response, NextFunction } from "express";
import TokenService from "../service/token.service";
import { ACCESS_SECRET_KEY, PREFIX } from "../../config/config.service";
import tokenService from "../service/token.service";
import { JwtPayload } from "jsonwebtoken";
import UserRepository from "../../DB/repositories/user.repository";
import { AppError } from "../utils/globalErrorHandler";
import redisService from "../service/redis.service";
import { HydratedDocument } from "mongoose";
import { IUser } from "../../DB/models/user.model";

const UserModel = new UserRepository()

export interface IRequest extends Request {
    user?:HydratedDocument<IUser>;
    decoded?:JwtPayload
}

export const authentication = async(req:IRequest,res: Response, next:NextFunction) => {
    const { authorization } = req.headers;

    if (!authorization) {
      throw new AppError("Token is missing",400);
    }

    const [prefix,token]=authorization.split(" ")
    if(prefix!==PREFIX){
        throw new AppError("Invalid Prefix",400)
    }

    if(!token){
        throw new AppError("Token not found",400)
    }

    const decoded = tokenService.VerifyToken({token, secret_key: ACCESS_SECRET_KEY})  as JwtPayload;

    if (!decoded?.id) {
      throw new AppError("Invalid token",409);
    }

   const user = await UserModel.findOne({
    filter:{_id:decoded.id}});
    if(!user){
      throw new AppError("User doesn't exist",400)
    }
    // if(user?.changeCredential?.getTime() > decoded.iat *1000){
    //   throw new AppError("Token expired",409)
    // }

    if (!user?.confirmed){
        throw new AppError("User not confirmed yet",400)
    }

    const revokeToken = await redisService.getValue(redisService.revoked_key({
        userId:decoded.id,
        jti:decoded.jti!
    })
    )
    if(revokeToken){
      throw new AppError("Token Revoked",400)
    }
    req.user=user
    req.decoded=decoded
    next();
  }
