import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

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

	useEffect(() => {
		const onToast = (e) => {
			const detail = e?.detail || {};
			const message = detail?.message;
			if (!message) return;
			showToast(String(message), detail?.type || 'info', { timeoutMs: detail?.timeoutMs });
		};
		window.addEventListener('fusion:toast', onToast);
		return () => window.removeEventListener('fusion:toast', onToast);
	}, [showToast]);

	return (
		<ToastContext.Provider value={value}>
			{children}
			<div className="fixed top-4 right-4 z-50 space-y-2" aria-live="polite" aria-relevant="additions">
				<AnimatePresence initial={false}>
					{toasts.map((t) => (
						<motion.div
							key={t.id}
							initial={{ opacity: 0, y: -8, filter: 'blur(6px)' }}
							animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
							exit={{ opacity: 0, y: -10, filter: 'blur(6px)' }}
							transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
							className={`min-w-[240px] max-w-sm rounded-2xl shadow border px-4 py-3 bg-white/80 backdrop-blur-md dark:bg-white/8 ${
								t.type === 'success'
									? 'border-emerald-300/50'
									: t.type === 'error'
										? 'border-red-300/50'
										: 'border-soft/80 dark:border-white/10'
							}`}
						>
							<div className="flex items-start justify-between gap-3">
								<div
									className={`text-sm ${
										t.type === 'success'
											? 'text-emerald-700 dark:text-emerald-300'
										: t.type === 'error'
											? 'text-red-700 dark:text-red-300'
										: 'text-charcoal/80 dark:text-sand/80'
									}`}
								>
									{t.message}
								</div>
								<button
									onClick={() => removeToast(t.id)}
									className="text-charcoal/40 hover:text-charcoal/70 dark:text-sand/40 dark:hover:text-sand/80"
									aria-label="Dismiss"
								>
									×
								</button>
							</div>
						</motion.div>
					))}
				</AnimatePresence>
			</div>
		</ToastContext.Provider>
	);
};

export const useToast = () => {
	const ctx = useContext(ToastContext);
	if (!ctx) throw new Error('useToast must be used within ToastProvider');
	return ctx;
};
