const supertest = require('supertest');
const { SOCIAL } = require('../utils/urls');
const { expectStatus, expectJson } = require('../utils/assertions');
const { requestWithSkip } = require('../utils/network');

const agent = supertest(SOCIAL);

describe('Social service health', () => {
  it('responds to /health with service info', async () => {
    const response = await requestWithSkip(() => agent.get('/health'), 'social /health');
    if (!response) return;

    expectStatus(response, 200, 'social /health');
    expectJson(response, 'social /health');
    expect(response.body.status).toBe('ok');
    expect(response.body.service).toBe('social');
  });
});
