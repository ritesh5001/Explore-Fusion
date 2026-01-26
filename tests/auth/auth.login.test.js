const supertest = require('supertest');
const { AUTH } = require('../utils/urls');

const agent = supertest(AUTH);

describe('Auth Service - login', () => {
  it('should respond with token or error when calling /api/v1/auth/login', async () => {
    const response = await agent
      .post('/api/v1/auth/login')
      .send({ email: 'test@example.com', password: 'password' })
      .set('Accept', 'application/json');

    expect([200, 401]).toContain(response.status);
    expect(response.body).toBeDefined();

    if (response.status === 200) {
      expect(response.body.data?.token).toBeTruthy();
    } else {
      expect(response.body.message || response.body.error).toBeTruthy();
    }
  });
});
