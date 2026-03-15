import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        background: "#0A0A0A", // Deep black
        secondary: "#111111",  // Subtle card bg
        accent: {
          primary: "#6366F1",  // Indigo
          success: "#22C55E",
          warning: "#F59E0B",
          danger: "#EF4444",
        },
        surface: "rgba(255, 255, 255, 0.03)", // Glass effect
        border: "rgba(255, 255, 255, 0.08)",
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
};
export default config;