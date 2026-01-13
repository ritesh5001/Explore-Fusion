import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const ThemeContext = createContext(null);

const STORAGE_KEY = 'fusion:theme';

const applyThemeClass = (mode) => {
	const root = document.documentElement;
	const isDark = mode === 'dark';
	root.classList.toggle('dark', isDark);
	root.dataset.theme = mode;
};

export const ThemeProvider = ({ children }) => {
	// Default: dark mode (per requirement)
	const [theme, setTheme] = useState('dark');

	useEffect(() => {
		const saved = localStorage.getItem(STORAGE_KEY);
		const next = saved === 'light' || saved === 'dark' ? saved : 'dark';
		setTheme(next);
		applyThemeClass(next);
	}, []);

	useEffect(() => {
		applyThemeClass(theme);
		localStorage.setItem(STORAGE_KEY, theme);
	}, [theme]);

	const toggleTheme = useCallback(() => {
		setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
	}, []);

	const value = useMemo(() => ({ theme, setTheme, toggleTheme }), [theme, toggleTheme]);

	return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
	const ctx = useContext(ThemeContext);
	if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
	return ctx;
};
