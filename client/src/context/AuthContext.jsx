import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import API from '../api';
import { disconnectSocket, setSocketAuthToken } from '../utils/socket';

export const AuthContext = createContext(null);

const safeJsonParse = (raw) => {
	try {
		return raw ? JSON.parse(raw) : null;
	} catch {
		return null;
	}
};

const readInitialAuth = () => {
	const token = localStorage.getItem('token') || null;
	const user = safeJsonParse(localStorage.getItem('user')) || null;
	return { token, user };
};

export const AuthProvider = ({ children }) => {
	const [{ token, user }, setAuthState] = useState(() => readInitialAuth());
	const [loading, setLoading] = useState(Boolean(token));

	// Keep auth state in sync when other modules clear storage (e.g. API 401 interceptor).
	useEffect(() => {
		const onAuthEvent = () => {
			const next = readInitialAuth();
			setAuthState(next);
			setSocketAuthToken(next.token);
			if (!next.token) disconnectSocket();
		};
		window.addEventListener('fusion:auth', onAuthEvent);
		return () => window.removeEventListener('fusion:auth', onAuthEvent);
	}, []);

	const persist = useCallback((nextToken, nextUser) => {
		if (nextToken) localStorage.setItem('token', nextToken);
		else localStorage.removeItem('token');

		if (nextUser) localStorage.setItem('user', JSON.stringify(nextUser));
		else localStorage.removeItem('user');
	}, []);

	const clear = useCallback(() => {
		localStorage.removeItem('token');
		localStorage.removeItem('user');
		disconnectSocket();
		setAuthState({ token: null, user: null });
	}, []);

	const fetchMe = useCallback(async () => {
		if (!token) {
			setAuthState({ token: null, user: null });
			return null;
		}

		setLoading(true);
		try {
			const res = await API.get('/auth/me');
			const me = res?.data?.data ?? null;
			setAuthState({ token, user: me });
			persist(token, me);
			return me;
		} catch (err) {
			const status = err?.response?.status;
			// If token is invalid/expired/blocked, clear the session.
			if (status === 401 || status === 403) {
				clear();
			}
			throw err;
		} finally {
			setLoading(false);
		}
	}, [token, persist, clear]);

	const login = useCallback(
		async (email, password) => {
			const normalizedEmail = String(email || '').trim().toLowerCase();
			if (!normalizedEmail || !password) {
				throw new Error('Please provide email and password');
			}

			setLoading(true);
			try {
				const res = await API.post('/auth/login', { email: normalizedEmail, password });
				const nextToken = res?.data?.data?.token;
				const loginUser = res?.data?.data?.user ?? null;
				if (!nextToken) throw new Error('Login failed: token missing');

				setAuthState({ token: nextToken, user: loginUser });
				persist(nextToken, loginUser);

				// Refresh safe user from /me (optional but keeps state consistent)
				try {
					const meRes = await API.get('/auth/me', {
						headers: { Authorization: `Bearer ${nextToken}` },
					});
					const me = meRes?.data?.data ?? null;
					setAuthState({ token: nextToken, user: me || loginUser });
					persist(nextToken, me || loginUser);
				} catch {
					// keep login response user
				}

				return nextToken;
			} catch (err) {
				const status = err?.response?.status;
				const serverMessage = err?.response?.data?.message || err?.response?.data?.error;
				const message = serverMessage || err?.message || 'Login failed';
				throw new Error(`${message}${status ? ` (HTTP ${status})` : ''}`);
			} finally {
				setLoading(false);
			}
		},
		[persist]
	);

	const register = useCallback(
		async (name, email, password) => {
			const normalizedName = String(name || '').trim();
			const normalizedEmail = String(email || '').trim().toLowerCase();
			if (!normalizedName || !normalizedEmail || !password) {
				throw new Error('Please provide name, email and password');
			}

			setLoading(true);
			try {
				const res = await API.post('/auth/register', {
					name: normalizedName,
					email: normalizedEmail,
					password,
				});
				const nextToken = res?.data?.data?.token;
				const regUser = res?.data?.data?.user ?? null;

				if (!nextToken) throw new Error('Registration failed: token missing');
				setAuthState({ token: nextToken, user: regUser });
				persist(nextToken, regUser);

				try {
					const meRes = await API.get('/auth/me', {
						headers: { Authorization: `Bearer ${nextToken}` },
					});
					const me = meRes?.data?.data ?? null;
					setAuthState({ token: nextToken, user: me || regUser });
					persist(nextToken, me || regUser);
				} catch {
					// keep register response user
				}

				return nextToken;
			} catch (err) {
				const status = err?.response?.status;
				const serverMessage = err?.response?.data?.message || err?.response?.data?.error;
				const message = serverMessage || err?.message || 'Registration failed';
				throw new Error(`${message}${status ? ` (HTTP ${status})` : ''}`);
			} finally {
				setLoading(false);
			}
		},
		[persist]
	);

	const logout = useCallback(() => {
		clear();
	}, [clear]);

	// Keep socket auth in sync with current token.
	useEffect(() => {
		setSocketAuthToken(token);
		if (!token) disconnectSocket();
	}, [token]);

	// On initial app load, if token exists, validate it.
	useEffect(() => {
		let ignore = false;
		const init = async () => {
			if (!token) {
				setLoading(false);
				return;
			}
			try {
				await fetchMe();
			} catch {
				// handled by fetchMe
			}
			if (!ignore) setLoading(false);
		};
		init();
		return () => {
			ignore = true;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const value = useMemo(
		() => ({
			user,
			token,
			loading,
			isAuthenticated: Boolean(token),
			role: user?.role,
			login,
			register,
			logout,
			fetchMe,
		}),
		[user, token, loading, login, register, logout, fetchMe]
	);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
