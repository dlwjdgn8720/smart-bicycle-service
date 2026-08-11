/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: "#0a0a0a",
          deep: "#080808",
        },
        card: {
          DEFAULT: "#141414",
          light: "#171717",
        },
        border: {
          DEFAULT: "#242424",
        },
        neon: {
          DEFAULT: "#C6FF00",
          dark: "#9FCC00",
        },
        bike: {
          DEFAULT: "#38BDF8",
          dark: "#0EA5E9",
        },
        warn: "#F97316",
        danger: "#EF4444",
      },
      fontFamily: {
        sans: ["Pretendard", "Noto Sans KR", "-apple-system", "sans-serif"],
      },
      keyframes: {
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
      },
      animation: {
        marquee: "marquee 28s linear infinite",
      },
    },
  },
  plugins: [],
};
