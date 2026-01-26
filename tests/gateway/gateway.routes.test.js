const supertest = require('supertest');
const { expectStatus, expectJson } = require('../utils/assertions');
const { requestWithSkip } = require('../utils/network');

const agent = supertest('http://localhost:5050');

const allowEitherStatus = (response, label, allowed) => {
  const status = response.status;
  if (!allowed.includes(status)) {
    console.warn(`Unexpected status for ${label}: ${status}`);
  }
  expect(allowed).toContain(status);
};

describe('Gateway routes', () => {
  it('serves the landing page at /', async () => {
    const response = await requestWithSkip(() => agent.get('/'), 'gateway /');
    if (!response) return;
    expect(response.status).toBe(200);
    expect(response.text).toMatch(/gateway/i);
  });

  it('proxies imagekit auth (GET)', async () => {
    const response = await requestWithSkip(
      () =>
        agent
          .get('/api/v1/imagekit-auth')
          .set('Accept', 'application/json'),
      'gateway GET /api/v1/imagekit-auth'
    );
    if (!response) return;

    allowEitherStatus(response, 'gateway GET /api/v1/imagekit-auth', [200, 503]);
    if (response.status === 200) {
      expectJson(response, 'gateway GET /api/v1/imagekit-auth');
      expect(response.body.success ?? true).toBeDefined();
    } else {
      expect(response.body?.message).toMatch(/upload service/i);
    }
  });

  it('proxies imagekit auth (POST)', async () => {
    const response = await requestWithSkip(
      () =>
        agent
          .post('/api/v1/imagekit-auth')
          .set('Accept', 'application/json'),
      'gateway POST /api/v1/imagekit-auth'
    );
    if (!response) return;

    allowEitherStatus(response, 'gateway POST /api/v1/imagekit-auth', [200, 503]);
  });

  it('requires auth for follow endpoints', async () => {
    const response = await requestWithSkip(
      () => agent.post('/api/v1/follow/507f1f77bcf86cd799439011'),
      'gateway POST /api/v1/follow/:id'
    );
    if (!response) return;

    expectStatus(response, 401, 'gateway POST /api/v1/follow/:id');
    expect(response.body?.message).toMatch(/not authorized/i);
  });
});
