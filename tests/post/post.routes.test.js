const supertest = require('supertest');
const { POST } = require('../utils/urls');
const { expectStatus, expectJson } = require('../utils/assertions');

const agent = supertest(POST);
const expectProtected = (response, label) => {
  expectStatus(response, 401, label);
  expect(response.body?.message).toMatch(/not authorized/i);
};

describe('Post API public endpoints', () => {
  it('lists posts with pagination', async () => {
    const response = await agent
      .get('/api/v1/posts')
      .query({ page: 1, limit: 5 })
      .set('Accept', 'application/json');

    expectStatus(response, 200, 'post GET /api/v1/posts');
    expectJson(response, 'post GET /api/v1/posts');
    expect(response.body.data).toBeDefined();
    expect(Array.isArray(response.body.data.posts)).toBe(true);
  });

  it('validates post id when reading', async () => {
    const response = await agent.get('/api/v1/posts/invalid-id');

    expectStatus(response, 400, 'post GET /api/v1/posts/:id');
    expect(response.body?.message).toMatch(/invalid post id/i);
  });

  it('validates user when listing posts by user', async () => {
    const response = await agent.get('/api/v1/posts/user/invalid');

    expectStatus(response, 400, 'post GET /api/v1/posts/user/:userId');
    expect(response.body?.message).toMatch(/invalid user id/i);
  });

  it('validates user when counting posts', async () => {
    const response = await agent.get('/api/v1/posts/user/invalid/count');

    expectStatus(response, 400, 'post GET /api/v1/posts/user/:userId/count');
    expect(response.body?.message).toMatch(/invalid user id/i);
  });
});

describe('Post API protected endpoints', () => {
  const protectedCalls = [
    { label: 'create post', method: () => agent.post('/api/v1/posts').send({}) },
    { label: 'update post', method: () => agent.put('/api/v1/posts/507f1f77bcf86cd799439011').send({}) },
    { label: 'delete post', method: () => agent.delete('/api/v1/posts/507f1f77bcf86cd799439011') },
    { label: 'toggle like', method: () => agent.post('/api/v1/posts/507f1f77bcf86cd799439011/like') },
    { label: 'add comment', method: () => agent.post('/api/v1/posts/507f1f77bcf86cd799439011/comment').send({ text: 'hi' }) },
  ];

  protectedCalls.forEach(({ label, method }) => {
    it(`requires auth for ${label}`, async () => {
      const response = await method();
      expectProtected(response, `post ${label}`);
    });
  });
});
