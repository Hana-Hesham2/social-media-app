import * as z from "zod";
import { confirmEmailSchema, signInSchema, signUpSchema } from "./auth.validation";


// export interface signUpType {
//     userName: string;
//     email: string;
//     password: string;
//     age: number;
//     gender?: string;
//     address?: string;
//     phone?: string;
// }


export type SignupDto = z.infer<typeof signUpSchema.body>;

export type ConfirmEmailDto = z.infer<typeof confirmEmailSchema.body>;

export type SignInDto = z.infer<typeof signInSchema.body>;


