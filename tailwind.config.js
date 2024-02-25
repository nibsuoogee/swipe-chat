/** @type {import('tailwindcss').Config} */
export default {
  content: ['./views/*.{pug, html}'],
  theme: {
    extend: {
      fontFamily: {
        manrope: ["Manrope", "sans-serif"],
      },
      colors: {
        accent: {
          1: 'hsl(var(--color-accent1) / <alpha-value>)',
          2: 'hsl(var(--color-accent2) / <alpha-value>)',
        },
        content: 'hsl(var(--color-content) / <alpha-value>)',
        text: 'hsl(var(--color-text) / <alpha-value>)',
      }
    },
  },
  plugins: [
    require('tailwind-scrollbar'),
  ],
}

