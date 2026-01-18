const supertest = require('supertest');
const { UPLOAD } = require('../utils/urls');
const { expectStatus, expectJson } = require('../utils/assertions');

const agent = supertest(UPLOAD);

describe('Upload service health', () => {
  it('returns metadata at /health', async () => {
    const response = await agent.get('/health');

    expectStatus(response, 200, 'upload /health');
    expectJson(response, 'upload /health');
    expect(response.body.status).toBe('ok');
    expect(response.body.service).toBe('upload');
  });

  it('returns metadata at versioned health endpoint', async () => {
    const response = await agent.get('/api/v1/upload/health');

    expectStatus(response, 200, 'upload /api/v1/upload/health');
    expectJson(response, 'upload /api/v1/upload/health');
    expect(response.body.status).toBe('ok');
    expect(response.body.service).toBe('upload');
  });
});
