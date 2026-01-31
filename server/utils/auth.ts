import { betterAuth } from "better-auth";
import { magicLink } from "better-auth/plugins";
import { Pool } from "pg";
import nodemailer from "nodemailer";

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
        await transporter.sendMail({
          from: process.env.MAIL_FROM || "ACD <noreply@acd.local>",
          to: email,
          subject: "Votre lien de connexion ACD",
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #000;">Connexion à ACD</h1>
              <p>Cliquez sur le bouton ci-dessous pour vous connecter à votre compte :</p>
              <a href="${url}" style="display: inline-block; background: #000; color: #fff; padding: 12px 24px; border-radius: 9999px; text-decoration: none; margin: 16px 0;">
                Se connecter
              </a>
              <p style="color: #666; font-size: 14px;">Ce lien expire dans 5 minutes.</p>
              <p style="color: #666; font-size: 14px;">Si vous n'avez pas demandé ce lien, ignorez cet email.</p>
            </div>
          `,
        });
      },
      expiresIn: 300, // 5 minutes
    }),
  ],
});
