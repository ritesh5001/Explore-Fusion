const supertest = require('supertest');
const { AI } = require('../utils/urls');
const { expectStatus, expectJson } = require('../utils/assertions');

const agent = supertest(AI);

describe('AI Service health', () => {
  it('responds to /health', async () => {
    const response = await agent.get('/health');
    expectStatus(response, 200, 'ai /health');
    expectJson(response, 'ai /health');
    expect(response.body.service).toBe('ai');
    expect(response.body.status).toBe('ok');
    expect(response.body.provider).toBe('groq');
  });
});
