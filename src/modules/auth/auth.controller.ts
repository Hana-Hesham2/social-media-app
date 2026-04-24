import {Router} from "express";
import  {Validation}  from "../../common/middleware/validation";
import * as UV from "./auth.validation";
import authService from "./auth.service";
import { authentication } from "../../common/middleware/authentication";

const authRouter = Router();



authRouter.post("/signup", Validation(UV.signUpSchema), authService.signUp);

authRouter.post("/signin", Validation(UV.signInSchema), authService.signIn);

authRouter.post("/google-signup", authService.signupWithGmail);

authRouter.post("/confirm-email", Validation(UV.confirmEmailSchema), authService.confirmEmail);

authRouter.post("/forget-password", authService.forgetPassword);

authRouter.patch("/update-password",authentication,authService.updatePassword);

authRouter.post("/logout",authentication,authService.logout);


// authRouter.post("/resend-otp",authService.resendOTP);
// authRouter.post("/reset-password", authService.resetPassword);
// authRouter.post("/verify-otp",authService.verifyOTP);


export default authRouter;