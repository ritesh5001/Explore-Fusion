export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
      // Luxury travel palette (exact values from spec)
      // Keep existing token names to avoid large refactors.
      sand: '#F6F3EE', // primary background
      paper: '#FAF8F4', // section background
      card: '#FFFFFF',
      charcoal: '#2B2B2B', // primary text
      muted: '#6F6F6F',
      gold: '#C9A76A',
      olive: '#8A9A7B',
      border: 'rgba(0,0,0,0.06)',

      // Legacy aliases
      forest: '#2B2B2B',
      mountain: '#2B2B2B',
      trail: '#C9A76A',
      adventure: '#C9A76A',
      soft: 'rgba(0,0,0,0.06)',
      },
      fontFamily: {
    sans: ['Poppins', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        heading: ['Poppins', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
			shimmer: {
				'100%': { transform: 'translateX(100%)' },
			},
      },
      animation: {
        'fade-in': 'fade-in 260ms ease-out',
			shimmer: 'shimmer 1.2s infinite',
      },
    transitionTimingFunction: {
      'soft-out': 'cubic-bezier(0.22,1,0.36,1)',
      standard: 'cubic-bezier(0.4,0,0.2,1)',
    },
    transitionDuration: {
      120: '120ms',
      200: '200ms',
      400: '400ms',
      600: '600ms',
      800: '800ms',
    },
    },
  },
  plugins: [],
}