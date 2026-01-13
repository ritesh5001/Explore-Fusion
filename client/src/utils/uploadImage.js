import ImageKit from "imagekit-javascript";

const imagekit = new ImageKit({
  publicKey: import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY,
  urlEndpoint: import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT,
});

const MAX_BYTES = 5 * 1024 * 1024;

const getAuthEndpoint = () => {
  return (
    import.meta.env.VITE_IMAGEKIT_AUTH_ENDPOINT ||
    "http://localhost:5050/api/v1/imagekit-auth"
  );
};

const getAccessToken = () => {
  const raw = localStorage.getItem("token");
  if (raw) return raw;
  const userRaw = localStorage.getItem("user");
  if (!userRaw) return null;
  try {
    const parsed = JSON.parse(userRaw);
    return parsed?.token || null;
  } catch {
    return null;
  }
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

const fetchAuth = async () => {
  const token = getAccessToken();
  if (!token) {
    throw new Error("Not logged in: please login to upload");
  }

  const resp = await fetch(getAuthEndpoint(), {
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
        folder: "/explore-fusion",
        token: auth.token,
        signature: auth.signature,
        expire: auth.expire,
      },
      (err, result) => {
        if (err) {
          reject(new Error("Upload failed"));
          return;
        }
        resolve(result.url);
      }
    );
  });
};