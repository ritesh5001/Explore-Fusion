const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require('dotenv');

dotenv.config();

if (!process.env.GEMINI_API_KEY) {
  throw new Error('Missing GEMINI_API_KEY in .env');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const getCandidateModels = () => {
  const configured = (process.env.GEMINI_MODEL || '').trim();
  const candidates = [
    configured,
    'gemini-1.5-flash-latest',
    'gemini-1.5-flash',
    'gemini-1.5-pro-latest',
    'gemini-1.5-pro',
    'gemini-1.0-pro',
    'gemini-pro',
  ].filter(Boolean);

  return [...new Set(candidates)];
};

const planTrip = async (req, res) => {
  const { destination, days, budget } = req.body;

  try {
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

        const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
        const tripData = JSON.parse(cleanText);

        return res.json(tripData);
      } catch (error) {
        lastError = error;
        const status = error?.status;
        if (status === 404) {
          continue;
        }
        break;
      }
    }

    console.error('AI Error:', lastError);
    return res.status(500).json({
      message:
        'Failed to generate itinerary. Check GEMINI_MODEL (or your API key access) and try again.',
    });

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

module.exports = { planTrip, findBuddy };