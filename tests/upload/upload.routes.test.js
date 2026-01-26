const supertest = require('supertest');
const { UPLOAD } = require('../utils/urls');
const { expectStatus, expectJson } = require('../utils/assertions');

const agent = supertest(UPLOAD);

const expectImageKitAuth = (response, label) => {
  expectStatus(response, [200, 500], label);
  if (response.status === 500) {
    expect(response.body?.message).toMatch(/missing env vars/i);
  } else {
    expectJson(response, label);
    expect(response.body.token || response.body.signature).toBeDefined();
  }
};

describe('Upload service auth helpers', () => {
  it('handles GET /imagekit-auth even without keys', async () => {
    const response = await agent
      .get('/imagekit-auth')
      .set('Accept', 'application/json');

    expectImageKitAuth(response, 'upload GET /imagekit-auth');
  });

  it('POST /api/v1/imagekit-auth is public (gateway proxy)', async () => {
    const response = await agent
      .post('/api/v1/imagekit-auth')
      .set('Accept', 'application/json');

    expect([200, 503]).toContain(response.status);
    if (response.status === 200) {
      expectJson(response, 'upload POST /api/v1/imagekit-auth');
    }
  });
});

describe('Upload route behavior', () => {
  it('rejects when no file is provided', async () => {
    const response = await agent.post('/api/v1/upload').send({});

    expectStatus(response, 400, 'upload POST /api/v1/upload (no file)');
    expect(response.body?.message).toMatch(/no file uploaded/i);
  });

  it('allows uploading an image', async () => {
    const payload = Buffer.from('dummy image data');
    const response = await agent
      .post('/api/v1/upload')
      .attach('image', payload, 'test.png');

    expectStatus(response, 200, 'upload POST /api/v1/upload');
    expectJson(response, 'upload POST /api/v1/upload');
    expect(response.body.message).toContain('File uploaded successfully');
    expect(response.body.imageUrl).toMatch(/\/uploads\//);
  });
});

describe('Upload branding admin endpoint', () => {
  it('requires auth for branding uploads', async () => {
    const response = await agent
      .post('/api/v1/upload/branding')
      .set('Accept', 'application/json');

    expectStatus(response, 401, 'upload POST /api/v1/upload/branding');
    expect(response.body?.message).toMatch(/not authorized/i);
  });
});
