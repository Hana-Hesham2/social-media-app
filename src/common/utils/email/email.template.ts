// interface EmailTemplateProps {
//     title: string;
//     userName?: string;
//     content: string;
//     buttonText?: string;
//     buttonLink?: string;
// }

export const EmailTemplate = (otp: number) => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Social App</title>
</head>

<body style="margin:0; padding:0; background:#f4f4f4; font-family:Arial, sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="padding:20px; background:#f4f4f4;">
    <tr>
      <td align="center">

        <table width="600" cellpadding="0" cellspacing="0" 
               style="background:#ffffff; border-radius:10px; padding:20px; text-align:center;">

          <!-- Title -->
          <tr>
            <td>
              <h2>Social App</h2>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td>
              <p style="font-size:16px; color:#333;">
                You have received a new message
              </p>
            </td>
          </tr>

          <!-- OTP -->
          <tr>
            <td>
              <h1 style="color:#4CAF50; letter-spacing:5px;">
                ${otp}
              </h1>
            </td>
          </tr>

          <!-- Button -->
          <tr>
            <td style="padding-top:20px;">
              <a href="#"
                 style="
                    display:inline-block;
                    padding:12px 20px;
                    background:#4CAF50;
                    color:white;
                    text-decoration:none;
                    border-radius:5px;
                 ">
                View Message
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td>
              <p style="margin-top:20px; font-size:12px; color:gray;">
                If you didn’t request this, ignore this email.
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
    `;
};