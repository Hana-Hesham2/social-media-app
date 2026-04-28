import * as z from "zod";
import { GenderEnum } from "../../common/enum/user.enum";


export const resendOtpSchema = {
    body:   z.strictObject({
            email: z.email("Invalid email address"),
        })
 }  


export const signInSchema = {
    body:   resendOtpSchema.body.safeExtend({
            password: z.string()
        })
 }   
export const signUpSchema = {
    body: signInSchema.body.safeExtend ({
            firstName: z.string().min(3,"First name is required"),
            lastName: z.string().min(3,"Last name is required"),
            email: z.string().email("Invalid email address"),
            password: z.string(),
            cPassword: z.string(),
            age: z.number().min(13).max(90),
            address: z.string().optional(),
            phone: z.string().optional(),
            gender: z.nativeEnum(GenderEnum).optional()
        }).refine((data) => data.password === data.cPassword, {
            error: "Passwords don't match",
            path: ["cPassword"],
            when(payload){
                return z.object({
                    password: z.string().min(6,"Password must be at least 6 characters long "),
                    cPassword: z.string().min(6,"Confirm Password must be at least 6 characters long ")
                 }).safeParse(payload).success
            }
          })}


export const confirmEmailSchema = {
    body:   z.object({
            email: z.string().email("Invalid email address"),
            code: z.string().regex(/^\d{6}$/, "OTP must be a 6-digit number")
        })
 }        

     

