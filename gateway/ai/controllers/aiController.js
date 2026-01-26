const { INTENTS, detectIntent } = require('../utils/intentDetector');
const { isGroqConfigured, generateText } = require('../utils/groqClient');


const buildFallbackPlan = ({ destination, days, budget, note, retryAfterSeconds }) => {
  const safeDays = Math.max(1, Number(days) || 3);
  const safeBudget = Number(budget) || 1000;
  const safeDestination = destination || 'your destination';

  const itinerary = Array.from({ length: safeDays }, (_, index) => {
    const day = index + 1;
    const plan =
      day === 1
        ? 'Arrival + check-in\nEvening local food walk\nSunset viewpoint'
        : day === safeDays
          ? 'Relaxed morning\nSouvenir shopping\nDeparture'
          : 'Breakfast\nCity highlights\nOptional museum or beach time\nDinner recommendation';
    return {
      day,
      plan,
      cost: Math.max(10, Math.round(safeBudget / (safeDays * 4))),
    };
  });

  return {
    estimated_cost: safeBudget,
    currency: 'USD',
    itinerary,
    note,
    destination: safeDestination,
    days: safeDays,
    ai_used: false,
    retryAfterSeconds: retryAfterSeconds ?? null,
  };
};

const stringifyPlan = (value) => {
  if (typeof value === 'string') return value.trim();
  if (Array.isArray(value)) {
    return value
      .map((v) => stringifyPlan(v))
      .filter(Boolean)
      .map((v) => (v.startsWith('-') || v.startsWith('•') ? v : `• ${v}`))
      .join('\n');
  }
  if (value && typeof value === 'object') {
    const lines = [];
    for (const [k, v] of Object.entries(value)) {
      const inner = stringifyPlan(v);
      if (!inner) continue;
      lines.push(`${k}: ${inner.replace(/\n/g, ' ')}`);
    }
    return lines.length ? lines.map((l) => `• ${l}`).join('\n') : JSON.stringify(value);
  }
  return String(value || '').trim();
};

const normalizeItineraryItems = (raw, daysHint) => {
  const items = Array.isArray(raw) ? raw : [];
  const out = items.map((item, idx) => {
    const day = Number(item?.day) || idx + 1;
    const planCandidate =
      item?.plan ??
      item?.activity ??
      item?.activities ??
      item?.schedule ??
      item?.details ??
      item;
    const plan = stringifyPlan(planCandidate);
    return { ...item, day, plan };
  });

  const targetDays = Math.max(1, Number(daysHint) || out.length || 1);
  return out.slice(0, targetDays);
};


const buildFallbackBuddy = (reason = "AI Matchmaker is busy, meeting a popular local instead!") => {
  return {
    match_found: true,
    buddy: {
      name: "Alex Traveller (Fallback)",
      age: 25,
      vibe: "Adventure & Chill",
      bio: "Loves hiking, photography, and finding the best local coffee spots. (AI was overloaded, so here I am!)",
      shared_interests: ["Travel", "Photography", "Food"],
      compatibility_score: "85%",
      reason: reason
    }
  };
};


const safeJsonParse = (rawText) => {
  const cleanText = String(rawText || '').replace(/```json/gi, '').replace(/```/g, '').trim();
  try {
    return JSON.parse(cleanText);
  } catch {
    const start = cleanText.indexOf('{');
    const end = cleanText.lastIndexOf('}');
    if (start !== -1 && end !== -1 && end > start) {
      return JSON.parse(cleanText.slice(start, end + 1));
    }
    throw new Error('AI returned non-JSON response');
  }
};




const planTrip = async (req, res) => {
  const { destination, days, budget } = req.body;

  try {
    if (!isGroqConfigured()) {
      return res.json(
        buildFallbackPlan({
          destination, days, budget,
          note: 'AI not configured. Returning mock itinerary.',
        })
      );
    }

    const prompt =
      `Create a ${days || 3}-day itinerary for a trip to ${destination || 'the destination'} with a budget of $${budget || 1000}.\n\n` +
      'IMPORTANT: Return ONLY valid JSON and nothing else.\n' +
      'Rules:\n' +
      '- itinerary must be an array of days\n' +
      '- each day must include: day (number), plan (string)\n' +
      '- plan should be multi-line text with clear bullets\n' +
      'JSON format:\n' +
      '{"estimated_cost":1000,"currency":"USD","itinerary":[{"day":1,"plan":"• Morning: ...\\n• Afternoon: ...\\n• Evening: ..."}],"note":"..."}';

    const text = await generateText(prompt);
    const tripData = safeJsonParse(text);

    const normalized = {
      ...tripData,
      itinerary: normalizeItineraryItems(tripData?.itinerary, days),
    };

    if (!Array.isArray(normalized.itinerary) || normalized.itinerary.length === 0) {
      return res.json(
        buildFallbackPlan({
          destination,
          days,
          budget,
          note: 'AI is temporarily unavailable. Returning a standard plan.',
        })
      );
    }

    return res.json(normalized);

  } catch (error) {
    console.error("Trip Plan Error:", error);
    return res.json(
      buildFallbackPlan({
        destination,
        days,
        budget,
        note: 'AI is temporarily unavailable. Returning a standard plan.',
      })
    );
  }
};




const findBuddy = async (req, res) => {
  const { destination, interests, travelStyle } = req.body;

  try {
    if (!isGroqConfigured()) return res.json(buildFallbackBuddy('AI not configured'));

    const prompt = `
      I am a traveler going to ${destination}.
      My interests are: ${interests}.
      My travel style is: ${travelStyle}.

      Generate a profile for a "Perfect Travel Buddy" for me.
      
      IMPORTANT: Return ONLY valid JSON.
      JSON Format:
      {
        "name": "Name of the buddy",
        "age": 25,
        "bio": "A short, fun bio about them",
        "shared_interests": ["List of 3 things we both like"],
        "compatibility_score": "95%",
        "reason": "One sentence explaining why we match"
      }
    `;

    const text = await generateText(prompt);
    const buddyData = safeJsonParse(text);
    return res.json({ match_found: true, buddy: buddyData });

  } catch (error) {
    console.error("Buddy Match Error:", error);
    return res.json(buildFallbackBuddy("Internal error, returning fallback match."));
  }
};

const listModels = async (req, res) => {
  try {
    return res.json({
      provider: 'groq',
      models: [
        {
          name: 'llama-3.1-8b-instant',
          displayName: 'Llama 3.1 8B Instant',
          supportedGenerationMethods: ['generateContent'],
        },
      ],
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const generateItinerary = async (req, res) => {
  return planTrip(req, res);
};

const chatSupport = async (req, res) => {
  try {
    const message = String(req.body?.message ?? req.body?.prompt ?? '').trim();
    if (!message) {
      return res.status(400).json({ success: false, message: 'message is required' });
    }

    const intent = detectIntent(message);

    if (intent === INTENTS.HELP) {
      const commands = [
        'plan trip to <place> for <days> days',
        'budget for <place> for <days> days under <amount>',
        'recommend places in <city/country>',
        'create tour package for <place>',
        'summarize: <paste text>',
      ];

      return res.json({
        success: true,
        intent,
        reply:
          'Here are a few things I can do:\n' +
          commands.map((c) => `• ${c}`).join('\n') +
          '\n\nTip: Add dates, budget, vibe, and interests for best results.',
        data: { commands },
      });
    }

    const SYSTEM_PROMPT =
      'You are Explore Fusion AI — a luxury travel assistant.\n' +
      'You help users plan trips, budgets, itineraries and packages.\n' +
      'Be concise, premium tone, helpful, and structured.';

    const intentContext = (() => {
      switch (intent) {
        case INTENTS.PLAN_TRIP:
          return (
            'Intent: PLAN_TRIP\n' +
            'Provide a day-by-day itinerary with sections: Overview, Daily Plan, Food, Transport, Tips. ' +
            'Ask 1-2 clarifying questions if key details are missing (dates, city, budget, interests).'
          );
        case INTENTS.BUDGET_TRIP:
          return (
            'Intent: BUDGET_TRIP\n' +
            'Provide a practical budget breakdown (stay/food/transport/activities/misc), with low/mid/premium options and money-saving tips.'
          );
        case INTENTS.SUGGEST_PLACES:
          return (
            'Intent: SUGGEST_PLACES\n' +
            'Recommend places grouped by vibe (luxury, culture, nature, nightlife, family). Give 5-10 picks with 1-line reasons each.'
          );
        case INTENTS.CREATE_PACKAGE:
          return (
            'Intent: CREATE_PACKAGE\n' +
            'Draft a premium tour package outline: Title, Ideal For, Duration, Highlights, Day-by-day itinerary, Pricing tiers, Inclusions/Exclusions, Cancellation policy.'
          );
        case INTENTS.SUMMARIZE:
          return (
            'Intent: SUMMARIZE\n' +
            'Summarize the user content into a short, clear bullet list (max 6 bullets) and a 1-line takeaway.'
          );
        default:
          return 'Intent: CHAT\nBe helpful and ask clarifying questions when needed.';
      }
    })();

    if (!isGroqConfigured()) {
      return res.status(503).json({
        success: false,
        message: 'AI is temporarily unavailable. Try again.',
      });
    }

    const prompt = `${SYSTEM_PROMPT}\n\n${intentContext}\n\nUser: ${message}`;
    const text = await generateText(prompt);

    return res.json({
      success: true,
      intent,
      reply: text,
      data: {},
    });
  } catch (error) {
    return res.status(503).json({
      success: false,
      message: 'AI is temporarily unavailable. Try again.',
    });
  }
};

module.exports = { 
  planTrip, 
  findBuddy, 
  listModels, 
  generateItinerary, 
  chatSupport 
};