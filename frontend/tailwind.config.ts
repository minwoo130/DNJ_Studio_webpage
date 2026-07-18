import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          red: "#e11d2e",
          orange: "#ff8a00",
        },
      },
      fontFamily: {
        pretendard: [
          "Pretendard Variable",
          "Pretendard",
          "-apple-system",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};

export default config;
