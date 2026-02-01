import type { TailwindConfig } from "@vue-email/tailwind";

export default {
  theme: {
    fontSize: {
      xs: ["12px", { lineHeight: "16px" }],
      sm: ["14px", { lineHeight: "20px" }],
      base: ["16px", { lineHeight: "24px" }],
      lg: ["18px", { lineHeight: "28px" }],
      xl: ["20px", { lineHeight: "28px" }],
      "2xl": ["24px", { lineHeight: "32px" }],
      "3xl": ["30px", { lineHeight: "36px" }],
      "4xl": ["36px", { lineHeight: "36px" }],
    },
    spacing: {
      px: "1px",
      0: "0",
      0.5: "2px",
      1: "4px",
      1.5: "6px",
      2: "8px",
      2.5: "10px",
      3: "12px",
      3.5: "14px",
      4: "16px",
      5: "20px",
      6: "24px",
      7: "28px",
      8: "32px",
      9: "36px",
      10: "40px",
      12: "48px",
      14: "56px",
      16: "64px",
    },
    extend: {
      colors: {
        background: "#f6f9fc",
        foreground: "#000000",
        muted: "#a4a4a4",
        "muted-foreground": "#525252",
        border: "#e4e4e4",
        primary: "#000000",
        "primary-foreground": "#ffffff",
      },
      borderRadius: {
        full: "9999px",
        "2xl": "16px",
      },
    },
  },
} satisfies TailwindConfig;
