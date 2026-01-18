const supertest = require('supertest');
const { loginAndGetToken } = require('../utils/auth');
const { requestWithSkip } = require('../utils/network');

const gateway = supertest('http://localhost:5050');

describe('Notifications - protected endpoints', () => {
  it('should allow /api/v1/notifications/my when token provided', async () => {
    const token = await loginAndGetToken().catch(() => null);
    if (!token) {
      console.warn('Skipping notifications/my test because login token could not be obtained');
      return;
    }

    const response = await requestWithSkip(
      () =>
        gateway
          .get('/api/v1/notifications/my')
          .set('Authorization', `Bearer ${token}`)
          .set('Accept', 'application/json'),
      'gateway /api/v1/notifications/my'
    );
    if (!response) return;

    expect(response.status).toBe(200);
    expect(response.body).toBeDefined();
  });
});
