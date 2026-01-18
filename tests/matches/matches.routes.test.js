const supertest = require('supertest');
const { MATCHES } = require('../utils/urls');
const { expectStatus } = require('../utils/assertions');

const agent = supertest(MATCHES);

const expectProtected = (response, label) => {
  expectStatus(response, 401, label);
  expect(response.body?.message).toMatch(/not authorized/i);
};

describe('Matches service protected endpoints', () => {
  const endpoints = [
    { label: 'profile creation', method: () => agent.post('/api/v1/matches/profile').send({}) },
    { label: 'profile me', method: () => agent.get('/api/v1/matches/profile/me') },
    { label: 'suggestions list', method: () => agent.get('/api/v1/matches/suggestions') },
    { label: 'send request', method: () => agent.post('/api/v1/matches/507f1f77bcf86cd799439011/request').send({}) },
    { label: 'accept request', method: () => agent.post('/api/v1/matches/507f1f77bcf86cd799439011/accept').send({}) },
    { label: 'reject request', method: () => agent.post('/api/v1/matches/507f1f77bcf86cd799439011/reject').send({}) },
    { label: 'list accepted matches', method: () => agent.get('/api/v1/matches/my') },
    { label: 'list requests', method: () => agent.get('/api/v1/matches/requests') },
  ];

  endpoints.forEach(({ label, method }) => {
    it(`requires auth for ${label}`, async () => {
      const response = await method();
      expectProtected(response, `matches ${label}`);
    });
  });
});
