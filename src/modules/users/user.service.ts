// import { signUpType } from "../auth/auth.dto";
// import { Request, Response, NextFunction } from "express";
// import { AppError } from "../../common/utils/globalErrorHandler";
// import { signUpSchema } from "../auth/user.validation";
// import userModel, { IUser } from "../../DB/models/user.model";
// import { Model } from "mongoose";


//    export const signUp = async (req: Request, res: Response, next: NextFunction) => {
    
//             const{ userName, email, password, gender, phone } = req.body;

//             const user = await this._userModel.create({
//                 userName,
//                 email,
//                 password,
//                 age,
//                 ...(gender && { gender }),
//                 ...(address && { address }),
//                 ...(phone && { phone })
//             });

//             res.status(201).json({
//                 message: "User signed up successfully",
//                 data: user
//             });

//         } catch (error) {
//             next(error);
//         }
//     };

//     signIn = async (req: Request, res: Response, next: NextFunction) => {
//         try {
//             res.status(200).json({
//                 message: "User signed in successfully"
//             });
//         } catch (error) {
//             next(error);
//         }
//     };
// }

// export default new UserService();