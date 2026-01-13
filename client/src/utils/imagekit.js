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

export { imagekit };