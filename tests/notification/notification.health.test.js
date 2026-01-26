const supertest = require('supertest');
const { NOTIFICATION } = require('../utils/urls');
const { expectStatus, expectJson } = require('../utils/assertions');

const agent = supertest(NOTIFICATION);

describe('Notification endpoints health', () => {
  it('serves the historic notifications health path', async () => {
    const response = await agent.get('/notifications/health');

    expectStatus(response, 200, 'notification /notifications/health');
    expectJson(response, 'notification /notifications/health');
    expect(response.body.status).toBe('ok');
    expect(response.body.service).toBe('notification');
  });

  it('serves the versioned health endpoint', async () => {
    const response = await agent.get('/notifications/health');

    expectStatus(response, 200, 'notification /api/v1/notifications/health');
    expectJson(response, 'notification /api/v1/notifications/health');
    expect(response.body.status).toBe('ok');
    expect(response.body.service).toBe('notification');
  });
});
