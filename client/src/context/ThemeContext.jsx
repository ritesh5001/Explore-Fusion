import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const ThemeContext = createContext(null);

const STORAGE_KEY = 'fusion:theme';

const applyThemeClass = () => {
	const root = document.documentElement;
	// Luxury UI is intentionally light-only.
	root.classList.remove('dark');
	root.dataset.theme = 'light';
};

export const ThemeProvider = ({ children }) => {
	const [theme, setTheme] = useState(() => 'light');

	useEffect(() => {
		applyThemeClass(theme);
		localStorage.setItem(STORAGE_KEY, 'light');
	}, [theme]);

	const toggleTheme = useCallback(() => {
		setTheme('light');
	}, []);

	const value = useMemo(() => ({ theme, setTheme, toggleTheme }), [theme, toggleTheme]);

	return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
	const ctx = useContext(ThemeContext);
	if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
	return ctx;
};
