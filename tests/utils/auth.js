const supertest = require('supertest');
const { AUTH } = require('./urls');

const DEFAULT_PASSWORD = process.env.TEST_USER_PASSWORD || 'Test1234!';
const DEFAULT_NAME = process.env.TEST_USER_NAME || 'Test Automation';
let cachedToken = null;
let cachedEmail = process.env.TEST_USER_EMAIL || null;

const logResponse = (response, label) => {
  if (!response) return;
  const payload = response.body || response.text;
  console.error(`[auth helper] ${label} -> ${response.status}`, payload);
};

const getAuthAgent = () => supertest(AUTH);

const loginWith = async (email, password) => {
  const response = await getAuthAgent()
    .post('/api/v1/auth/login')
    .send({ email, password })
    .set('Accept', 'application/json');

  if (response.status === 200) {
    return response.body?.data?.token;
  }

  logResponse(response, 'login failed');
  throw new Error(response.body?.message || 'Login failed');
};

const registerTestUser = async (emailOverride, passwordOverride) => {
  const email = emailOverride || `test+${Date.now()}@example.com`;
  const password = passwordOverride || DEFAULT_PASSWORD;
  const response = await getAuthAgent()
    .post('/api/v1/auth/register')
    .send({ name: DEFAULT_NAME, email, password })
    .set('Accept', 'application/json');

  if (![201, 200].includes(response.status)) {
    logResponse(response, 'register failed');
    throw new Error(response.body?.message || 'Registration failed');
  }

  cachedEmail = email;
  cachedToken = response.body?.data?.token;
  return { email, token: cachedToken };
};

const ensureTestUser = async () => {
  if (cachedToken) return cachedToken;
  const email = cachedEmail || `test+${Date.now()}@example.com`;
  try {
    cachedToken = await loginWith(email, DEFAULT_PASSWORD);
    cachedEmail = email;
    return cachedToken;
  } catch (error) {
    await registerTestUser(email, DEFAULT_PASSWORD);
    cachedToken = await loginWith(cachedEmail, DEFAULT_PASSWORD);
    return cachedToken;
  }
};

module.exports = {
  loginAndGetToken: ensureTestUser,
  registerTestUser,
  getAuthAgent,
};
