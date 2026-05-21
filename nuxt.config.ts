// https://nuxt.com/docs/api/configuration/nuxt-config

import tailwindcss from "@tailwindcss/vite";
import vue from "@vitejs/plugin-vue";
import { defineNuxtConfig } from "nuxt/config";
import { version } from "./package.json";

export default defineNuxtConfig({
  appConfig: { version },
  compatibilityDate: "2025-07-15",
  devtools: { enabled: false },

  app: {
    head: {
      htmlAttrs: {
        lang: "fr",
      },
      title: "ACD MMI 2026",
      link: [
        { rel: "icon", type: "image/svg+xml", href: "/logo.svg" },
        {
          rel: "icon",
          type: "image/png",
          sizes: "32x32",
          href: "/favicon-32.png",
        },
        {
          rel: "icon",
          type: "image/png",
          sizes: "16x16",
          href: "/favicon-16.png",
        },
        {
          rel: "apple-touch-icon",
          sizes: "180x180",
          href: "/apple-touch-icon.png",
        },
        { rel: "shortcut icon", href: "/favicon.ico" },
      ],
    },
  },

  nitro: {
    rollupConfig: {
      plugins: [vue() as any],
    },
  },

  css: ["~/assets/css/tailwind.css"],
  vite: {
    plugins: [tailwindcss()],
  },

  modules: [
    "@nuxt/a11y",
    "@nuxt/eslint",
    "@nuxt/fonts",
    "@nuxt/icon",
    "@nuxt/image",
    "@nuxt/scripts",
    "@nuxt/test-utils",
    "shadcn-nuxt",
    "@nuxtjs/color-mode",
    "motion-v/nuxt",
  ],

  colorMode: {
    preference: "light",
    fallback: "light",
    classSuffix: "",
  },

  shadcn: {
    /**
     * Prefix for all the imported component.
     * @default "Ui"
     */
    prefix: "",
    /**
     * Directory that the component lives in.
     * Will respect the Nuxt aliases.
     * @link https://nuxt.com/docs/api/nuxt-config#alias
     * @default "@/components/ui"
     */
    componentDir: "@/components/ui",
  },
});
