import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        plum: "#35D7BB",
        "bg-primary": "#ffffff",
        "bg-sidebar": "#2B2F36",
        "bg-navbar": "#373D49",
        "bg-highlight": "#1D212A",
        "bg-button-save": "#4A5261",
        "text-primary": "#373D49",
        "text-invert": "#ffffff",
        "text-muted": "#A0AABF",
        "border-light": "#E8E8E8",
        "border-settings": "#4F535B",
        "icon-default": "#D3DAEA",
        "dropdown-link": "#D0D6E2",
        switchery: "#4B5363",
      },
      fontFamily: {
        sans: ['"Source Sans Pro"', '"Helvetica Neue"', "Helvetica", "Arial", "sans-serif"],
        serif: ["Georgia", "Cambria", "serif"],
        mono: ['"Ubuntu Mono"', "Monaco", "monospace"],
      },
      spacing: {
        sidebar: "270px",
        gutter: "32px",
      },
      zIndex: {
        sidebar: "1",
        page: "2",
        editor: "3",
        preview: "4",
        overlay: "5",
        navbar: "6",
        settings: "7",
      },
      keyframes: {
        "slide-in-from-right": {
          "0%": { transform: "translateX(100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
      },
      animation: {
        "in": "slide-in-from-right 0.2s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
