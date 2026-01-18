const supertest = require('supertest');
const { POST } = require('../utils/urls');
const { expectStatus, expectJson } = require('../utils/assertions');

const agent = supertest(POST);

describe('Post service health', () => {
  it('responds on /health with service metadata', async () => {
    const response = await agent.get('/health');

    expectStatus(response, 200, 'post /health');
    expectJson(response, 'post /health');
    expect(response.body.status).toBe('ok');
    expect(response.body.service).toBe('post');
  });
});
