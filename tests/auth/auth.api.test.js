const supertest = require('supertest');
const { AUTH } = require('../utils/urls');
const { loginAndGetToken, registerTestUser } = require('../utils/auth');
const { expectStatus, expectJson } = require('../utils/assertions');

const agent = supertest(AUTH);

describe('Auth API', () => {
  it('logs in an existing test user and returns a token', async () => {
    const token = await loginAndGetToken();
    expect(token).toBeTruthy();
  });

  it('allows registering a fresh user', async () => {
    const email = `register+${Date.now()}@example.com`;
    const password = 'Register123!';
    const response = await agent
      .post('/api/v1/auth/register')
      .send({ name: 'Smoke Tester', email, password })
      .set('Accept', 'application/json');

    expectStatus(response, [200, 201], 'auth register');
    expectJson(response, 'auth register');
    expect(response.body.data?.token).toBeTruthy();
  });
});
