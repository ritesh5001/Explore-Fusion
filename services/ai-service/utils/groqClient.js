const Groq = require('groq-sdk');

const isGroqConfigured = () => Boolean((process.env.GROQ_API_KEY || '').trim());

let client = null;

const getClient = () => {
	if (client) return client;
	if (!isGroqConfigured()) return null;
	client = new Groq({ apiKey: process.env.GROQ_API_KEY });
	return client;
};

async function generateText(prompt) {
	if (!isGroqConfigured()) {
		const err = new Error('Groq is not configured');
		err.status = 503;
		throw err;
	}

	const groq = getClient();
	if (!groq) {
		const err = new Error('Groq is not configured');
		err.status = 503;
		throw err;
	}

	const res = await groq.chat.completions.create({
		model: 'llama-3.1-8b-instant',
		messages: [
			{ role: 'system', content: 'You are a smart travel assistant for Explore Fusion.' },
			{ role: 'user', content: String(prompt || '') },
		],
	});

	const text = res?.choices?.[0]?.message?.content;
	if (!text) {
		const err = new Error('Empty response from AI provider');
		err.status = 502;
		throw err;
	}

	return String(text).trim();
}

module.exports = { generateText, isGroqConfigured };
