import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const ToastContext = createContext(null);

let nextId = 1;

export const ToastProvider = ({ children }) => {
	const [toasts, setToasts] = useState([]);

	const removeToast = useCallback((id) => {
		setToasts((prev) => prev.filter((t) => t.id !== id));
	}, []);

	const showToast = useCallback((message, type = 'info', opts = {}) => {
		const id = nextId++;
		const timeoutMs = Number(opts.timeoutMs ?? 3500);
		setToasts((prev) => [...prev, { id, message, type }]);
		if (timeoutMs > 0) {
			window.setTimeout(() => removeToast(id), timeoutMs);
		}
		return id;
	}, [removeToast]);

	const value = useMemo(() => ({ showToast }), [showToast]);

	return (
		<ToastContext.Provider value={value}>
			{children}
			<div className="fixed top-4 right-4 z-50 space-y-2">
				{toasts.map((t) => (
					<div
						key={t.id}
						className={`min-w-[240px] max-w-sm rounded-lg shadow border px-4 py-3 bg-white ${
							t.type === 'success'
								? 'border-green-200'
								: t.type === 'error'
									? 'border-red-200'
									: 'border-gray-200'
						}`}
					>
						<div className="flex items-start justify-between gap-3">
							<div
								className={`text-sm ${
									t.type === 'success'
										? 'text-green-700'
										: t.type === 'error'
											? 'text-red-700'
											: 'text-gray-700'
								}`}
							>
								{t.message}
							</div>
							<button
								onClick={() => removeToast(t.id)}
								className="text-gray-400 hover:text-gray-600"
								aria-label="Dismiss"
							>
								×
							</button>
						</div>
					</div>
				))}
			</div>
		</ToastContext.Provider>
	);
};

export const useToast = () => {
	const ctx = useContext(ToastContext);
	if (!ctx) throw new Error('useToast must be used within ToastProvider');
	return ctx;
};
