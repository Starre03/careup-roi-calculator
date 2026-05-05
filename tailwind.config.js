/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // CareUp brand — gescraped van careup.online
        careup: {
          50: '#f0fafd',
          100: '#daf3fa',
          200: '#b5e6f3',
          300: '#85d4ea',
          400: '#4ecae3', // accent
          500: '#69c8e7', // primary (hoofdkleur)
          600: '#3aaecf',
          700: '#2c8ba8',
          800: '#236d83',
          900: '#1c5366',
        },
        ink: {
          DEFAULT: '#3a3a3a',
          soft: '#555d66',
          muted: '#7a8189',
          light: '#b8bcc1',
        },
        surface: {
          white: '#ffffff',
          alt: '#fafafa',
          panel: '#f2f5f7',
          line: '#eeeeee',
        },
        savings: {
          DEFAULT: '#2d6e3e',
          light: '#e8f3eb',
          dark: '#1f5230',
        },
        loss: {
          DEFAULT: '#a83232',
          light: '#fbeaea',
        },
      },
      fontFamily: {
        // CareUp gebruikt Quicksand voor headings, Roboto voor body
        heading: ['Quicksand', 'system-ui', 'sans-serif'],
        sans: ['Roboto', 'Helvetica', 'Arial', 'sans-serif'],
        serif: ['Quicksand', 'Georgia', 'serif'],
      },
      borderRadius: {
        DEFAULT: '3px', // CareUp gebruikt 3px
        sm: '2px',
        md: '4px',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(0,0,0,0.04), 0 2px 8px rgba(0,0,0,0.04)',
        card: '0 4px 20px rgba(105, 200, 231, 0.08)',
      },
    },
  },
  plugins: [],
};
