export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: '#2F5D50',
        olive: '#6B8E23',
        mountain: '#1F3D2B',
        adventure: '#8B5A2B',
        trail: '#C46A2D',
        sand: '#F5F1E8',
        soft: '#E5E7EB',
        charcoal: '#1F2933',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        heading: ['Poppins', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 260ms ease-out',
      },
    },
  },
  plugins: [],
}