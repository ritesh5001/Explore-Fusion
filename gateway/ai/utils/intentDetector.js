const INTENTS = {
	PLAN_TRIP: 'PLAN_TRIP',
	BUDGET_TRIP: 'BUDGET_TRIP',
	SUGGEST_PLACES: 'SUGGEST_PLACES',
	CREATE_PACKAGE: 'CREATE_PACKAGE',
	SUMMARIZE: 'SUMMARIZE',
	HELP: 'HELP',
	CHAT: 'CHAT',
};

const normalize = (value) => String(value || '').toLowerCase();

const includesAny = (haystack, needles) => needles.some((n) => haystack.includes(n));

const detectIntent = (message) => {
	const text = normalize(message);
	if (!text.trim()) return INTENTS.CHAT;

	// Order matters (most specific/high-value first)
	if (includesAny(text, ['plan', 'itinerary'])) return INTENTS.PLAN_TRIP;
	if (includesAny(text, ['budget', 'cost'])) return INTENTS.BUDGET_TRIP;
	if (includesAny(text, ['suggest', 'recommend'])) return INTENTS.SUGGEST_PLACES;
	if (includesAny(text, ['create tour', 'package'])) return INTENTS.CREATE_PACKAGE;
	if (includesAny(text, ['summarize', 'short'])) return INTENTS.SUMMARIZE;
	if (includesAny(text, ['help', 'commands'])) return INTENTS.HELP;
	return INTENTS.CHAT;
};

module.exports = {
	INTENTS,
	detectIntent,
};
