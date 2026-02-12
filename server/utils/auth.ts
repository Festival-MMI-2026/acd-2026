import { betterAuth } from "better-auth";
import { magicLink, admin } from "better-auth/plugins";
import { Pool } from "pg";
import { render } from "@vue-email/render";
import MagicLinkEmail from "../emails/MagicLinkEmail.vue";
import VerificationEmail from "../emails/VerificationEmail.vue";
import ResetPasswordEmail from "../emails/ResetPasswordEmail.vue";
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
    additionalFields: {
      firstName: {
        type: "string",
        defaultValue: "",
      },
      lastName: {
        type: "string",
        defaultValue: "",
      },
      tel: {
        type: "string",
        defaultValue: "",
      },
      iut: {
        type: "string",
        defaultValue: "",
      },
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
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      const appUrl = process.env.APP_URL || "http://localhost:3000";
      const html = await render(ResetPasswordEmail, {
        url,
        email: user.email,
        name: user.name,
        appUrl,
      });

      sendMail(
        user.email,
        "Réinitialisation de votre mot de passe - ACD",
        html,
      );
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      const appUrl = process.env.APP_URL || "http://localhost:3000";
      const html = await render(VerificationEmail, {
        url,
        email: user.email,
        name: user.name,
        appUrl,
      });

      sendMail(user.email, "Vérifiez votre adresse email - ACD", html);
    },
  },
  plugins: [
    magicLink({
      sendMagicLink: async ({ email, url }) => {
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
