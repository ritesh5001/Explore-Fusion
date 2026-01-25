const env = import.meta.env;

// These flags keep unimplemented services quiet until the backend finishes.
// Flip them to `true` via environment variables once the APIs are available.
export const MATCHES_SERVICE_ENABLED = env.VITE_MATCHES_SERVICE_ENABLED === 'true';
export const NOTIFICATIONS_SERVICE_ENABLED = env.VITE_NOTIFICATIONS_SERVICE_ENABLED === 'true';
export const CHAT_SERVICE_ENABLED = env.VITE_CHAT_SERVICE_ENABLED === 'true';
export const IMAGEKIT_UPLOADS_ENABLED = env.VITE_IMAGEKIT_UPLOAD_ENABLED === 'true';

export const IMAGEKIT_UPLOADS_DISABLED_MESSAGE =
  'Image uploads are temporarily disabled until the backend signature endpoint is live.';