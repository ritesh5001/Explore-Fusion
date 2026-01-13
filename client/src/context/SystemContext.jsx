import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const SystemContext = createContext(null);

const STORAGE_KEY = 'fusion:system-controls';

const safeParse = (raw) => {
	try {
		return JSON.parse(raw);
	} catch {
		return null;
	}
};

export const SystemProvider = ({ children }) => {
	const [maintenanceMode, setMaintenanceMode] = useState(false);
	const [readOnlyMode, setReadOnlyMode] = useState(false);

	useEffect(() => {
		const saved = safeParse(localStorage.getItem(STORAGE_KEY) || '');
		if (saved && typeof saved === 'object') {
			setMaintenanceMode(Boolean(saved.maintenanceMode));
			setReadOnlyMode(Boolean(saved.readOnlyMode));
		}
	}, []);

	useEffect(() => {
		localStorage.setItem(
			STORAGE_KEY,
			JSON.stringify({ maintenanceMode: Boolean(maintenanceMode), readOnlyMode: Boolean(readOnlyMode) })
		);
	}, [maintenanceMode, readOnlyMode]);

	const value = useMemo(
		() => ({
			maintenanceMode,
			readOnlyMode,
			setMaintenanceMode,
			setReadOnlyMode,
		}),
		[maintenanceMode, readOnlyMode]
	);

	return <SystemContext.Provider value={value}>{children}</SystemContext.Provider>;
};

export const useSystem = () => {
	const ctx = useContext(SystemContext);
	if (!ctx) throw new Error('useSystem must be used within SystemProvider');
	return ctx;
};
