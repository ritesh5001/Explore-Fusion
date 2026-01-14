const { GoogleGenerativeAI } = require('@google/generative-ai');

const parseRetryAfterSeconds = (error) => {
	const details = Array.isArray(error?.errorDetails) ? error.errorDetails : [];
	const retryInfo = details.find((d) => d && d['@type'] === 'type.googleapis.com/google.rpc.RetryInfo');
	const raw = retryInfo?.retryDelay;
	if (typeof raw !== 'string') return null;
	const match = raw.match(/^(\d+)s$/);
	return match ? Number(match[1]) : null;
};

const getConfiguredModelCandidates = () => {
	const configured = (process.env.GEMINI_MODEL || '').trim();
	const candidates = [configured, 'gemini-2.0-flash', 'gemini-1.5-flash'].filter(Boolean);
	return [...new Set(candidates)];
};

const getClient = () => {
	const key = (process.env.GEMINI_API_KEY || '').trim();
	if (!key) return null;
	try {
		return new GoogleGenerativeAI(key);
	} catch {
		return null;
	}
};

let cachedClient = null;

const isGeminiConfigured = () => {
	if (!cachedClient) cachedClient = getClient();
	return Boolean(cachedClient);
};

const generateText = async ({ systemPrompt, userMessage }) => {
	if (!cachedClient) cachedClient = getClient();
	if (!cachedClient) {
		const err = new Error('Gemini is not configured');
		err.status = 503;
		throw err;
	}

	const prompt = `${String(systemPrompt || '').trim()}\n\nUser: ${String(userMessage || '').trim()}\n\nAssistant:`;
	const candidates = getConfiguredModelCandidates();
	let lastError;

	for (const modelName of candidates) {
		try {
			const model = cachedClient.getGenerativeModel({ model: modelName });
			const result = await model.generateContent(prompt);
			const response = await result.response;
			const text = String(response.text() ?? '').trim();
			if (!text) {
				const err = new Error('Empty response from Gemini');
				err.status = 502;
				throw err;
			}
			return { text, model: modelName };
		} catch (e) {
			lastError = e;
			const status = e?.status;

			if (status === 503 || status === 404) {
				continue;
			}

			if (status === 429) {
				const retryAfterSeconds = parseRetryAfterSeconds(e);
				const err = new Error(
					retryAfterSeconds
						? `Gemini rate-limited. Try again in ~${retryAfterSeconds}s.`
						: 'Gemini rate-limited. Please try again shortly.'
				);
				err.status = 429;
				err.retryAfterSeconds = retryAfterSeconds ?? null;
				throw err;
			}

			break;
		}
	}

	const err = new Error(lastError?.message || 'Gemini request failed');
	err.status = lastError?.status || 503;
	throw err;
};

module.exports = {
	isGeminiConfigured,
	generateText,
};
