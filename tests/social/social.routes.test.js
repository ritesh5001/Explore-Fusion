const supertest = require('supertest');
const { SOCIAL } = require('../utils/urls');
const { expectStatus } = require('../utils/assertions');
const { requestWithSkip } = require('../utils/network');

const agent = supertest(SOCIAL);

const endpoints = [
  { label: 'follow user', method: () => agent.post('/api/v1/follow/507f1f77bcf86cd799439011').send({}) },
  { label: 'unfollow user', method: () => agent.delete('/api/v1/unfollow/507f1f77bcf86cd799439011') },
  { label: 'list followers', method: () => agent.get('/api/v1/followers/507f1f77bcf86cd799439011') },
  { label: 'list following', method: () => agent.get('/api/v1/following/507f1f77bcf86cd799439011') },
];

describe('Social service protected endpoints', () => {
  endpoints.forEach(({ label, method }) => {
    it(`requires auth for ${label}`, async () => {
      const testLabel = `social ${label}`;
      const response = await requestWithSkip(() => method(), testLabel);
      if (!response) return;
      expectStatus(response, 401, testLabel);
      expect(response.body?.message).toMatch(/not authorized/i);
    });
  });
});
