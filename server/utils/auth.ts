import { betterAuth } from "better-auth";
import { magicLink, admin } from "better-auth/plugins";
import { Pool } from "pg";
import { render } from "@vue-email/render";
import MagicLinkEmail from "../emails/MagicLinkEmail.vue";
import { sendMail } from "./mail";

export const auth = betterAuth({
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
  },
  user: {
    deleteUser: {
      enabled: true,
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

        await sendMail(email, "Votre lien de connexion ACD", html);
      },
      expiresIn: 300, // 5 minutes
    }),
    admin(),
  ],
});
