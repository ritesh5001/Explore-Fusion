const supertest = require('supertest');
const { POST } = require('../utils/urls');
const { expectStatus, expectJson } = require('../utils/assertions');

const agent = supertest(POST);

describe('Post API health', () => {
  it('responds on /api/v1/posts/health with service metadata', async () => {
    const response = await agent.get('/posts/health');

    expectStatus(response, 200, 'post /health');
    expectJson(response, 'post /health');
    expect(response.body.status).toBe('ok');
    expect(response.body.service).toBe('post');
  });
});
