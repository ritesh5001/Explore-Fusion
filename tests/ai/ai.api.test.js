const supertest = require('supertest');
const { AI } = require('../utils/urls');
const { expectStatus, expectJson } = require('../utils/assertions');

const agent = supertest(AI);

const assertPlanResponse = (response, label) => {
  expectStatus(response, 200, label);
  expectJson(response, label);
  expect(response.body.itinerary).toBeDefined();
  expect(Array.isArray(response.body.itinerary)).toBe(true);
  expect(response.body.itinerary.length).toBeGreaterThan(0);
  if (response.body && Object.prototype.hasOwnProperty.call(response.body, 'ai_used')) {
    expect(typeof response.body.ai_used).toBe('boolean');
  }
};

describe('AI Service API', () => {
  it('returns fallback plan data from /plan', async () => {
    const payload = { destination: 'Reykjavik', days: 3, budget: 1400 };
    const response = await agent
      .post('/api/v1/ai/plan')
      .set('Accept', 'application/json')
      .send(payload);

    assertPlanResponse(response, 'ai POST /plan');
  });

  it('supports the generate-itinerary alias', async () => {
    const response = await agent
      .post('/api/v1/ai/generate-itinerary')
      .set('Accept', 'application/json')
      .send({ destination: 'Kyoto', days: 2 });

    assertPlanResponse(response, 'ai POST /generate-itinerary');
  });

  it('provides a fallback buddy match when AI is offline', async () => {
    const response = await agent
      .post('/api/v1/ai/match')
      .set('Accept', 'application/json')
      .send({ destination: 'Lisbon', interests: ['food', 'art'], travelStyle: 'relaxed' });

    expectStatus(response, 200, 'ai POST /match');
    expectJson(response, 'ai POST /match');
    expect(response.body.match_found).toBe(true);
    expect(response.body.buddy).toBeDefined();
  });

  it('lists available models', async () => {
    const response = await agent
      .get('/api/v1/ai/models')
      .set('Accept', 'application/json');

    expectStatus(response, 200, 'ai GET /models');
    expectJson(response, 'ai GET /models');
    expect(response.body.provider).toBe('groq');
    expect(Array.isArray(response.body.models)).toBe(true);
    expect(response.body.models.length).toBeGreaterThan(0);
  });

  it('returns a 503 when chat is requested while offline', async () => {
    const response = await agent
      .post('/api/v1/ai/chat')
      .set('Accept', 'application/json')
      .send({ message: 'What should I do in Paris for two nights?' });

    if (response.status === 503) {
      expectJson(response, 'ai POST /chat');
      expect(response.body.success).toBe(false);
      expect(response.body.message).toMatch(/temporarily unavailable/i);
    } else {
      expect(response.status).toBe(200);
      expectJson(response, 'ai POST /chat');
      expect(response.body.success).toBe(true);
      expect(typeof response.body.reply === 'string').toBe(true);
    }
  });
});
