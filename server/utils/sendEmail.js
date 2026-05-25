// const nodemailer = require('nodemailer');

// const sendEmail = async (options) => {
//   // 1. Create a transporter object using professional environment credentials
//   const transporter = nodemailer.createTransport({
//     host: process.env.EMAIL_HOST || 'smtp.ethereal.email',
//     port: process.env.EMAIL_PORT || 587,
//     auth: {
//       user: process.env.EMAIL_USER, // Your SMTP username
//       pass: process.env.EMAIL_PASSWORD, // Your SMTP password or App Password
//     },
//   });

//   // 2. Define professional HTML email layout templates
//   const mailOptions = {
//     from: `"Business Nexus Support" <${process.env.EMAIL_FROM || 'noreply@businessnexus.com'}>`,
//     to: options.email,
//     subject: options.subject,
//     text: options.message, // Plain text fallback
//     html: `
//       <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; color: #333333; line-height: 1.6;">
//         <div style="background-color: #4f46e5; padding: 24px; text-align: center; border-radius: 8px 8px 0 0;">
//           <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Business Nexus</h1>
//         </div>
//         <div style="padding: 32px; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
//           <p style="font-size: 16px;">Hello,</p>
//           <p style="font-size: 16px;">We received a request to securely reset your Business Nexus account password. Click the button below to complete the recovery setup process:</p>
//           <div style="text-align: center; margin: 32px 0;">
//             <a href="${options.resetUrl}" target="_blank" style="background-color: #4f46e5; color: #ffffff; padding: 14px 28px; font-weight: bold; text-decoration: none; border-radius: 6px; display: inline-block;">
//               Reset My Password
//             </a>
//           </div>
//           <p style="font-size: 14px; color: #6b7280;">This secure link is active for the next 60 minutes. If you did not initiate this configuration request, you can safely ignore this automated message.</p>
//           <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
//           <p style="font-size: 12px; color: #9ca3af; text-align: center;">
//             If the button above does not work, copy and paste this link into your browser address bar:<br/>
//             <a href="${options.resetUrl}" style="color: #4f46e5; word-break: break-all;">${options.resetUrl}</a>
//           </p>
//         </div>
//       </div>
//     `,
//   };

//   // 3. Dispatch email delivery call
//   await transporter.sendMail(mailOptions);
// };

// module.exports = sendEmail;
const nodemailer = require('nodemailer');

const sendEmail = async (options) => {

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: `"Business Nexus Support" <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: `
      <div>
        <h2>Business Nexus</h2>
        <p>Reset your password:</p>

        <a href="${options.resetUrl}">
          Reset Password
        </a>

        <p>${options.resetUrl}</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;