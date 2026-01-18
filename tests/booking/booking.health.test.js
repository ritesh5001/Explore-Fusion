const supertest = require('supertest');
const { BOOKING } = require('../utils/urls');
const { expectStatus, expectJson } = require('../utils/assertions');

const agent = supertest(BOOKING);

describe('Booking Service health', () => {
  it('responds to /health', async () => {
    const response = await agent.get('/health');
    expectStatus(response, 200, 'booking /health');
    expectJson(response, 'booking /health');
  });
});
