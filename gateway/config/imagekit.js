const ImageKit = require('imagekit');

const required = ['IMAGEKIT_PUBLIC_KEY', 'IMAGEKIT_PRIVATE_KEY', 'IMAGEKIT_URL_ENDPOINT'];
for (const key of required) {
  if (!process.env[key]) {
    console.warn(`[imagekit] Missing env var ${key}`);
  }
}

let imagekitClient = null;

const getImagekit = () => {
  if (imagekitClient) return imagekitClient;

  imagekitClient = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
  });

  return imagekitClient;
};

module.exports = { getImagekit };
