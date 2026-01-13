import { io } from 'socket.io-client';
import { getSocketUrl } from './runtimeUrls';

export const socket = io(getSocketUrl(), {
	autoConnect: false,
});

export const setSocketAuthToken = (token) => {
	if (token) {
		socket.auth = { token };
	} else {
		// Avoid sending stale tokens on reconnect.
		socket.auth = {};
	}
};

export const disconnectSocket = () => {
	try {
		socket.disconnect();
	} catch {
		// no-op
	}
};
