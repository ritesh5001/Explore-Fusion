const supertest = require('supertest');
const { CHAT } = require('../utils/urls');
const { expectStatus, expectJson } = require('../utils/assertions');

const agent = supertest(CHAT);

describe('Chat Service health', () => {
  it('responds to /health with service metadata', async () => {
    const response = await agent.get('/health');

    expectStatus(response, 200, 'chat /health');
    expectJson(response, 'chat /health');
    expect(response.body.ok).toBe(true);
    expect(response.body.service).toBe('chat-service');
  });
});
