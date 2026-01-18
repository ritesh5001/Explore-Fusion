const supertest = require('supertest');
const { MATCHES } = require('../utils/urls');
const { expectStatus, expectJson } = require('../utils/assertions');

const agent = supertest(MATCHES);

describe('Matches service health', () => {
  it('serves the basic /health payload', async () => {
    const response = await agent.get('/health');

    expectStatus(response, 200, 'matches /health');
    expectJson(response, 'matches /health');
    expect(response.body.status).toBe('ok');
    expect(response.body.service).toBe('matches');
  });

  it('serves versioned health metadata', async () => {
    const response = await agent.get('/api/v1/matches/health');

    expectStatus(response, 200, 'matches /api/v1/matches/health');
    expectJson(response, 'matches /api/v1/matches/health');
    expect(response.body.status).toBe('ok');
    expect(response.body.service).toBe('matches');
  });
});
