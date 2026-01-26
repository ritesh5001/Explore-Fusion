const supertest = require('supertest');
const { NOTIFICATION } = require('../utils/urls');
const { expectStatus, expectJson } = require('../utils/assertions');

const { loginAndGetToken } = require('../utils/auth');
const agent = supertest(NOTIFICATION);

const sampleId = '507f1f77bcf86cd799439011';

describe('Notification API', () => {
  let token;
  beforeAll(async () => {
    token = await loginAndGetToken();
  });

  it('lists notifications', async () => {
    const response = await agent
      .get('/api/v1/notifications')
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`);
    expectStatus(response, 200, 'notification GET /api/v1/notifications');
    expectJson(response, 'notification GET /api/v1/notifications');
    expect(response.body.success).toBe(true);
  });

  it('creates a notification', async () => {
    const response = await agent
      .post('/api/v1/notifications')
      .send({ title: 'test', message: 'testing' })
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`);

    expectStatus(response, 200, 'notification POST /api/v1/notifications');
    expectJson(response, 'notification POST /api/v1/notifications');
    expect(response.body.message).toContain('Notification created');
    expect(response.body.success).toBe(true);
  });

  it('reads a notification by id', async () => {
    const response = await agent
      .get(`/api/v1/notifications/${sampleId}`)
      .set('Authorization', `Bearer ${token}`);
    expectStatus(response, 200, 'notification GET /api/v1/notifications/:id');
    expectJson(response, 'notification GET /api/v1/notifications/:id');
    expect(response.body.success).toBe(true);
    expect(response.body.notification).toBeDefined();
  });

  it('updates a notification', async () => {
    const response = await agent
      .put(`/api/v1/notifications/${sampleId}`)
      .send({ title: 'updated' })
      .set('Authorization', `Bearer ${token}`);

    expectStatus(response, 200, 'notification PUT /api/v1/notifications/:id');
    expectJson(response, 'notification PUT /api/v1/notifications/:id');
    expect(response.body.message).toContain('Notification updated');
  });

  it('deletes a notification', async () => {
    const response = await agent
      .delete(`/api/v1/notifications/${sampleId}`)
      .set('Authorization', `Bearer ${token}`);
    expectStatus(response, 200, 'notification DELETE /api/v1/notifications/:id');
    expectJson(response, 'notification DELETE /api/v1/notifications/:id');
    expect(response.body.message).toContain('Notification deleted');
  });
});
