export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
			// Luxury travel × energetic tech palette
			// Keep existing token names to avoid large refactors.
			forest: '#0A1B3F', // primary deep navy
			trail: '#22D3EE', // accent cyan
			olive: '#60A5FA', // supporting blue
			mountain: '#0A1B3F', // headings (light mode)
			adventure: '#D6B25E', // premium gold
			gold: '#D6B25E',
			sand: '#F7F9FC', // surface light
			soft: '#E6ECF5',
			charcoal: '#0B1220', // surface dark / ink
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