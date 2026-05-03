import { resolve } from "path";
import{ config }from "dotenv";

const NODE_ENV = process.env.NODE_ENV || "development";

config({ path: resolve(__dirname, `../../.env.${NODE_ENV}`) });

export const PORT:number = Number(process.env.PORT) || 3000;
export const MONGO_URI:string = process.env.MONGO_URI!; 
export const SALT_ROUNDS:number = Number(process.env.SALT_ROUNDS);
export const ACCESS_SECRET_KEY_USER:string = process.env.ACCESS_SECRET_KEY_USER!;
export const ACCESS_SECRET_KEY_ADMIN:string = process.env.ACCESS_SECRET_KEY_ADMIN!;
export const REFRESH_SECRET_KEY_USER:string = process.env.REFRESH_SECRET_KEY_USER!;
export const REFRESH_SECRET_KEY_ADMIN:string = process.env.REFRESH_SECRET_KEY_ADMIN!;
export const PREFIX:string = process.env.PREFIX!;
export const REDIS_URL:string = process.env.REDIS_URL!;
export const EMAIL:string = process.env.EMAIL!;
export const PASS :string = process.env.PASS!;
export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
