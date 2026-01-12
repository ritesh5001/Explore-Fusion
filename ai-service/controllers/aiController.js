const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require('dotenv');

dotenv.config();

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
  const candidates = [configured, 'gemini-2.0-flash'].filter(Boolean);

  return [...new Set(candidates)];
};

const planTrip = async (req, res) => {
  const { destination, days, budget } = req.body;

  try {
    if (!genAI) {
      return res.json(
        buildFallbackPlan({
          destination,
          days,
          budget,
          note: 'AI is not configured (missing/invalid GEMINI_API_KEY). Returning a mock itinerary.',
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
          return res.json(
            buildFallbackPlan({
              destination,
              days,
              budget,
              retryAfterSeconds,
              note: 'Gemini quota/rate limit exceeded. Returning a mock itinerary.',
            })
          );
        }

        if (status === 503) {
          return res.json(
            buildFallbackPlan({
              destination,
              days,
              budget,
              note: 'Gemini is temporarily unavailable. Returning a mock itinerary.',
            })
          );
        }

        if (status === 404) {
          continue;
        }
        break; 
      }
    }

    console.error('AI Error:', lastError);
    return res.json(
      buildFallbackPlan({
        destination,
        days,
        budget,
        note: 'Gemini request failed. Returning a mock itinerary.',
      })
    );

  } catch (error) {
    console.error("AI Error:", error);
    res.status(500).json({ message: "Failed to generate itinerary" });
  }
};

const findBuddy = (req, res) => {
  res.json({
    match_found: true,
    buddy: {
      name: "Alex Traveller",
      age: 24,
      vibe: "Adventure",
      bio: "Loves hiking and photography."
    }
  });
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

module.exports = { planTrip, findBuddy, listModels };