/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef4ff',
          100: '#dce8ff',
          500: '#2f5fd8',
          600: '#254bb0',
          700: '#1c3a8a',
        },
      },
    },
  },
  plugins: [],
};
