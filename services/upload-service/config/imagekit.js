const ImageKit = require("imagekit");

let client = null;

const required = [
  'IMAGEKIT_PUBLIC_KEY',
  'IMAGEKIT_PRIVATE_KEY',
  'IMAGEKIT_URL_ENDPOINT',
];

const getImagekit = () => {
  if (client) return client;

  const missing = required.filter((key) => !process.env[key]);
  if (missing.length) {
    throw new Error(
      `Missing env vars: ${missing.join(', ')}. ` +
        `Add them to services/upload-service/.env (recommended) or your shell environment.`
    );
  }

  client = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
  });

  return client;
};

module.exports = { getImagekit };