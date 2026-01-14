const { GoogleGenerativeAI } = require("@google/generative-ai");
const { INTENTS, detectIntent } = require('../utils/intentDetector');
const { isGeminiConfigured, generateText } = require('../utils/geminiClient');


const buildFallbackPlan = ({ destination, days, budget, note, retryAfterSeconds }) => {
  const safeDays = Math.max(1, Number(days) || 3);
  const safeBudget = Number(budget) || 1000;
  const safeDestination = destination || 'your destination';

  const itinerary = Array.from({ length: safeDays }, (_, index) => {
    const day = index + 1;
    return {
      day,
      activity:
        day === 1
          ? 'Arrival + local food walk'
          : day === safeDays
            ? 'Souvenir shopping + departure'
            : 'City highlights + optional museum',
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


const parseRetryAfterSeconds = (error) => {
  const details = Array.isArray(error?.errorDetails) ? error.errorDetails : [];
  const retryInfo = details.find((d) => d && d['@type'] === 'type.googleapis.com/google.rpc.RetryInfo');
  const raw = retryInfo?.retryDelay;
  if (typeof raw !== 'string') return null;
  const match = raw.match(/^(\d+)s$/);
  return match ? Number(match[1]) : null;
};


const getGenAI = () => {
  const key = (process.env.GEMINI_API_KEY || '').trim();
  if (!key) return null;
  try {
    return new GoogleGenerativeAI(key);
  } catch {
    return null;
  }
};

const genAI = getGenAI();

const getCandidateModels = () => {
  const configured = (process.env.GEMINI_MODEL || '').trim();
  const candidates = [configured, 'gemini-2.0-flash', 'gemini-1.5-flash'].filter(Boolean);
  return [...new Set(candidates)];
};




const planTrip = async (req, res) => {
  const { destination, days, budget } = req.body;

  try {
    if (!genAI) {
      return res.json(
        buildFallbackPlan({
          destination, days, budget,
          note: 'AI not configured. Returning mock itinerary.',
        })
      );
    }

    const prompt = `
      You are an expert travel assistant. Create a ${days}-day itinerary for a trip to ${destination} with a budget of $${budget}.
      
      IMPORTANT: Return the response ONLY in valid JSON format. Do not add any text outside the JSON.
      The JSON structure must be exactly like this:
      {
        "estimated_cost": "Total cost in USD",
        "currency": "USD",
        "itinerary": [
          { "day": 1, "activity": "Morning activity", "cost": 20 },
          { "day": 1, "activity": "Afternoon activity", "cost": 30 },
          { "day": 2, "activity": "Full day tour", "cost": 100 }
        ],
        "note": "A brief travel tip"
      }
    `;

    const candidates = getCandidateModels();
    let lastError;

    for (const modelName of candidates) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        const cleanText = String(text).replace(/```json/gi, '').replace(/```/g, '').trim();
        let tripData;
        try {
          tripData = JSON.parse(cleanText);
        } catch {
          const start = cleanText.indexOf('{');
          const end = cleanText.lastIndexOf('}');
          if (start !== -1 && end !== -1 && end > start) {
            tripData = JSON.parse(cleanText.slice(start, end + 1));
          } else {
            throw new Error('AI returned non-JSON response');
          }
        }

        return res.json(tripData);
      } catch (error) {
        lastError = error;
        const status = error?.status;

        
        if (status === 429) {
          const retryAfterSeconds = parseRetryAfterSeconds(error);
          console.warn(`Gemini quota/rate-limit hit (429) on ${modelName}. Returning fallback.`);
          return res.json(
            buildFallbackPlan({
              destination,
              days,
              budget,
              note: 'Gemini quota exceeded / rate-limited. Returning mock itinerary for now.',
              retryAfterSeconds,
            })
          );
        }

        if (status === 503) {
          console.warn(`Model ${modelName} overloaded (503). Switching...`);
          continue;
        }
        if (status === 404) continue; 
        break; 
      }
    }

    console.error('All AI models failed for Trip:', lastError);
    return res.json(
      buildFallbackPlan({
        destination, days, budget,
        note: 'AI services are currently busy. Here is a standard plan.',
      })
    );

  } catch (error) {
    console.error("Trip Plan Error:", error);
    res.status(500).json({ message: "Failed to generate itinerary" });
  }
};




const findBuddy = async (req, res) => {
  const { destination, interests, travelStyle } = req.body;

  try {
    if (!genAI) return res.json(buildFallbackBuddy("AI key missing"));

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

    const candidates = getCandidateModels();
    let lastError;

    for (const modelName of candidates) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        const cleanText = String(text).replace(/```json/gi, '').replace(/```/g, '').trim();
        const buddyData = JSON.parse(cleanText);

        return res.json({ match_found: true, buddy: buddyData });

      } catch (error) {
        lastError = error;
        const status = error?.status;

        if (status === 429) {
          const retryAfterSeconds = parseRetryAfterSeconds(error);
          console.warn(`Gemini quota/rate-limit hit (429) on ${modelName}. Returning fallback buddy.`);
          return res.json(
            buildFallbackBuddy(
              retryAfterSeconds
                ? `AI quota exceeded. Try again in ~${retryAfterSeconds}s.`
                : 'AI quota exceeded / rate-limited. Returning fallback match.'
            )
          );
        }

        if (status === 503 || status === 404) {
          console.warn(`Model ${modelName} failed for Buddy (Status ${status}). Switching...`);
          continue;
        }
        break;
      }
    }

    console.error('All AI models failed for Buddy:', lastError);
    return res.json(buildFallbackBuddy("AI services busy, returning fallback match."));

  } catch (error) {
    console.error("Buddy Match Error:", error);
    return res.json(buildFallbackBuddy("Internal error, returning fallback match."));
  }
};

const listModels = async (req, res) => {
  try {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      return res.status(500).json({ message: 'Missing GEMINI_API_KEY in .env' });
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(key)}`;
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    const models = (data.models || []).map((m) => ({
      name: m.name,
      displayName: m.displayName,
      supportedGenerationMethods: m.supportedGenerationMethods,
    }));

    return res.json({ models });
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

    if (!isGeminiConfigured()) {
      return res.status(503).json({
        success: false,
        message: 'AI is temporarily unavailable. Try again.',
      });
    }

    const { text } = await generateText({
      systemPrompt: `${SYSTEM_PROMPT}\n\n${intentContext}`,
      userMessage: message,
    });

    return res.json({
      success: true,
      intent,
      reply: text,
      data: {},
    });
  } catch (error) {
    const rawStatus = Number(error?.status) || 503;
    const status = rawStatus === 401 || rawStatus === 403 ? 503 : rawStatus;
    return res.status(status).json({
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