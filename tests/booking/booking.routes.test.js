const supertest = require('supertest');
const { BOOKING } = require('../utils/urls');
const { expectStatus, expectJson } = require('../utils/assertions');

const agent = supertest(BOOKING);

const expectProtected = (response, label) => {
  expectStatus(response, 401, label);
  expect(response.body?.message).toMatch(/not authorized/i);
};

describe('Booking service packages API', () => {
  it('lists public packages', async () => {
    const response = await agent
      .get('/api/v1/packages')
      .set('Accept', 'application/json');

    expectStatus(response, 200, 'packages GET /api/v1/packages');
    expectJson(response, 'packages GET /api/v1/packages');
    expect(response.body.data).toBeDefined();
    expect(Array.isArray(response.body.data.packages)).toBe(true);
  });

  it('allows searching packages', async () => {
    const response = await agent
      .get('/api/v1/packages/search')
      .query({ destination: 'island' })
      .set('Accept', 'application/json');

    expectStatus(response, 200, 'packages GET /api/v1/packages/search');
    expectJson(response, 'packages GET /api/v1/packages/search');
  });

  it('validates package id when reading', async () => {
    const response = await agent
      .get('/api/v1/packages/invalid-id')
      .set('Accept', 'application/json');

    expectStatus(response, 400, 'packages GET /api/v1/packages/:id');
    expect(response.body?.message).toMatch(/invalid package id/i);
  });

  it('protects package creation', async () => {
    const response = await agent
      .post('/api/v1/packages')
      .send({});

    expectProtected(response, 'packages POST /api/v1/packages');
  });

  it('protects package updates', async () => {
    const response = await agent
      .put('/api/v1/packages/645e6edc8f1c2d3895d260b7')
      .send({ price: 100 });

    expectProtected(response, 'packages PUT /api/v1/packages/:id');
  });

  it('protects package deletions', async () => {
    const response = await agent
      .delete('/api/v1/packages/645e6edc8f1c2d3895d260b7');

    expectProtected(response, 'packages DELETE /api/v1/packages/:id');
  });
});

describe('Booking service itineraries API', () => {
  const protectedRequests = [
    { label: 'itineraries POST /', request: () => agent.post('/api/v1/itineraries').send({}) },
    { label: 'itineraries GET /my', request: () => agent.get('/api/v1/itineraries/my') },
    { label: 'itineraries GET /', request: () => agent.get('/api/v1/itineraries') },
    { label: 'itineraries GET /:id', request: () => agent.get('/api/v1/itineraries/123') },
    { label: 'itineraries DELETE /:id', request: () => agent.delete('/api/v1/itineraries/123') },
  ];

  protectedRequests.forEach(({ label, request }) => {
    it(`rejects unauthorized ${label}`, async () => {
      const response = await request();
      expectProtected(response, label);
    });
  });
});

describe('Booking service reviews API', () => {
  it('validates package id when listing reviews', async () => {
    const response = await agent.get('/api/v1/reviews/invalid');
    expectStatus(response, 400, 'reviews GET /api/v1/reviews/:packageId');
    expect(response.body?.message).toMatch(/invalid packageid/i);
  });

  ['POST /', 'DELETE /:id'].forEach((label) => {
    it(`protects review ${label}`, async () => {
      const response = label.includes('POST')
        ? await agent.post('/api/v1/reviews').send({})
        : await agent.delete('/api/v1/reviews/123');

      expectProtected(response, `reviews ${label}`);
    });
  });
});

describe('Booking service matches API', () => {
  const matchEndpoints = [
    { label: 'profile creation', method: () => agent.post('/api/v1/matches/profile').send({}) },
    { label: 'profile me', method: () => agent.get('/api/v1/matches/profile/me') },
    { label: 'suggestions', method: () => agent.get('/api/v1/matches/suggestions') },
    { label: 'send request', method: () => agent.post('/api/v1/matches/507f1f77bcf86cd799439011/request').send({}) },
    { label: 'accept request', method: () => agent.post('/api/v1/matches/507f1f77bcf86cd799439011/accept').send({}) },
    { label: 'reject request', method: () => agent.post('/api/v1/matches/507f1f77bcf86cd799439011/reject').send({}) },
    { label: 'list my', method: () => agent.get('/api/v1/matches/my') },
    { label: 'list requests', method: () => agent.get('/api/v1/matches/requests') },
  ];

  matchEndpoints.forEach(({ label, method }) => {
    it(`requires auth for ${label}`, async () => {
      const response = await method();
      expectProtected(response, `matches ${label}`);
    });
  });
});

describe('Booking service notifications API', () => {
  const notificationEndpoints = [
    { label: 'create', method: () => agent.post('/api/v1/notifications').send({}) },
    { label: 'list mine', method: () => agent.get('/api/v1/notifications/my') },
    { label: 'mark read', method: () => agent.put('/api/v1/notifications/507f1f77bcf86cd799439011/read').send({}) },
    { label: 'delete', method: () => agent.delete('/api/v1/notifications/507f1f77bcf86cd799439011') },
    { label: 'clear all', method: () => agent.delete('/api/v1/notifications/clear/all') },
  ];

  notificationEndpoints.forEach(({ label, method }) => {
    it(`requires auth for ${label}`, async () => {
      const response = await method();
      expectProtected(response, `notifications ${label}`);
    });
  });
});
