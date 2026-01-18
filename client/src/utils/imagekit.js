import ImageKit from "imagekit-javascript";
import { getImagekitAuthEndpoint } from './runtimeUrls';

const isDev = import.meta.env.DEV;

const hasImagekitConfig = () => {
  return !!(import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY && import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT);
};

const debug = (...args) => {
  if (!isDev) return;
  try {
    console.debug(...args);
  } catch {
    // noop
  }
};

const coerceAuth = (data) => {
  const token = data?.token ? String(data.token) : '';
  const signature = data?.signature ? String(data.signature) : '';
  let expire = data?.expire;
  if (typeof expire === 'string' && expire.trim()) expire = Number(expire);
  if (typeof expire !== 'number' || Number.isNaN(expire)) expire = 0;
  // Some implementations accidentally return ms timestamps.
  if (expire > 1e12) expire = Math.floor(expire / 1000);

  if (!token || !signature || !expire) {
    throw new Error('Upload auth failed: malformed response');
  }

  const now = Math.floor(Date.now() / 1000);
  if (expire <= now + 5) {
    throw new Error('Upload auth expired: please retry');
  }

  return { token, signature, expire };
};

const extractImagekitErrorMessage = (err) => {
  const status = err?.statusCode || err?.response?.status || err?.status;
  const msg = err?.message || err?.help || err?.response?.statusText;
  const details = err?.response?.data || err?.response || err?.error;

  if (isDev) {
    // In dev, surface the response once per failure for debugging.
    // Never log secrets; this should not include private keys.
    console.error('[ImageKit Upload Failed]', {
      status,
      message: msg,
      response: details,
    });
  }

  if (status) return `Image upload failed (HTTP ${status}): ${msg || 'Bad request'}`;
  return msg || 'Image upload failed';
};

const imagekitPublicKey = import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY;
const imagekitUrlEndpoint = import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT;

if (!imagekitUrlEndpoint) {
  throw new Error('VITE_IMAGEKIT_URL_ENDPOINT is required to initialize ImageKit');
}

const imagekit = new ImageKit({
  publicKey: imagekitPublicKey,
  urlEndpoint: imagekitUrlEndpoint,
});

export const IMAGEKIT_FOLDERS = {
  post: 'explore-fusion/posts',
  itinerary: 'explore-fusion/itineraries',
  profile: 'explore-fusion/profiles',
  package: 'explore-fusion/packages',
  creator: 'explore-fusion/creators',
  default: 'explore-fusion/misc',
};

const MAX_BYTES = 5 * 1024 * 1024;

const resolveFolder = (type) => {
  const key = type ? String(type) : 'default';
  const folder = IMAGEKIT_FOLDERS[key] || IMAGEKIT_FOLDERS.default;
  return folder || 'explore-fusion/misc';
};

const logUploadFolder = (folder) => {
  if (!isDev) return;
  console.info('[ImageKit] Upload folder:', folder);
};

const validateFile = (file) => {
  if (!file) throw new Error("No file selected");
  if (!file.type || !file.type.startsWith("image/")) {
    throw new Error("Invalid format: please select an image file");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("File too large: max 5MB");
  }
};

// Production-safe: our backend may require Authorization for /imagekit-auth.
// The ImageKit SDK doesn't attach auth headers to authenticationEndpoint, so we sign manually.
const fetchAuth = async () => {
  if (!hasImagekitConfig()) {
    throw new Error('Image uploads are not configured. Set VITE_IMAGEKIT_PUBLIC_KEY and VITE_IMAGEKIT_URL_ENDPOINT.');
  }

  const token = localStorage.getItem("token");
  if (!token) throw new Error("Not logged in: please login to upload");

  const endpoint = getImagekitAuthEndpoint();

  const resp = await fetch(endpoint, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await resp.json().catch(() => null);
  if (!resp.ok) {
    const msg = data?.message || "Upload auth failed";
    throw new Error(msg);
  }

  if (!data?.token || !data?.signature || !data?.expire) {
    throw new Error("Upload auth failed: malformed response");
  }

  const auth = coerceAuth(data);

  debug('[ImageKit] auth ok', {
    endpoint,
    expire: auth.expire,
    tokenLen: auth.token.length,
    signatureLen: auth.signature.length,
    publicKey: import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY
      ? `${String(import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY).slice(0, 10)}…`
      : null,
    urlEndpoint: import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT || null,
  });

  return auth;
};

const debugUploadIntent = ({ file, fileName, auth, folder }) => {
  if (!isDev) return;
  debug('[ImageKit] upload intent', {
    fileName,
    folder,
    size: file?.size,
    type: file?.type,
    expire: auth?.expire,
    tokenLen: auth?.token ? String(auth.token).length : 0,
    signatureLen: auth?.signature ? String(auth.signature).length : 0,
  });
};

const uploadToImageKit = ({ file, fileName, folder, auth }) => {
  return new Promise((resolve, reject) => {
    imagekit.upload(
      {
        file,
        fileName,
        folder,
        publicKey: import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY,
        token: auth.token,
        signature: auth.signature,
        expire: auth.expire,
      },
      (err, result) => {
        if (err) reject(new Error(extractImagekitErrorMessage(err)));
        else resolve(result);
      }
    );
  });
};

export const uploadImage = async (file, { type = 'default' } = {}) => {
  validateFile(file);
  const auth = await fetchAuth();

  const folder = resolveFolder(type);
  logUploadFolder(folder);

  const fileName = `${Date.now()}-${file?.name || 'image'}`;
  debugUploadIntent({ file, fileName, auth, folder });

  const result = await uploadToImageKit({ file, fileName, folder, auth });
  return result.url;
};

const sanitizeSegment = (v) => String(v || '').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 80);

export const uploadPostImage = async ({ file, postId, postedBy, location }) => {
  validateFile(file);
  if (!postId) throw new Error('Missing post id');

  const auth = await fetchAuth();
  const folder = resolveFolder('post');
  logUploadFolder(folder);
  // Keep uploads compatible/reliable: send ONLY required fields to ImageKit.
  // Use fileName to encode post/user info for traceability without tags/customMetadata.
  const safePostId = sanitizeSegment(postId);
  const safeUserId = sanitizeSegment(postedBy?._id || postedBy?.id || 'unknown');
  const safeLoc = sanitizeSegment(location || '');
  const baseName = `${safePostId}-${safeUserId}${safeLoc ? `-${safeLoc}` : ''}`;
  const fileName = `${Date.now()}-${baseName}-${file?.name || 'post-image'}`;
  debugUploadIntent({ file, fileName, auth, folder });

  const result = await uploadToImageKit({ file, fileName, folder, auth });
  return {
    url: result.url,
    fileId: result.fileId,
  };
};

export { imagekit };