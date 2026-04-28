import { SignupDto, ConfirmEmailDto, SignInDto, resendOtpDto } from "./auth.dto";
import { Request, Response, NextFunction } from "express";
import userModel, { IUser } from "../../DB/models/user.model";
import BaseRepository from "../../DB/repositories/base.repository";
import { HydratedDocument } from "mongoose";
import { AppError } from "../../common/utils/globalErrorHandler";
import { ProviderEnum } from "../../common/enum/user.enum";
import UserRepository from "../../DB/repositories/user.repository";
import { encrypt } from "../../common/utils/security/encrypt";
import { Compare, Hash } from "../../common/utils/security/hash";
import { generateOTP, sendEmail } from "../../common/utils/email/send.email";
import { EmailTemplate } from "../../common/utils/email/email.template";
import { eventEmitter } from "../../common/utils/email/email.events";
import { EventEnum } from "../../common/enum/event.enum";
import { successResponse } from "../../common/utils/security/response.success";
import { randomUUID } from "crypto";
import { ACCESS_SECRET_KEY, GOOGLE_CLIENT_ID, REFRESH_SECRET_KEY } from "../../config/config.service";
import TokenService from "../../common/service/token.service";
import { OAuth2Client } from "google-auth-library";
import redisService from "../../common/service/redis.service";
import { IRequest } from "../../common/middleware/authentication";
import tokenService from "../../common/service/token.service";

class AuthService {

    private readonly _userModel = new UserRepository();
    private readonly _redisService = redisService;
    private readonly TokenService = TokenService;

    constructor() {}
    
    sendEmailOtp = async ({ email, subject }:{email:string,subject:EventEnum.confirmEmail}) => {
  const isBlocked = await this._redisService.ttl(this._redisService.blocked_otp_key(email));
  if (isBlocked && isBlocked > 0) {
    throw new Error(`you blocked please try again after ${isBlocked} seconds`);
  }

  const ttlOtp = await this._redisService.ttl(this._redisService.otp_key({ email, subject}));
  if (ttlOtp && ttlOtp > 0) {
    throw new Error(
      `you already have otp not expired yet please try again after ${ttlOtp} seconds`
    );
  }

  if ((await this._redisService.getValue(this._redisService.max_otp_key( email))) >= 3) {
    await this._redisService.setValue({
      key: this._redisService.blocked_otp_key(email),
      value: "1",
      ttl: 15 * 60,
    });
    throw new Error("you exceed maximum number of trials");
  }

  const otp = await generateOTP();

  eventEmitter.emit(EventEnum.confirmEmail, async ()=>{
    await sendEmail({
        to: email,
        subject:"Welcome to Social App",
        html:EmailTemplate(otp)
    })
    })

  await this._redisService.setValue({
    key: this._redisService.otp_key({ email, subject }),
    value: otp.toString(),
    ttl: 60 * 2,
  });

  await this._redisService.incr(this._redisService.max_otp_key( email ));
};

    signUp = async (req: Request, res: Response, next: NextFunction) => {
        try {

            let {
                firstName,
                lastName,
                email,
                password,
                cPassword,
                age,
                gender,
                address,
                phone
            }: SignupDto = req.body;

            const existingUser = await this._userModel.findOne({ filter: { email } });

            if (existingUser) {
                throw new AppError("Email already exists", 409);
            }

            const otp = generateOTP();

            await this._redisService.setValue({
                key:  this._redisService.otp_key({ email, subject: EventEnum.confirmEmail }),
                value: otp.toString(),
                ttl: 60 * 30
            });

            await this._redisService.setValue({
                key:  this._redisService.max_otp_key(email),
                value: "1",
                ttl: 60 * 30
            });

            await sendEmail({
                to: email,
                subject: "Email Confirmation",
                html: EmailTemplate(otp)
            });

            const user = await this._userModel.create({
                firstName,
                lastName,
                email,
                password: Hash({ plainText: password.toString() }),
                age,
                gender,
                address,
                phone: phone ? encrypt(phone) : undefined
            } as Partial<IUser>);

            return res.status(201).json({
                message: "User signed up successfully",
                user
            });

        } catch (error) {
            next(error);
        }
    };

    signupWithGmail = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { idToken } = req.body;

            const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID as string);

            const ticket = await client.verifyIdToken({
                idToken,
                audience: GOOGLE_CLIENT_ID
            });

            const payload = ticket.getPayload();

            if (!payload) {
                throw new AppError("Invalid Google token", 400);
            }

            const { email, email_verified, name, picture } = payload;

            if (!email || !email_verified) {
                throw new AppError("Google email not verified", 400);
            }

            let user = await this._userModel.findOne({
                filter: { email }
            });

            if (!user) {
                user = await this._userModel.create({
                    email,
                    userName: name,
                    confirmed: true,
                    provider: ProviderEnum.google
                } as any);
            }

            const access_token = this.TokenService.GenerateToken({
                payload: { id: user._id, email: user.email },
                secret_key: process.env.ACCESS_SECRET_KEY!,
                options: {
                    expiresIn: "1h"
                }
            });

            return res.status(200).json({
                message: "Google login successful",
                data: { access_token }
            });

        } catch (error) {
            next(error);
        }
    };

    confirmEmail = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { code, email } = req.body;

        const otpValue = await this._redisService.getValue(
            this._redisService.otp_key({
                email,
                subject: EventEnum.confirmEmail
            })
        );

        if (!otpValue) {
            throw new AppError("OTP expired or invalid", 400);
        }

        if (code.trim() !== String(otpValue).trim()) {
            throw new AppError("Invalid OTP", 400);
        }

        const user = await this._userModel.findOneAndUpdate({
    filter: {
        email,
        confirmed: false,
        provider: ProviderEnum.local
    },
    update: { confirmed: true },
    options: { new: true }
});

        if (!user) {
            throw new AppError("User not found or already confirmed", 404);
        }

        await this._redisService.deleteKey(
            this._redisService.otp_key({
                email,
                subject: EventEnum.confirmEmail
            })
        );

        return successResponse({
            res,
            message: "Email confirmed successfully",
            data: { user }
        });

    } catch (error) {
        next(error);
    }
    };

    signIn = async (req: Request, res: Response, next: NextFunction) => {
        try {

            const { email, password }: SignInDto = req.body;

            const user = await this._userModel.findOne({
                filter: {
                    email,
                    provider: ProviderEnum.local,
                    confirmed: { $exists: true }
                }
            });

            if (!user) {
                throw new AppError("User not found or invalid provider or unconfirmed", 404);
            }

            if (!Compare({
                plainText: String(password),
                hash: String(user.password)
            })) {
                throw new AppError("Invalid password", 400);
            }

            const uuid = randomUUID();

            const access_token = this.TokenService.GenerateToken({
                payload: { id: user._id, email: user.email },
                secret_key: ACCESS_SECRET_KEY,
                options: {
                    expiresIn: 60 * 30,
                    jwtid: uuid
                }
            });

            const refresh_token = this.TokenService.GenerateToken({
                payload: { id: user._id, email: user.email },
                secret_key: REFRESH_SECRET_KEY,
                options: {
                    expiresIn: "1y",
                    jwtid: uuid
                }
            });

            return res.status(200).json({
                message: "Sign in successful",
                access_token,
                refresh_token
            });

        } catch (error) {
            next(error);
        }
    };

    forgetPassword = async (req: Request, res: Response, next: NextFunction) => {
        try {

            const { email } = req.body;

            const user = await this._userModel.findOne({
                filter: {
                    email,
                    provider: ProviderEnum.system,
                    confirmed: true
                },
            });

            if (!user) {
                throw new AppError("user not found or invalid provider or unconfirmed", 404);
            }

            const otp = generateOTP();

            eventEmitter.emit(EventEnum.forgetPassword, async () => {
                await sendEmail({
                    to: email,
                    subject: "Reset Password",
                    html: EmailTemplate(otp)
                });

                await  this._redisService.setValue({
                    key:  this._redisService.otp_key({ email, subject: EventEnum.forgetPassword }),
                    value: otp.toString(),
                    ttl: 60 * 10
                });
            });

            return res.status(200).json({
                message: "Otp sent to your email",
            });

        } catch (error) {
            next(error);
        }
    };

    updatePassword = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const { oldPassword, newPassword } = req.body;

        const user = res.locals.user as any;

        if (!user) {
            throw new AppError("Unauthorized", 401);
        }

        const isMatch = Compare({
            plainText: oldPassword,
            hash: user.password
        });

        if (!isMatch) {
            throw new AppError("Incorrect Old Password", 400);
        }

        user.password = Hash({
            plainText: newPassword.toString()
        });

        await user.save();

        return successResponse({
            res,
            message: "Password updated successfully"
        });

    } catch (error) {
        next(error);
    }
}
    logout = async (req: IRequest, res: Response, next: NextFunction) => {
    try {

        const authHeader = req.headers.authorization;

        if (!authHeader) {
            throw new AppError("Token is missing", 400);
        }

        const [prefix, token] = authHeader.split(" ");

        if (!token) {
            throw new AppError("Token not found", 400);
        }

        const decoded = req.decoded;

        if (!decoded?.jti) {
            throw new AppError("Invalid token", 400);
        }

        
        await this._redisService.setValue({
            key: this._redisService.revoked_key({
                userId: decoded.id,
                jti: decoded.jti
            }),
            value: "revoked",
            ttl: 60 * 60 * 24 * 7 
        });

        return successResponse({
            res,
            message: "Logged out successfully"
        });

    } catch (error) {
        next(error);
    }
};
   resendOtp = async (req:IRequest, res: Response, next: NextFunction) => {

  const { email } : resendOtpDto = req.body;

  const user = await this._userModel.findOne({
    filter: {
      email,
      confirmed:{$exists:false},
      provider: ProviderEnum.system,
    },
  });

  if (!user) {
    throw new AppError("User does not exist",500);
  }
  
  await this.sendEmailOtp({ email ,subject:EventEnum.confirmEmail });

  return successResponse({
    res,
    message: "OTP resent successfully"
  });
};


}

export default new AuthService();