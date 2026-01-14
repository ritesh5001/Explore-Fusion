import ImageKit from "imagekit-javascript";
import { getImagekitAuthEndpoint } from './runtimeUrls';

const isDev = import.meta.env.DEV;

const hasImagekitConfig = () => {
  return !!(import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY && import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT);
};

const debug = (...args) => {
  if (!isDev) return;
  try {
    // eslint-disable-next-line no-console
    console.debug(...args);
  } catch {
    // noop
  }
};

const compactObject = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined && v !== null));
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
    debug('[ImageKit] upload error', {
      status,
      message: msg,
      // Avoid printing secrets; this is best-effort.
      details,
    });
  }

  if (status) return `Image upload failed (HTTP ${status}): ${msg || 'Bad request'}`;
  return msg || 'Image upload failed';
};

const imagekit = new ImageKit({
  publicKey: import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY,
  urlEndpoint: import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT,
  authenticationEndpoint:
    getImagekitAuthEndpoint(),
});

const MAX_BYTES = 5 * 1024 * 1024;

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
    method: "POST",
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

export const uploadImage = async (file) => {
  validateFile(file);
  const auth = await fetchAuth();

  const fileName = `${Date.now()}-${file?.name || 'image'}`;
  debug('[ImageKit] uploading image', {
    fileName,
    folder: 'explore-fusion',
    size: file?.size,
    type: file?.type,
  });

  return new Promise((resolve, reject) => {
    imagekit.upload(
      {
        file,
        fileName,
        folder: "explore-fusion",
        token: auth.token,
        signature: auth.signature,
        expire: auth.expire,
      },
      (err, result) => {
        if (err) reject(new Error(extractImagekitErrorMessage(err)));
        else resolve(result.url);
      }
    );
  });
};

const sanitizeFolderSegment = (v) => String(v || '').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 80);

export const uploadPostImage = async ({ file, postId, postedBy, location }) => {
  validateFile(file);
  if (!postId) throw new Error('Missing post id');

  const auth = await fetchAuth();
  const safePostId = sanitizeFolderSegment(postId);
  const safeUserId = sanitizeFolderSegment(postedBy?._id || postedBy?.id || 'unknown');
  const folder = `explore-fusion/posts/${safePostId}/${safeUserId}`;

  const tags = [`post:${safePostId}`, `user:${safeUserId}`];
  const customMetadata = compactObject({
    postId: safePostId,
    postedById: safeUserId,
    postedByName: postedBy?.name ? String(postedBy.name).slice(0, 80) : undefined,
    location: location ? String(location).slice(0, 120) : undefined,
  });

  const fileName = `${Date.now()}-${file?.name || 'post-image'}`;
  debug('[ImageKit] uploading post image', {
    fileName,
    folder,
    tags,
    customMetadataKeys: Object.keys(customMetadata || {}),
    size: file?.size,
    type: file?.type,
  });

  return new Promise((resolve, reject) => {
    imagekit.upload(
      {
        file,
        fileName,
        folder,
        tags,
        customMetadata,
        token: auth.token,
        signature: auth.signature,
        expire: auth.expire,
      },
      (err, result) => {
        if (err) reject(new Error(extractImagekitErrorMessage(err)));
        else
          resolve({
            url: result.url,
            fileId: result.fileId,
            folder,
          });
      }
    );
  });
};

export { imagekit };