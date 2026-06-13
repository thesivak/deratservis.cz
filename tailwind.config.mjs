/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Roboto", "ui-sans-serif", "system-ui", "sans-serif"],
        orbitron: ["Orbitron", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      colors: {
        "custom-red": "#c2410c"
      }
    }
  },
  plugins: [require("@tailwindcss/typography")]
};
