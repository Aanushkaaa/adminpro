/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Metallic Chic Palette (#3D52A0, #7091E6, #8697C4, #ADB8DA, #EDE8F5)
        metallic: {
          dark: '#3D52A0',
          blue: '#7091E6',
          slate: '#8697C4',
          ice: '#ADB8DA',
          bg: '#EDE8F5',
        },
        indigo: {
          50: '#F5F3FA',
          100: '#EDE8F5', // Light Ice Tint
          200: '#C7CEE8',
          300: '#ADB8DA', // Ice Steel Tint
          400: '#8697C4', // Soft Steel Slate
          500: '#7091E6', // Vibrant Steel Blue
          600: '#3D52A0', // Deep Royal Steel (Main Primary Buttons & Active Elements)
          700: '#2E3F80', // Slate Steel Hover
          800: '#212E63',
          900: '#151D45',
        },
        amber: {
          50: '#F7F6FD',
          100: '#EDE8F5',
          200: '#ADB8DA',
          300: '#8697C4',
          700: '#3D52A0',
          800: '#2E3F80',
          900: '#151D45',
        }
      }
    },
  },
  plugins: [],
}
