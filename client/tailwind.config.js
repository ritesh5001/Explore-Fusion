export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
      // Luxury palette (cream background, charcoal text, muted accents)
      // Keep existing token names to avoid large refactors.
      forest: '#2F5D50',
      trail: '#C46A2D',
      olive: '#6B8E23',
      mountain: '#1F3D2B',
      adventure: '#8B5A2B',
      gold: '#8B5A2B',
      sand: '#F5F1E8',
      soft: '#E5E7EB',
      charcoal: '#1F2933',
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
    },
  },
  plugins: [],
}