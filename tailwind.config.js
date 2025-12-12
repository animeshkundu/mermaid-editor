/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: ["selector", ".dark"],
  theme: {
    container: {
      center: true,
      padding: "2rem",
    },
    extend: {
      screens: {
        coarse: { raw: "(pointer: coarse)" },
        fine: { raw: "(pointer: fine)" },
        pwa: { raw: "(display-mode: standalone)" },
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
      },
    },
  },
};