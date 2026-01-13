const ImageKit = require('imagekit');

const required = ['IMAGEKIT_PUBLIC_KEY', 'IMAGEKIT_PRIVATE_KEY', 'IMAGEKIT_URL_ENDPOINT'];
for (const k of required) {
  if (!process.env[k]) {
    // eslint-disable-next-line no-console
    console.warn(`[imagekit] Missing env var ${k}`);
  }
}

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

module.exports = imagekit;
