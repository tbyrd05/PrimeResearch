/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563eb',
          hover: '#1d4ed8',
          dark: '#1e40af',
        },
        navy: {
          dark: '#012a52',
          DEFAULT: '#023c76',
        },
        slate: {
          dark: '#0f172a',
        },
        neutral: {
          800: '#1f2937',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'lg': '0.5rem',
      },
      backgroundImage: {
        'onyx-gate': 'linear-gradient(135deg, #012a52 0%, #0f172a 100%)',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries'),
  ],
}
