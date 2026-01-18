const supertest = require('supertest');
const { AUTH } = require('../utils/urls');
const { expectStatus, expectJson } = require('../utils/assertions');

const agent = supertest(AUTH);

describe('Auth Service health', () => {
  it('reports healthy via /health', async () => {
    const response = await agent.get('/health');
    expectStatus(response, 200, 'auth /health');
    expectJson(response, 'auth /health');
  });
});
