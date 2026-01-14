import ImageKit from "imagekit-javascript";
import { getImagekitAuthEndpoint } from './runtimeUrls';

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

  return data;
};

export const uploadImage = async (file) => {
  validateFile(file);
  const auth = await fetchAuth();

  return new Promise((resolve, reject) => {
    imagekit.upload(
      {
        file,
        fileName: `${Date.now()}-${file.name}`,
        folder: "explore-fusion",
        token: auth.token,
        signature: auth.signature,
        expire: auth.expire,
      },
      (err, result) => {
        if (err) reject(err);
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
  const customMetadata = {
    postId: safePostId,
    postedById: safeUserId,
    postedByName: postedBy?.name ? String(postedBy.name).slice(0, 80) : undefined,
    location: location ? String(location).slice(0, 120) : undefined,
  };

  return new Promise((resolve, reject) => {
    imagekit.upload(
      {
        file,
        fileName: `${Date.now()}-${file.name}`,
        folder,
        tags,
        customMetadata,
        token: auth.token,
        signature: auth.signature,
        expire: auth.expire,
      },
      (err, result) => {
        if (err) reject(err);
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