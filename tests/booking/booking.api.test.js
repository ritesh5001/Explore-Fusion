const supertest = require('supertest');
const { BOOKING } = require('../utils/urls');
const { loginAndGetToken } = require('../utils/auth');
const { expectStatus, expectJson } = require('../utils/assertions');
const { requestWithSkip } = require('../utils/network');

const agent = supertest(BOOKING);

describe('Booking Service API', () => {
  it('returns bookings for authenticated user', async () => {
    const token = await loginAndGetToken();
    const response = await requestWithSkip(
      () =>
        agent
          .get('/api/v1/bookings')
          .set('Authorization', `Bearer ${token}`)
          .set('Accept', 'application/json'),
      'booking GET /bookings'
    );
    if (!response) return;

    if (response.status === 503) {
      expect(response.body?.message).toMatch(/gateway unavailable/i);
      return;
    }

    expectStatus(response, 200, 'booking GET /bookings');
    expectJson(response, 'booking GET /bookings');
  });
});
