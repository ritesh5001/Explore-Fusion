const supertest = require('supertest');
const { requestWithSkip } = require('../utils/network');

const agent = supertest('http://localhost:5050');

describe('Gateway health', () => {
  it('responds with status ok', async () => {
    const response = await requestWithSkip(() => agent.get('/health'), 'gateway /health');
    if (!response) return;
    expect(response.status).toBe(200);
    expect(response.body).toBeDefined();
    expect(response.body.status).toBe('ok');
  });
});
