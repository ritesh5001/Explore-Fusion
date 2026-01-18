const logOnFailure = (response, label) => {
  if (!response) {
    console.error(`[${label}] No response received`);
    return;
  }
  if (response.status >= 400) {
    console.error(`[${label}] status=${response.status}`, response.body || response.text);
  }
};

const expectStatus = (response, expected, label) => {
  const matches = Array.isArray(expected) ? expected.includes(response.status) : response.status === expected;
  if (!matches) {
    logOnFailure(response, label);
  }
  expect(matches).toBeTruthy();
};

const expectJson = (response, label) => {
  if (!response?.body) {
    console.error(`[${label}] response body missing`, response?.text);
  }
  expect(response?.body).toBeDefined();
};

module.exports = { expectStatus, expectJson, logOnFailure };
