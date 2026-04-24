// import fs from "fs";
// import path from "path";
// import { sendEmail } from "./send.email";

// export const sendWelcomeEmail = async (
//   user: { firstName: string; email: string },
//   link: string
// ) => {
//     const template = fs.readFileSync(
//         path.join(__dirname, "email.template.html"),
//         "utf-8"
//     ); 

//     const html = template
//   .replace("{{userName}}", user.firstName)
//   .replace("{{buttonLink}}", link)
//   .replace("{{title}}", "Welcome")
//   .replace("{{content}}", "Thanks for joining 🎉")
//   .replace("{{buttonText}}", "Verify Email");


//     return await sendEmail({
//         to: user.email,
//         subject: "Welcome",
//         html
//     });
// };