/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        brand: {
          50:  '#f0f4ff',
          100: '#e0eaff',
          500: '#4f6ef7',
          600: '#3d5be0',
          700: '#2d47c9',
        },
        surface: '#f8f9fc',
        card: '#ffffff',
      },
    },
  },
  plugins: [],
}