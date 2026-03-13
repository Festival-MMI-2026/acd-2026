import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "localhost",
  port: Number(process.env.SMTP_PORT) || 1025,
  secure: false,
  ...(process.env.SMTP_USER
    ? {
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      }
    : {}),
});

export async function sendMail(
  to: string,
  subject: string,
  html: string,
  attachments?: nodemailer.SendMailOptions["attachments"],
) {
  return transporter.sendMail({
    from: process.env.MAIL_FROM || "ACD <noreply@acd.local>",
    to,
    subject,
    html,
    attachments,
  });
}
