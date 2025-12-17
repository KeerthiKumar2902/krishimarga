/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0fdf4', // Very light green (backgrounds)
          100: '#dcfce7', // Light green (hover states)
          500: '#22c55e', // Primary Green (buttons, highlights)
          600: '#16a34a', // Darker Green (text)
          900: '#14532d', // Deep Green (headings)
        }
      }
    },
  },
  plugins: [],
}