// https://nuxt.com/docs/api/configuration/nuxt-config

import tailwindcss from "@tailwindcss/vite";
import vue from "@vitejs/plugin-vue";
import { defineNuxtConfig } from "nuxt/config";

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  app: {
    head: {
      htmlAttrs: {
        lang: "fr",
      },
      title: "ACD MMI 2026",
    },
  },

  nitro: {
    rollupConfig: {
      plugins: [vue()],
    },
  },

  css: ["~/assets/css/tailwind.css"],
  vite: {
    plugins: [tailwindcss()],
  },

  modules: [
    "@nuxt/a11y",
    "@nuxt/content",
    "@nuxt/eslint",
    "@nuxt/fonts",
    "@nuxt/hints",
    "@nuxt/icon",
    "@nuxt/image",
    "@nuxt/scripts",
    "@nuxt/test-utils",
    "shadcn-nuxt",
    "@nuxtjs/color-mode",
  ],

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
