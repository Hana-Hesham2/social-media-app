import { Response, NextFunction } from "express";
import { AppError } from "../utils/globalErrorHandler";
import { RoleEnum } from "../../common/enum/user.enum";
import { IRequest } from "./authentication";

export const authorization = (...roles: RoleEnum[]) => {
    return (req: IRequest, res: Response, next: NextFunction) => {

        const user = req.user;

        if (!user) {
            throw new AppError("Unauthorized", 401);
        }

        
        if (!roles.length) {
            return next();
        }

        if (!roles.includes(user.role as RoleEnum)) {
            throw new AppError("Forbidden: Access denied", 403);
        }

        next();
    };
};