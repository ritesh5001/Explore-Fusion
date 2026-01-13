import { io } from 'socket.io-client';

export const socket = io('http://localhost:5050', {
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
