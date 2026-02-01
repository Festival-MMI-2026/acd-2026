import { betterAuth } from "better-auth";
import { magicLink } from "better-auth/plugins";
import { Pool } from "pg";
import nodemailer from "nodemailer";
import { render } from "@vue-email/render";
import MagicLinkEmail from "../emails/MagicLinkEmail.vue";

// Configure nodemailer transporter for Mailpit (local dev)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "localhost",
  port: Number(process.env.SMTP_PORT) || 1025,
  secure: false,
});

export const auth = betterAuth({
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
  },
  experimental: { joins: true },
  database: new Pool({
    connectionString:
      process.env.DATABASE_URL ||
      "postgres://admin:password@localhost:5432/acd_db",
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    magicLink({
      sendMagicLink: async ({ email, url }, request) => {
        // Render Vue email template to HTML
        const appUrl = process.env.APP_URL || "http://localhost:3000";
        const html = await render(MagicLinkEmail, {
          url,
          email,
          appUrl,
        });

        await transporter.sendMail({
          from: process.env.MAIL_FROM || "ACD <noreply@acd.local>",
          to: email,
          subject: "Votre lien de connexion ACD",
          html,
        });
      },
      expiresIn: 300, // 5 minutes
    }),
  ],
});
