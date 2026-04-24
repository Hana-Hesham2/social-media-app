import nodemailer from "nodemailer";
import { EMAIL, PASS } from "../../../config/config.service";
import Mail from "nodemailer/lib/mailer";

export const sendEmail = async (SendMailOptions: Mail.Options) => {

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: EMAIL,
            pass: PASS
        }
    });

    const info = await transporter.sendMail({
        from: EMAIL,
        ...SendMailOptions
    });

    console.log("Email sent: ", info.messageId);
    return info.accepted.length ? true : false;
};

export const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000);
};