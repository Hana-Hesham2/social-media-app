import { Router } from "express";
import { Validation } from "../../common/middleware/validation";
import * as UV from "./auth.validation";
import authService from "./auth.service";
import { authentication } from "../../common/middleware/authentication";

const authRouter = Router();

authRouter.post("/signup", Validation(UV.signUpSchema), authService.signUp);

authRouter.post("/signin", Validation(UV.signInSchema), authService.signIn);

authRouter.post("/signup/gmail", authService.signupWithGmail);

authRouter.patch("/confirm-email", Validation(UV.confirmEmailSchema), authService.confirmEmail);

authRouter.post("/forget-password",Validation(UV.forgetPasswordSchema),authService.forgetPassword);

authRouter.patch("/update-password",authentication,Validation(UV.updatePasswordSchema),authService.updatePassword);

authRouter.post("/logout", authentication, authService.logout);

authRouter.patch("/resend-otp", Validation(UV.resendOtpSchema), authService.resendOtp);

authRouter.get("/profile", authentication, authService.getProfile);

authRouter.delete("/soft", authentication, authService.softDeleteUser);
authRouter.delete("/hard", authentication, authService.hardDeleteUser);


// authRouter.post("/reset-password", authService.resetPassword);
// authRouter.post("/verify-otp", authService.verifyOTP);

export default authRouter;